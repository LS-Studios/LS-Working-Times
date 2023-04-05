import React, {useEffect, useState} from 'react';
import {DateTime} from "./timer/DateTime";
import Timer from "./timer/Timer";
import "./TimingMenu.css"
import {
    getDatabase,
    ref,
    onValue,
    set,
    push,
    get
} from "firebase/database"
import {useNavigate} from "react-router-dom";
import {TimerClass} from "./timer/TimerClass";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {useInterval} from "../helper/UseInterval";
import {ButtonCard, Spinner, useComponentDialog, useComponentTheme, ValueCard} from "@LS-Studios/components";
import {useTranslation} from "@LS-Studios/use-translation";
import {formatDate, getDateFromString, getDateWithoutTime, getEndOfWeek, getStartOfWeek} from "@LS-Studios/date-helper";

function TimingMenu({saved, selectedSaveDate, setSavesIsLoading}) {
    const translation = useTranslation()
    const theme = useComponentTheme()
    const dialog = useComponentDialog();

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

        let workedThisWeek = new DateTime(0, 0, 0)

        savesThisWeek.forEach(save => {
            workedThisWeek = workedThisWeek.addDateTime(DateTime.dateTimeFromString(save.worked))
        })

        if (getDateWithoutTime(selectedSaveDate) >= getStartOfWeek(new Date()) && getDateWithoutTime(selectedSaveDate) <= getEndOfWeek(new Date())) {
            workedThisWeek = workedThisWeek.addDateTime(new DateTime(workTimer.getHours, workTimer.getMinutes, workTimer.getSeconds))
        }

        return workedThisWeek.toTimeString()
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
                    onValue(ref(db, "/users/" + user.uid + "/work-is-running"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setWorkIsRunning(false)
                        else
                            setWorkIsRunning(data)
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
                <ValueCard title={translation.translate("timer.date")} value={startTimeIsLoading ? <Spinner type="cycle" /> : (startTime != null ? formatDate(startTime) : translation.translate("timer.notStarted"))}/>
                <ValueCard title={translation.translate("timer.startTime")} value={startTimeIsLoading ? <Spinner type="cycle" /> : (startTime != null ? startTime.toLocaleTimeString("de") : translation.translate("timer.notStarted"))} clickAction={startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: DateTime.dateTimeFromDate(startTime).toTimeString(),
                        type: "start-time"
                    })
                } : null}/>
            </div>

            <div className="timingMenuTimers">
                <Timer name={translation.translate("timer.worked")} timer={workTimer} isLoading={timersAreLoading}/>
                <Timer name={translation.translate("timer.break")} timer={breakTimer} isLoading={timersAreLoading} clickAction={startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: new DateTime(breakTime.hours, breakTime.minutes, breakTime.seconds).toTimeString(),
                        type: "break-time"
                    })
                } : null}/>
            </div>

            <div className="timingMenuButtons">
                <ButtonCard disabled={startTimeIsLoading} title={workTimer.getIsRunning ? translation.translate("timer.stopWorking") : translation.translate("timer.startWorking")} clickAction={toggleOverallTimer}/>
                <ButtonCard disabled={startTimeIsLoading || startTime == null} title={breakTimer.getIsRunning ? translation.translate("timer.stopBreak") : translation.translate("timer.startBreak")} clickAction={toggleBreakTimer}/>
                <ButtonCard disabled={startTimeIsLoading || startTime == null} title={translation.translate("timer.resetAndSave")} clickAction={startTime != null ? resetTimers : function (){}}/>
                <ValueCard className={theme.getThemeClass("singleLineValueCard")} title={translation.translate("timer.workedTimeThisWeek")} value={timersAreLoading ? <Spinner type="cycle"/> : getWorkedTimeInCurrentWeek()}/>
            </div>
        </div>
    );
}

export default TimingMenu;