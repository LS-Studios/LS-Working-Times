import React, {createContext, useContext, useEffect, useState} from 'react';
import {DateTime} from "../../classes/DateTime";
import TimerProvider, {TimerType} from "../../components/timer/TimerProvider";
import "./Timer.css"
import {
    ref,
    onValue,
    set,
    push,
    get
} from "firebase/database"
import {useInterval} from "../../customhook/UseInterval";
import {
    ButtonCard,
    Spinner, useContextDialog, useContextTheme, useContextTranslation,
    useContextUserAuth,
    ValueCard
} from "@LS-Studios/components";
import {formatDate, getDateFromString, getDateWithoutTime, getEndOfWeek, getStartOfWeek} from "@LS-Studios/date-helper";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";
import Saves from "../../components/saves/Saves";

function Timer({saved, selectedSaveDate, setSavesIsLoading}) {
    const translation = useContextTranslation()
    const theme = useContextTheme()
    const dialog = useContextDialog();
    const auth = useContextUserAuth()

    const workTimerContext = createContext(null)
    const breakTimerContext = createContext(null)

    const workTimer = useContext(workTimerContext)
    const breakTimer = useContext(breakTimerContext)

    const [startTime, setStartTime] = useState(null)
    const [startTimeIsFetching, setStartTimeIsFetching] = useState(true)

    useEffect(() => {
        get(ref(getFirebaseDB(), "/users/" + auth.user.id + "/saved")).then((snapshot) => {
            if (!snapshot.exists())
                setSavesIsLoading(false)
        }).catch((error) => {
            console.error(error);
        });

        const unsubscribeArray = []

        unsubscribeArray.push(
            onValue(ref(getFirebaseDB(), "/users/" + auth.user.id + "/start-time"), snapshot => {
                const data = snapshot.val()

                setStartTimeIsFetching(false)

                if (data == null || data === "") {
                    setStartTime(null)

                    workTimer.resetTimer()
                    breakTimer.resetTimer()
                }
                else
                    setStartTime(DateTime.dateTimeFromString(data).getDate())
            }))

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [])

    useInterval(() => {
        if (workTimer.startTime != null) {
            workTimer.updateTime(false)
            breakTimer.updateTime(false)
        }

        if (workTimer.timeIsRunning) {
            workTimer.updateTime()
        }
        if (breakTimer.timeIsRunning) {
            breakTimer.updateTime()
        }
    }, 1000);

    const resetTimers = () => {
        workTimer.resetTimer()
        breakTimer.resetTimer()

        const newSaveRef = push(ref(getFirebaseDB(), "/users/" + auth.user.id + "/saved"));

        set(newSaveRef, {
            id:newSaveRef.key,
            date:formatDate(workTimer.startTime),
            startTime: workTimer.startTime.toLocaleTimeString("de"),
            worked: new DateTime(workTimer.currentTime.hours, workTimer.currentTime.minutes, workTimer.currentTime.seconds).toTimeString(),
            break: new DateTime(breakTimer.currentTime.hours, breakTimer.currentTime.minutes, breakTimer.currentTime.seconds).toTimeString()
        });
    }

    const setTimerOnStartUp = () => {
        const firebaseDB = getFirebaseDB()

        const setStartTime = () => {
            const newDate = new Date()
            set(ref(firebaseDB, "/users/" + auth.user.id + "/start-time"), newDate.toLocaleTimeString("de"))
        }

        const setStopTime = (type) => {
            const newDateTime = new DateTime()

            if (workTimer.startTime == null)
                set(ref(firebaseDB, "/users/" + auth.user.id + "/" + type + "-stop-time"), newDateTime.toTimeString())
            else
                set(ref(firebaseDB, "/users/" + auth.user.id + "/" + type + "-stop-time"), workTimer.startTime.toLocaleTimeString("de"))
        }

        if (workTimer.startTime == null) {
            setStartTime()
        }

        if (workTimer.stopTime == null) {
            setStopTime("work")
        }

        if (breakTimer.stopTime == null) {
            setStopTime("break")
        }
    }

    const toggleOverallTimer = () => {
        setTimerOnStartUp()

        if (workTimer.timeIsRunning) {
            workTimer.stopTimer()
        } else {
            workTimer.startTimer()

            if (breakTimer.timeIsRunning)
                breakTimer.stopTimer()
        }
    }

    const toggleBreakTimer = () => {
        setTimerOnStartUp()

        if (breakTimer.timeIsRunning) {
            breakTimer.stopTimer()
        } else {
            breakTimer.startTimer()

            if (workTimer.timeIsRunning)
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

    return (
        <div className="timingMenu">
            <div className="timingMenuTimers">
                <ValueCard title={translation.translate("timer.date")} value={startTimeIsFetching ? <Spinner type="dots" /> : (startTime != null ? formatDate(startTime) : translation.translate("timer.notStarted"))}/>
                <ValueCard title={translation.translate("timer.startTime")} value={startTimeIsFetching ? <Spinner type="dots" /> : (startTime != null ? startTime.toLocaleTimeString("de") : translation.translate("timer.notStarted"))} clickAction={startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: DateTime.dateTimeFromDate(workTimer.startTime).toTimeString(),
                        type: "start-time"
                    })
                } : null}/>
            </div>

            <div className="timingMenuTimers">
                <TimerProvider timerContext={workTimerContext} startTime={startTime} timerType={TimerType.Work} name={translation.translate("timer.worked")}/>
                <TimerProvider timerContext={breakTimerContext} startTime={startTime} timerType={TimerType.Break} name={translation.translate("timer.break")} clickAction={startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: new DateTime(breakTimer.currentTime.hours, breakTimer.currentTime.minutes, breakTimer.currentTime.seconds).toTimeString(),
                        type: "break-time"
                    })
                } : null}/>
            </div>

            <div className="timingMenuButtons">
                <ButtonCard disabled={startTimeIsFetching} title={workTimer.isRunning ? translation.translate("timer.stopWorking") : translation.translate("timer.startWorking")} clickAction={toggleOverallTimer}/>
                <ButtonCard disabled={startTimeIsFetching || workTimer.startTime == null} title={breakTimer.isRunning ? translation.translate("timer.stopBreak") : translation.translate("timer.startBreak")} clickAction={toggleBreakTimer}/>
                <ButtonCard disabled={startTimeIsFetching || workTimer.startTime == null} title={translation.translate("timer.resetAndSave")} clickAction={startTime != null ? resetTimers : function (){}}/>
                <ValueCard className={theme.getThemeClass("singleLineValueCard")} title={translation.translate("timer.workedTimeThisWeek")} value={(workTimer.timeIsFetching || breakTimer.timeIsFetching) ? <Spinner type="dots"/> : getWorkedTimeInCurrentWeek()}/>
            </div>

            <Saves />
        </div>
    );
}

export default Timer;