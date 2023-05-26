import React, {useEffect, useState} from 'react';
import "./Prognosis.css"
import WorkingDay from "../../components/workingday/WorkingDay";
import {get, onChildAdded, onChildChanged, onChildRemoved, onValue, ref} from "firebase/database";
import {DateTime} from "../../classes/DateTime";
import {useInterval} from "../../customhook/UseInterval";
import PrognosisCard from "../../cards/prognosis/PrognosisCard";
import {
    Spinner,
    Card,
    InputCard,
    TimeInputContent,
    TimeInputCard,
    CheckboxListCard,
    Divider,
    DropdownContent,
    useContextTranslation,
    useContextTheme,
    useContextUserAuth,
    SpinnerType, ListCard, Layout, useContextGlobalVariables
} from "@LS-Studios/components"
import {getDateFromString, getEndOfWeek, getStartOfWeek} from "@LS-Studios/date-helper"
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";
import {Gone, List} from "@LS-Studios/general";
import useLocalStorage from "@LS-Studios/use-local-storage";

function Prognosis() {
    const translation = useContextTranslation()
    const auth = useContextUserAuth()
    const globalVariables = useContextGlobalVariables()

    const [saved, setSaved] = useState([]);
    const [startTime, setStartTime] = useState(null);

    const [workIsRunning, setWorkIsRunning] = useState(false);
    const [workStopTime, setWorkStopTime] = useState(null);
    const [workTakenStop, setWorkTakenStop] = useState(new DateTime(0, 0, 0));

    const [hoursPerWeekInput, setHoursPerWeekInput] = useLocalStorage("hoursPerWeekInput", "40")
    const [alreadyWorkedState, setAlreadyWorkedState] = useLocalStorage("alreadyWorkedState", 0)
    const [alreadyWorkedTimerTime, setAlreadyWorkedTimerTime] = useLocalStorage("alreadyWorkedTimerTime", new DateTime(0,0,0))
    const [alreadyWorkedTimeInput, setAlreadyWorkedTimeInput] = useLocalStorage("alreadyWorkedTimeInput", {
        hours: "00",
        minutes: "00",
        seconds: "00"
    })
    const [alreadyWorkedTimeIsLoading, setAlreadyWorkedTimeIsLoading] = useState([true, false])
    const [calculatedState, setCalculatedState] = useState([]);

    const [averageStartTime, setAverageStartTime] = useLocalStorage("averageStartTime", {
        hours: "08",
        minutes: "00",
        seconds: "00"
    })

    const [averageBreakTime, setAverageBreakTime] = useLocalStorage("averageBreakTime", {
        hours: "00",
        minutes: "30",
        seconds: "00"
    })

    const [workingDays, setWorkingDays] = useLocalStorage("workingDays", [
        //Monday
        [true, 0, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
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

    const currentTimerId = globalVariables.getLSVar("currentTimerId")

    useEffect(() => {
        const unsubscribeArray = []

        const firebaseDB = getFirebaseDB()

        unsubscribeArray.push(
            onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "start-time"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "") {
                    setStartTime(null)
                }
                else
                    setStartTime(DateTime.dateTimeFromString(data))
            }))
        unsubscribeArray.push(
            onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "work-stop-time"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setWorkStopTime(null)
                else
                    setWorkStopTime(DateTime.dateTimeFromString(data))
            }))
        unsubscribeArray.push(
            onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "work-taken-stop"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setWorkTakenStop(new DateTime(0,0,0))
                else
                    setWorkTakenStop(DateTime.dateTimeFromString(data))
            }))
        unsubscribeArray.push(
            onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "work-is-running"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setWorkIsRunning(false)
                else
                    setWorkIsRunning(data)
            }))

        unsubscribeArray.push(
            onChildAdded(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved"), snapshot => {
                const value = snapshot.val()

                setAlreadyWorkedTimeIsLoading([true, true])

                if (value != null) {
                    setSaved(prevState => (
                        [value].concat(prevState)
                    ))
                }
            }))
        unsubscribeArray.push(
            onChildChanged(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved"), changedSnapshot => {
                const value = changedSnapshot.val()
                if (value != null) {
                    get(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved")).then((snapshot) => {
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
            onChildRemoved(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved"), snapshot => {
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
                bool ? DateTime.currentTime() : workStopTime
            ).getDateDiffToDateTime(
                DateTime.dateTimeFromDate(startTime),
                workTakenStop
            )

            workedThisWeek = workedThisWeek.addDateTime(new DateTime(dateTimeDiff.hours, dateTimeDiff.minutes, dateTimeDiff.seconds))
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
            <ListCard title={translation.translate("prognosis.menu-name")}
                         isLoading={alreadyWorkedTimeIsLoading[0]}
                         items={calculatedState}
                         noItemsText={translation.translate("prognosis.noMoreWorkThisWeek")}
                         itemMapFunc={calculatedState.sort((a,b) => {
                             return a[0]-b[0] }
                         ).map((calculated, i) => {
                             return <PrognosisCard key={i} data={calculated} isExpanded={false} />
                         })}/>

            <InputCard title={translation.translate("prognosis.hoursPerWeek")} inputType={1} focusOnClick={true} currentState={hoursPerWeekInput} setCurrentState={setHoursPerWeekInput}/>

            <Card title={translation.translate("prognosis.alreadyWorked")}>
                <DropdownContent style={{padding:5, width: 251}} items={[translation.translate("prognosis.current"), translation.translate("prognosis.custom")]} currentState={alreadyWorkedState} setCurrentState={setAlreadyWorkedState}/>

                <Divider />

                <Gone isVisible={alreadyWorkedState.pos === 0}>
                    {
                        alreadyWorkedTimeIsLoading[0] ?
                            <div style={{display: "flex", justifyContent:"center"}}>
                                <Spinner type={SpinnerType.dots} />
                            </div> : <div style={{margin: 5}}>
                                {alreadyWorkedTimerTime.toTimeString()}
                            </div>
                    }
                </Gone>

                <Gone isGone={alreadyWorkedState.pos === 0}>
                    <TimeInputContent
                        currentTimeState={alreadyWorkedTimeInput}
                        setCurrentTimeState={setAlreadyWorkedTimeInput}
                        maxHourValue={null}/>
                </Gone>
            </Card>

            <TimeInputCard title={translation.translate("prognosis.averageStartTime")} currentTimeState={averageStartTime} setCurrentTimeState={setAverageStartTime} />
            <TimeInputCard title={translation.translate("prognosis.averageBreakTime")} currentTimeState={averageBreakTime} setCurrentTimeState={setAverageBreakTime} />

            <CheckboxListCard title={translation.translate("prognosis.workingDays")} checkboxList={workingDays.map((_, i) => translation.translate("prognosis.weekDay"+i))}
                currentState={workingDays.map(workingDay => workingDay[0])}
                setCurrentState={
                      (newStateArray) => {
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
                      }
                }
            />
            {/*{*/}
            {/*    workingDays.map((workingDay, i) => {*/}
            {/*        if (workingDay[0] && checkIfIsStillInWeek(i)) {*/}
            {/*            return <WorkingDay key={i} day={workingDay} workingDays={workingDays} setWorkingDays={setWorkingDays}/>*/}
            {/*        }*/}
            {/*    })*/}
            {/*}*/}
        </div>
    );
}

export default Prognosis;