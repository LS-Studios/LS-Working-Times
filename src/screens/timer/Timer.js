import React, {createContext, useContext, useEffect, useState} from 'react';
import {DateTime} from "../../classes/DateTime";
import TimerProvider, {TimerType} from "../../components/timer/TimerProvider";
import "./Timer.css"
import {
    getDatabase,
    ref,
    onValue,
    set,
    push,
    get
} from "firebase/database"
import {useNavigate} from "react-router-dom";
import {Timer} from "../../classes/Timer";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/config/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/config/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {useInterval} from "../../customhook/UseInterval";
import {
    ButtonCard,
    Spinner,
    useComponentDialog,
    useComponentTheme,
    useContextUserAuth,
    ValueCard
} from "@LS-Studios/components";
import {useTranslation} from "@LS-Studios/use-translation";
import {formatDate, getDateFromString, getDateWithoutTime, getEndOfWeek, getStartOfWeek} from "@LS-Studios/date-helper";
import ContentInWeekCard from "../../cards/contentinweek/ContentInWeekCard";
import SavedCard from "../../cards/save/SavedCard";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";

function Timer({saved, selectedSaveDate, setSavesIsLoading}) {
    const translation = useTranslation()
    const theme = useComponentTheme()
    const dialog = useComponentDialog();
    const auth = useContextUserAuth()

    const workTimerContext = createContext(null)
    const breakTimerContext = createContext(null)

    const workTimer = useContext(workTimerContext)
    const breakTimer = useContext(breakTimerContext)

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
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)

        const setStartTime = () => {
            const newDate = new Date()
            set(ref(db, "/users/" + auth.user.id + "/start-time"), newDate.toLocaleTimeString("de"))
        }

        const setStopTime = (type) => {
            const newDateTime = new DateTime()

            if (workTimer.startTime == null)
                set(ref(db, "/users/" + auth.user.id + "/" + type + "-stop-time"), newDateTime.toTimeString())
            else
                set(ref(db, "/users/" + auth.user.id + "/" + type + "-stop-time"), workTimer.startTime.toLocaleTimeString("de"))
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

    useEffect(() => {
        get(ref(getFirebaseDB(), "/users/" + auth.user.id + "/saved")).then((snapshot) => {
            if (!snapshot.exists())
                setSavesIsLoading(false)
        }).catch((error) => {
            console.error(error);
        });
    }, [])

    return (
        <div className="timingMenu">
            <div className="timingMenuTimers">
                <ValueCard title={translation.translate("timer.date")} value={startTimeIsFetching ? <Spinner type="dots" /> : (startTime != null ? formatDate(startTime) : translation.translate("timer.notStarted"))}/>
                <ValueCard title={translation.translate("timer.startTime")} value={startTimeIsFetching ? <Spinner type="dots" /> : (startTime != null ? startTime.toLocaleTimeString("de") : translation.translate("timer.notStarted"))} clickAction={startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: DateTime.dateTimeFromDate(startTime).toTimeString(),
                        type: "start-time"
                    })
                } : null}/>
            </div>

            <div className="timingMenuTimers">
                <TimerProvider timerContext={workTimerContext} timerType={TimerType.Work} name={translation.translate("timer.worked")}/>
                <TimerProvider timerContext={breakTimerContext} timerType={TimerType.Break} name={translation.translate("timer.break")} clickAction={startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: new DateTime(breakTime.hours, breakTime.minutes, breakTime.seconds).toTimeString(),
                        type: "break-time"
                    })
                } : null}/>
            </div>

            <div className="timingMenuButtons">
                <ButtonCard disabled={startTimeIsFetching} title={workTimer.getIsRunning ? translation.translate("timer.stopWorking") : translation.translate("timer.startWorking")} clickAction={toggleOverallTimer}/>
                <ButtonCard disabled={startTimeIsFetching || startTime == null} title={breakTimer.getIsRunning ? translation.translate("timer.stopBreak") : translation.translate("timer.startBreak")} clickAction={toggleBreakTimer}/>
                <ButtonCard disabled={startTimeIsFetching || startTime == null} title={translation.translate("timer.resetAndSave")} clickAction={startTime != null ? resetTimers : function (){}}/>
                <ValueCard className={theme.getThemeClass("singleLineValueCard")} title={translation.translate("timer.workedTimeThisWeek")} value={timersAreFetching ? <Spinner type="dots"/> : getWorkedTimeInCurrentWeek()}/>
            </div>

            <ContentInWeekCard dataArray={saved} title={translation.translate("timer.saved")} noItemMessage={translation.translate("timer.noSaves")} ItemCard={SavedCard} selectedDate={selectedSaveDate} setSelectedDate={setSelectedSaveDate} isLoading={savesIsLoading}/>
        </div>
    );
}

export default Timer;