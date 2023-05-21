import React, {useEffect, useState} from 'react';
import "./Prognosis.css"
import WorkingDays from "../../components/workingday/WorkingDays";
import {get, getDatabase, onChildAdded, onChildChanged, onChildRemoved, onValue, ref} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/config/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/config/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {DateTime} from "../../classes/DateTime";
import {useNavigate} from "react-router-dom";
import {useInterval} from "../../customhook/UseInterval";
import PrognosisCard from "../../cards/prognosis/PrognosisCard";
import {
    Spinner,
    Card,
    InputCard,
    TimeInputContent,
    TimeInputCard,
    CheckboxListCard,
    Title, Divider, DropdownContent, useContextTranslation, useContextTheme, useContextUserAuth
} from "@LS-Studios/components"
import {getDateFromString, getEndOfWeek, getStartOfWeek} from "@LS-Studios/date-helper"
import {getFirebaseDB} from "../../firebase/FirebaseHelper";

function Prognosis({setCurrentMenu}) {
    const translation = useContextTranslation()
    const theme = useContextTheme()
    const navigate = useNavigate()
    const auth = useContextUserAuth()

    const [saved, setSaved] = useState([]);
    const [startTime, setStartTime] = useState(null);

    const [workIsRunning, setWorkIsRunning] = useState(false);
    const [workStopTime, setWorkStopTime] = useState(null);
    const [workTakenStop, setWorkTakenStop] = useState(new DateTime(0, 0, 0));

    const [hoursPerWeekInput, setHoursPerWeekInput] = useState("40")
    const [alreadyWorkedState, setAlreadyWorkedState] = useState(0)
    const [alreadyWorkedTimerTime, setAlreadyWorkedTimerTime] = useState(new DateTime(0,0,0))
    const [alreadyWorkedTimeInput, setAlreadyWorkedTimeInput] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00"
    })
    const [alreadyWorkedTimeIsLoading, setAlreadyWorkedTimeIsLoading] = useState([true, false])
    const [calculatedState, setCalculatedState] = useState([]);

    const [averageStartTime, setAverageStartTime] = useState({
        hours: "08",
        minutes: "00",
        seconds: "00"
    })

    const [averageBreakTime, setAverageBreakTime] = useState({
        hours: "00",
        minutes: "30",
        seconds: "00"
    })

    const [workingDays, setWorkingDays] = useState([
        //Monday
        [true, 0, [[new DateTime(7,0,0), new DateTime(18,0,0)]], 0],
        //Tuesday
        [true, 1, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
        //Wednesday
        [true, 2, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
        //Thursday
        [true, 3, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
        //Friday
        [true, 4, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
        //Saturday
        [false, 5, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
        //Sunday
        [false, 6, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
    ])

    useEffect(() => {
        setCurrentMenu(3)

        const unsubscribeArray = []

        const firebaseDB = getFirebaseDB()

        unsubscribeArray.push(
            onValue(ref(firebaseDB, "/users/" + auth.user.id + "/start-time"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "") {
                    setStartTime(null)
                }
                else
                    setStartTime(DateTime.dateTimeFromString(data).getDate())
            }))
        unsubscribeArray.push(
            onValue(ref(firebaseDB, "/users/" + auth.user.id + "/work-stop-time"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setWorkStopTime(null)
                else
                    setWorkStopTime(DateTime.dateTimeFromString(data))
            }))
        unsubscribeArray.push(
            onValue(ref(firebaseDB, "/users/" + auth.user.id + "/work-taken-stop"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setWorkTakenStop(new DateTime(0,0,0))
                else
                    setWorkTakenStop(DateTime.dateTimeFromString(data))
            }))
        unsubscribeArray.push(
            onValue(ref(firebaseDB, "/users/" + auth.user.id + "/work-is-running"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setWorkIsRunning(false)
                else
                    setWorkIsRunning(data)
            }))

        unsubscribeArray.push(
            onChildAdded(ref(firebaseDB, "/users/" + auth.user.id + "/saved"), snapshot => {
                const value = snapshot.val()

                setAlreadyWorkedTimeIsLoading([true, true])

                if (value != null) {
                    setSaved(prevState => (
                        [value].concat(prevState)
                    ))
                }
            }))
        unsubscribeArray.push(
            onChildChanged(ref(firebaseDB, "/users/" + auth.user.id + "/saved"), changedSnapshot => {
                const value = changedSnapshot.val()
                if (value != null) {
                    get(ref(firebaseDB, "/users/" + auth.user.id + "/saved")).then((snapshot) => {
                        if (snapshot.exists()) {
                            const saves = []
                            snapshot.forEach(childSnapshot => {
                                saves.push(childSnapshot.val())
                            })

                            const newState = saves.map(obj => {
                                if (obj.id === value.id) {
                                    return value;
                                }

                                return obj;
                            });

                            setSaved(newState);
                        } else {
                            console.log("No data available");
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
                }
            }))
        unsubscribeArray.push(
            onChildRemoved(ref(firebaseDB, "/users/" + auth.user.id + "/saved"), snapshot => {
                const value = snapshot.val()
                if (value != null) {
                    setSaved((current) =>
                        current.filter((save) => save.id !== value.id)
                    );
                }
            }))

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [])

    useInterval(() => {
        if (alreadyWorkedTimeIsLoading[1])
            setAlreadyWorkedTimeIsLoading([false, false])

        getWorkedTimeInCurrentWeek()

        calculatePrognosis()
    }, 1000);

    const getWorkedTimeInCurrentWeek = (bool=true) => {
        const savesThisWeek = saved.filter(save => {
            const saveDate = getDateFromString(save.date)
            return saveDate >= getStartOfWeek(new Date()) && saveDate <= getEndOfWeek(new Date())
        })

        let workedThisWeek = new DateTime(0, 0, 0)

        savesThisWeek.forEach(save => {
            workedThisWeek = workedThisWeek.addDateTime(DateTime.dateTimeFromString(save.worked))
        })

        if (workStopTime != null) {
            const dateTimeDiff = (
                bool ? new DateTime() : workStopTime
            ).getDateDiffToDateTime(
                DateTime.dateTimeFromDate(startTime),
                workTakenStop
            )

            workedThisWeek = workedThisWeek.addDateTime(new DateTime(dateTimeDiff.getHours, dateTimeDiff.getMinutes, dateTimeDiff.getSeconds))
        }

        setAlreadyWorkedTimerTime(workedThisWeek)
    }

    const checkIfIsStillInWeek = (dayIndex) => {
        const currentDay = new Date().getDay()

        const startTimeDateTime = new DateTime(averageStartTime.hours, averageStartTime.minutes, averageStartTime.seconds)
        const startTimeDiff = startTimeDateTime.subtractDateTime(new DateTime())
        const alreadyAfterStartTime = (startTimeDiff.hours < 0 || startTimeDiff.minutes < 0 || startTimeDiff.seconds < 0)

        const isCurrentDay = !alreadyAfterStartTime || (alreadyAfterStartTime && startTime != null)

        return (dayIndex > currentDay-1 || (dayIndex === currentDay-1 && isCurrentDay))
    }

    const calculatePrognosis = () => {
        const calculation = []

        const alreadyWorked = alreadyWorkedState === 1 ? new DateTime(
            parseInt(alreadyWorkedTimeInput.hours),
            parseInt(alreadyWorkedTimeInput.minutes),
            parseInt(alreadyWorkedTimeInput.seconds)
        ) : alreadyWorkedTimerTime

        let timeLeftToWork = new DateTime(parseInt(hoursPerWeekInput),0,0).subtractDateTime(alreadyWorked)

        if (timeLeftToWork.hours < 0 || timeLeftToWork.minutes < 0 || timeLeftToWork.seconds < 0) {
            setCalculatedState([])
            return
        }

        workingDays.forEach((workingDay, i) => {
            if (workingDay[0] && checkIfIsStillInWeek(i) && workingDay[3] === 1) {
                const rangeWorkingCalculation = []

                let workingTimeInRanges = new DateTime(0,0,0)

                workingDay[2].forEach(workingDayRange => {
                    const rangeStartTime = new DateTime(workingDayRange[0].hours, workingDayRange[0].minutes, workingDayRange[0].seconds)
                    const rangeEndTime = new DateTime(workingDayRange[1].hours, workingDayRange[1].minutes, workingDayRange[1].seconds)
                    const rangeWorkingTime = rangeEndTime.subtractDateTime(rangeStartTime)
                    timeLeftToWork = timeLeftToWork.subtractDateTime(rangeWorkingTime)
                    workingTimeInRanges = workingTimeInRanges.addDateTime(rangeWorkingTime)

                    rangeWorkingCalculation.push([rangeStartTime.toTimeString(), rangeEndTime.toTimeString()])
                })

                const breakTime = new DateTime(averageBreakTime.hours, averageBreakTime.minutes, averageBreakTime.seconds)

                if (workingTimeInRanges.hours >= 0 && workingTimeInRanges.minutes >= 0 && workingTimeInRanges.seconds >= 0) {
                    calculation.push([i, true, rangeWorkingCalculation, workingTimeInRanges.toTimeString(), breakTime.toTimeString()])
                }
            }
        })

        let undefinedDays = 0;

        workingDays.forEach((workingDay, i) => {
            if (workingDay[0] && checkIfIsStillInWeek(i) && workingDay[3] === 0) undefinedDays++
        })

        const timeToWorkOnUndefinedDays = timeLeftToWork.divideDateTime(new DateTime(undefinedDays, undefinedDays, undefinedDays))

        workingDays.forEach((workingDay, i) => {
            if (workingDay[0] && checkIfIsStillInWeek(i) && workingDay[3] === 0) {
                const startTime = new DateTime(averageStartTime.hours, averageStartTime.minutes, averageStartTime.seconds)
                const breakTime = new DateTime(averageBreakTime.hours, averageBreakTime.minutes, averageBreakTime.seconds)
                const workTime = timeToWorkOnUndefinedDays
                const endTime = startTime.addDateTime(workTime).addDateTime(breakTime)

                if (workTime.hours < 0 || workTime.minutes < 0 || workTime.seconds < 0) {
                    calculation.push([i, false, "00:00:00",
                        "00:00:00", "No more work", "No more work"])
                } else {
                    calculation.push([i, false, workTime.toTimeString(),
                        breakTime.toTimeString(), startTime.toTimeString(), endTime.toTimeString()])
                }
            }
        })

        setCalculatedState(calculation)
    }

    return (
        <div className="prognosis">
            <Card title={translation.translate("prognosis.menuName")}>
                {
                    alreadyWorkedTimeIsLoading[0] ? <Spinner type='dots'/> :
                        <div className="prognosisCard">
                            {
                                calculatedState.length > 0 ? calculatedState.sort((a,b) => { return a[0]-b[0] }).map((calculated, i) => {
                                    return <PrognosisCard key={i} data={calculated} isExpanded={false} />
                                }) :  <div className="noContent">{translation.translate("prognosis.noMoreWorkThisWeek")}</div>
                            }
                        </div>
                }
            </Card>

            <InputCard title={translation.translate("prognosis.hoursPerWeek")} inputType={1} focusOnClick={true} currentState={hoursPerWeekInput} setCurrentState={setHoursPerWeekInput}/>

            <Card title={translation.translate("prognosis.alreadyWorked")}>
                <DropdownContent items={[translation.translate("prognosis.current"), translation.translate("prognosis.custom")]} currentState={alreadyWorkedState} setCurrentState={setAlreadyWorkedState}/>

                <Divider />

                <div className="prognosisAlreadyWorkedToggle">
                    {
                        alreadyWorkedState.pos === 0 ?
                            <div style={{marginTop:10}}>
                                {
                                    alreadyWorkedTimeIsLoading[0] ?
                                    <div style={{display: "flex", justifyContent:"center"}}>
                                        <Spinner type="dots" />
                                    </div> :
                                    <b>{alreadyWorkedTimerTime.toTimeString()}</b>
                                }
                            </div> :
                            <TimeInputContent
                                currentTimeState={alreadyWorkedTimeInput}
                                setCurrentTimeState={setAlreadyWorkedTimeInput}
                                maxHourValue={null}/>
                    }
                </div>
            </Card>

            <TimeInputCard title={translation.translate("prognosis.averageStartTime")} currentTimeState={averageStartTime} setCurrentTimeState={setAverageStartTime} />
            <TimeInputCard title={translation.translate("prognosis.averageBreakTime")} currentTimeState={averageBreakTime} setCurrentTimeState={setAverageBreakTime} />

            <CheckboxListCard title={translation.translate("prognosis.workingDays")} checkboxList={workingDays.map((_, i) => translation.translate("prognosis.weekDay"+i))}
                currentState={workingDays.map(workingDay => workingDay[0])}
                          setCurrentState={
                                (newStateArray) => {
                                    console.log(newStateArray)
                                    setWorkingDays(current => {
                                        const newWorkingDays = JSON.parse(JSON.stringify(current))
                                        newWorkingDays.map((newWorkingDay, i) => {
                                            newStateArray.forEach((newState, s) => {
                                                if (i === s) {
                                                    newWorkingDays[i][0] = newState
                                                }
                                            })
                                        })

                                        return newWorkingDays
                                    })
                                }}/>
            <div>
                {
                    workingDays.map((workingDay, i) => {
                        if (workingDay[0] && checkIfIsStillInWeek(i)) {
                            return <WorkingDays key={i} day={workingDay} workingDays={workingDays} setWorkingDays={setWorkingDays}/>
                        }
                    })
                }
            </div>
        </div>
    );
}

export default Prognosis;