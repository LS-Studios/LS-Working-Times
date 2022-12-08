import React, {useEffect, useState} from 'react';
import "./Prognosis.css"
import InputCard from "../cards/Input/InputCard";
import Card from "../cards/Card";
import ToggleContent from "../cards/ToggleInput/ToggleContent";
import DateTimeInput from "../cards/timeinput/DateTimeInput";
import {getThemeClass, setTheme} from "../helper/Theme/Theme";
import CheckboxCard from "../cards/Checkbox/CheckboxCard";
import {getLanguage, setLanguage, t} from "../helper/LanguageTransaltion/Transalation";
import WorkingDayCard from "./workingday/WorkingDayCard";
import {get, getDatabase, onChildAdded, onChildChanged, onChildRemoved, onValue, ref} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import ButtonCard from "../cards/Button/ButtonCard";
import {DateTime} from "../timing/timer/DateTime";
import {getDateFromString, getDateWithoutTime, getEndOfWeek, getStartOfWeek} from "../helper/Helper";
import {TimerClass} from "../timing/timer/TimerClass";
import {useNavigate} from "react-router-dom";
import {useInterval} from "../helper/UseInterval";
import {loadingSpinner} from "../spinner/LoadingSpinner";
import PrognosisCard from "./card/PrognosisCard";
import DateTimeInputCard from "../cards/timeinput/DateTimeInputCard";

function Prognosis({setCurrentMenu}) {
    const navigate = useNavigate()

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
    const [averageEndTime, setAverageEndTime] = useState({
        hours: "18",
        minutes: "00",
        seconds: "00"
    })
    const [averageBreakTime, setAverageBreakTime] = useState({
        hours: "00",
        minutes: "30",
        seconds: "00"
    })

    const [workingDays, setWorkingDays] = useState([
        [true, 0], [true, 1], [true, 2], [true, 3], [true, 4], [false, 5], [false, 6]
    ])

    useEffect(() => {
        setCurrentMenu(3)

        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const db = getDatabase(lsWorkingTimesApp)
        const auth = getAuth(lsWalletApp)

        const unsubscribeArray = []

        unsubscribeArray.push(
            auth.onAuthStateChanged(function(user) {
                if (user == null) {
                    unsubscribeArray.forEach(unsubscribe => unsubscribe())
                    navigate("/login")
                    return
                }

                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/start-time"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "") {
                            setStartTime(null)
                        }
                        else
                            setStartTime(DateTime.dateTimeFromString(data).getDate())
                    }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/work-stop-time"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setWorkStopTime(null)
                        else
                            setWorkStopTime(DateTime.dateTimeFromString(data))
                    }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/work-taken-stop"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setWorkTakenStop(new DateTime(0,0,0))
                        else
                            setWorkTakenStop(DateTime.dateTimeFromString(data))
                    }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/work-is-running"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setWorkIsRunning(false)
                        else
                            setWorkIsRunning(data)
                    }))

                get(ref(db, "/users/" + user.uid + "/language")).then((snapshot) => {
                    if (snapshot.exists()) {
                        setLanguage(snapshot.val())
                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });

                get(ref(db, "/users/" + user.uid + "/theme")).then((snapshot) => {
                    if (snapshot.exists()) {
                        setTheme(snapshot.val())
                        document.body.classList.forEach((v, k, p) => {
                            document.body.classList.remove(v)
                        })
                        document.body.classList.add(getThemeClass("body"))
                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });

                unsubscribeArray.push(
                    onChildAdded(ref(db, "/users/" + user.uid + "/saved"), snapshot => {
                        const value = snapshot.val()

                        setAlreadyWorkedTimeIsLoading([true, true])

                        if (value != null) {
                            setSaved(prevState => (
                                [value].concat(prevState)
                            ))
                        }
                    }))
                unsubscribeArray.push(
                    onChildChanged(ref(db, "/users/" + user.uid + "/saved"), changedSnapshot => {
                        const value = changedSnapshot.val()
                        if (value != null) {
                            get(ref(db, "/users/" + user.uid + "/saved")).then((snapshot) => {
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
                    onChildRemoved(ref(db, "/users/" + user.uid + "/saved"), snapshot => {
                        const value = snapshot.val()
                        if (value != null) {
                            setSaved((current) =>
                                current.filter((save) => save.id !== value.id)
                            );
                        }
                    }))
            })
        )
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

    const calculatePrognosis = () => {
        const calculation = []

        const hoursPerWeekDateTime = new DateTime(parseInt(hoursPerWeekInput), 0, 0)
        const alreadyWorkedDateTime = alreadyWorkedState == 1 ? new DateTime(
            parseInt(alreadyWorkedTimeInput.hours),
            parseInt(alreadyWorkedTimeInput.minutes),
            parseInt(alreadyWorkedTimeInput.seconds)
        ) : alreadyWorkedTimerTime

        const timeLeftToWork = hoursPerWeekDateTime.subtractDateTime(alreadyWorkedDateTime)

        let daysLeft = 0;

        const currentDay = new Date().getDay()

        workingDays.forEach(workingDay => {
            const showCurrentDay = workingDay[1] === currentDay-1 && new DateTime(averageStartTime.hours, averageStartTime.minutes, averageStartTime.seconds).isLarger(DateTime.dateTimeFromDate(new Date()))
            if (((workingDay[1] > currentDay-1) || showCurrentDay) && workingDay[0]) daysLeft++
        })

        const timeToWorkOnLeftDays = timeLeftToWork.divideDateTime(new DateTime(daysLeft, daysLeft, daysLeft))

        workingDays.forEach((workingDay, i) => {
            const showCurrentDay = workingDay[1] === currentDay-1 && new DateTime(averageStartTime.hours, averageStartTime.minutes, averageStartTime.seconds).isLarger(DateTime.dateTimeFromDate(new Date()))

            if ((workingDay[1] > currentDay-1 || showCurrentDay) && workingDay[0]) {
                const startTime = new DateTime(averageStartTime.hours, averageStartTime.minutes, averageStartTime.seconds)
                const breakTime = new DateTime(averageBreakTime.hours, averageBreakTime.minutes, averageBreakTime.seconds)
                const workTime = timeToWorkOnLeftDays
                const endTime = startTime.addDateTime(workTime).addDateTime(breakTime)

                calculation.push([t("prognosis.weekDay"+i), workTime.toTimeString(),
                    breakTime.toTimeString(), startTime.toTimeString(), endTime.toTimeString()])
            }
        })

        setCalculatedState(calculation)
    }

    return (
        <div className="prognosis">
            <InputCard title={t("prognosis.hoursPerWeek")} inputType={1} focusOnClick={true} currentState={hoursPerWeekInput} setCurrentState={setHoursPerWeekInput}/>
            <Card cardContent={
                <div>
                    <ToggleContent title={t("prognosis.alreadyWorked")} currentState={alreadyWorkedState} setCurrentState={setAlreadyWorkedState} toggleList={[t("prognosis.current"), t("prognosis.custom")]}/>
                    <div className={getThemeClass("divider")}/>
                    <div className="prognosisAlreadyWorkedToggle">
                        {
                            alreadyWorkedState == 0 ? <div>{alreadyWorkedTimeIsLoading[0] ? loadingSpinner : alreadyWorkedTimerTime.toTimeString()}</div> : <DateTimeInput currentTimeState={alreadyWorkedTimeInput} setCurrentTimeState={setAlreadyWorkedTimeInput}/>
                        }
                    </div>
                </div>
            }/>

            <DateTimeInputCard title={t("prognosis.averageStartTime")} currentTimeState={averageStartTime} setCurrentTimeState={setAverageStartTime} />
            <DateTimeInputCard title={t("prognosis.averageEndTime")} currentTimeState={averageEndTime} setCurrentTimeState={setAverageEndTime} />
            <DateTimeInputCard title={t("prognosis.averageBreakTime")} currentTimeState={averageBreakTime} setCurrentTimeState={setAverageBreakTime} />

            <CheckboxCard title={t("prognosis.workingDays")} checkboxList={workingDays.map((_, i) => t("prognosis.weekDay"+i))}
                currentState={workingDays.map(workingDay => workingDay[0])}
                          setCurrentState={
                                (newWorkingDays) => {
                                    const formattedNewWorkingDays = []
                                    newWorkingDays.forEach((newWorkingDay, i) => {
                                        formattedNewWorkingDays.push([newWorkingDay, i])
                                    })
                                    setWorkingDays(formattedNewWorkingDays)
                                }}/>
            <div>
                {
                    workingDays.map((workingDay, i) => {
                        if (workingDay[0]) {
                            return <WorkingDayCard key={i} day={{name: t("prognosis.weekDay"+i)}}/>
                        }
                    })
                }
            </div>

            <Card cardContent={
                <div>
                    <div className="contentInWeekCardTitle"><b>Prognosis</b></div>
                    {
                        calculatedState.map((calculated, i) => {
                            return <PrognosisCard key={i} data={calculated} isExpanded={false} />
                        })
                    }
                </div>
            } />

            {/*<ButtonCard title="Calculate" action={calculatePrognosis}/>*/}
        </div>
    );
}

export default Prognosis;