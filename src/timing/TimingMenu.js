import React, {useEffect, useState} from 'react';
import ValueCard from "../cards/Value/ValueCard";
import {formatDate, getDateFromString, getDateWithoutTime, getEndOfWeek, getStartOfWeek} from "../helper/Helper";
import {DateTime} from "./timer/DateTime";
import Timer from "./timer/Timer";
import ButtonCard from "../cards/Button/ButtonCard";
import "./TimingMenu.css"
import {
    getDatabase,
    ref,
    onValue,
    set,
    push,
    get
} from "firebase/database"
import {useDialog} from "use-react-dialog";
import {useNavigate} from "react-router-dom";
import {TimerClass} from "./timer/TimerClass";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import ClipLoader from "react-spinners/ClipLoader";
import {t} from "../helper/LanguageTransaltion/Transalation";
import {getCurrentTheme, getThemeClass} from "../helper/Theme/Theme";
import {loadingSpinner} from "../helper/LoadingSpinner";

function TimingMenu({saved, selectedSaveDate, setSavesIsLoading}) {
    const { dialogs, openDialog } = useDialog();

    const navigate = useNavigate()

    const [currentUser, setCurrentUser] = useState(null)

    const [startTimeIsLoading, setStartTimeIsLoading] = useState(true)
    const [timersAreLoading, setTimersAreLoading] = useState(true)

    const [startTime, setStartTime] = useState(null);

    const [workTime, setWorkTime] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    })
    const [workIsRunning, setWorkIsRunning] = useState(false);
    const [workStopTime, setWorkStopTime] = useState(null);
    const [workTakenStop, setWorkTakenStop] = useState(new DateTime(0, 0, 0));

    const workTimer = new TimerClass(
        currentUser, "work",
        workTime, setWorkTime,
        startTime, workStopTime,
        workTakenStop, workIsRunning)

    const [breakTime, setBreakTime] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    })
    const [breakIsRunning, setBreakIsRunning] = useState(false);
    const [breakStopTime, setBreakStopTime] = useState(new DateTime());
    const [breakTakenStop, setBreakTakenStop] = useState(new DateTime(0, 0, 0));

    const breakTimer = new TimerClass(
        currentUser,"break",
        breakTime, setBreakTime,
        startTime, breakStopTime,
        breakTakenStop, breakIsRunning)

    const resetTimers = () => {
        workTimer.resetTimer()
        breakTimer.resetTimer()

        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        set(ref(db, "/users/" + currentUser.uid + "/start-time"), "")

        const newSaveRef = push(ref(db, "/users/" + currentUser.uid + "/saved"));

        set(newSaveRef, {
            id:newSaveRef.key,
            date:formatDate(startTime),
            startTime: startTime.toLocaleTimeString("de"),
            worked: new DateTime(workTime.hours, workTime.minutes, workTime.seconds).toTimeString(),
            break: new DateTime(breakTime.hours, breakTime.minutes, breakTime.seconds).toTimeString()
        });
    }

    const setTimerOnStartUp = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const setStartTime = () => {
            const newDate = new Date()
            set(ref(db, "/users/" + currentUser.uid + "/start-time"), newDate.toLocaleTimeString("de"))
        }

        const setStopTime = (type) => {
            const newDateTime = new DateTime()

            if (startTime == null)
                set(ref(db, "/users/" + currentUser.uid + "/" + type + "-stop-time"), newDateTime.toTimeString())
            else
                set(ref(db, "/users/" + currentUser.uid + "/" + type + "-stop-time"), startTime.toLocaleTimeString("de"))
        }

        if (startTime == null) {
            setStartTime()
        }

        if (workStopTime == null) {
            setStopTime("work")
        }

        if (breakStopTime == null) {
            setStopTime("break")
        }
    }

    const toggleOverallTimer = () => {
        setTimerOnStartUp()

        if (workIsRunning) {
            workTimer.stopTimer()
        } else {
            workTimer.startTimer()

            if (breakIsRunning)
                breakTimer.stopTimer()
        }
    }

    const toggleBreakTimer = () => {
        setTimerOnStartUp()

        if (breakIsRunning) {
            breakTimer.stopTimer()
        } else {
            breakTimer.startTimer()

            if (workIsRunning)
                workTimer.stopTimer()
        }
    }

    const getWorkedTimeInCurrentWeek = () => {
        const savesThisWeek = saved.filter(save => {
            const saveDate = getDateFromString(save.date)
            return saveDate >= getStartOfWeek(selectedSaveDate) && saveDate <= getEndOfWeek(selectedSaveDate)
        })

        const workedThisWeek = new DateTime(0, 0, 0)

        savesThisWeek.forEach(save => {
            workedThisWeek.addDateTime(DateTime.dateTimeFromString(save.worked))
        })

        if (getDateWithoutTime(selectedSaveDate) >= getStartOfWeek(new Date()) && getDateWithoutTime(selectedSaveDate) <= getEndOfWeek(new Date())) {
            workedThisWeek.addDateTime(new DateTime(workTimer.getHours, workTimer.getMinutes, workTimer.getSeconds))
        }

        return workedThisWeek.toTimeString()
    }

    function useInterval(callback, delay) {
        const intervalRef = React.useRef();
        const callbackRef = React.useRef(callback);

        React.useEffect(() => {
            callbackRef.current = callback;
        }, [callback]);

        React.useEffect(() => {
            if (typeof delay === 'number') {
                intervalRef.current = setInterval(() => callbackRef.current(), delay);

                return () => clearInterval(intervalRef.current);
            }
        }, [delay]);

        return intervalRef;
    }

    useInterval(() => {
        if (startTime != null) {
            workTimer.setByTimeDiff(false)
            breakTimer.setByTimeDiff(false)
        }

        setTimersAreLoading(false)

        if (workIsRunning) {
            workTimer.setByTimeDiff()
        }
        if (breakIsRunning) {
            breakTimer.setByTimeDiff()
        }
    }, 1000);

    useEffect(() => {
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

                setCurrentUser(user)

                set(ref(db, "/users/"+user.uid+"/email"), user.email)

                get(ref(db, "/users/" + user.uid + "/saved")).then((snapshot) => {
                    if (!snapshot.exists())
                        setSavesIsLoading(false)
                }).catch((error) => {
                    console.error(error);
                });

                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/start-time"), snapshot => {
                        const data = snapshot.val()

                        setStartTimeIsLoading(false)

                        if (data == null || data === "") {
                            setStartTime(null)
                            workTimer.resetTimer()
                            breakTimer.resetTimer()
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
                    onValue(ref(db, "/users/" + user.uid + "/break-stop-time"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setBreakStopTime(null)
                        else
                            setBreakStopTime(DateTime.dateTimeFromString(data))
                    }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/break-taken-stop"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setBreakTakenStop(new DateTime(0,0,0))
                        else
                            setBreakTakenStop(DateTime.dateTimeFromString(data))
                    }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/work-is-running"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setWorkIsRunning(false)
                        else
                            setWorkIsRunning(data)
                    }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/break-is-running"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setBreakIsRunning(false)
                        else
                            setBreakIsRunning(data)
                    }))
            }))

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [])

    return (
        <div className="timingMenu">
            <div className="timingMenuTimers">
                <ValueCard title={t("timer.date")} value={startTimeIsLoading ? loadingSpinner : (startTime != null ? formatDate(startTime) : t("timer.notStarted"))}/>
                <ValueCard title={t("timer.startTime")} value={startTimeIsLoading ? loadingSpinner : (startTime != null ? startTime.toLocaleTimeString("de") : t("timer.notStarted"))} onClick={() => {
                    if (startTime != null) {
                        openDialog("ChangeTimeDialog", {
                            value: DateTime.dateTimeFromDate(startTime).toTimeString(),
                            type: "start-time"
                        })
                    }
                }} clickable={startTime != null}/>
            </div>

            <div className="timingMenuTimers">
                <Timer name={t("timer.worked")} timer={workTimer} isLoading={timersAreLoading}/>
                <Timer name={t("timer.break")} timer={breakTimer} clickable={startTime != null} isLoading={timersAreLoading} onClick={() => {
                    if (startTime != null) {
                        openDialog("ChangeTimeDialog", {
                            value: new DateTime(breakTime.hours, breakTime.minutes, breakTime.seconds).toTimeString(),
                            type: "break-time"
                        })
                    }
                }}/>
            </div>

            <div className="timingMenuButtons">
                <ButtonCard className={startTimeIsLoading ? getThemeClass("disabled") : null} title={workTimer.getIsRunning ? t("timer.stopWorking") : t("timer.startWorking")} action={toggleOverallTimer}/>
                <ButtonCard className={startTimeIsLoading ? getThemeClass("disabled") : null} title={breakTimer.getIsRunning ? t("timer.stopBreak") : t("timer.startBreak")} action={toggleBreakTimer}/>
                <ButtonCard className={startTimeIsLoading ? getThemeClass("disabled") : (startTime != null ? getThemeClass("buttonCard") : getThemeClass("disabled"))} title={t("timer.resetAndSave")} action={startTime != null ? resetTimers : function (){}}/>
                <ValueCard className={getThemeClass("singleLineValueCard")} title={t("timer.workedTimeThisWeek")} value={timersAreLoading ? loadingSpinner : getWorkedTimeInCurrentWeek()}/>
            </div>
        </div>
    );
}

export default TimingMenu;