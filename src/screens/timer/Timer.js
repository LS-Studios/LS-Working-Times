import React, {useContext, useEffect, useState} from 'react';
import {DateTime} from "../../classes/DateTime";
import "./Timer.css"
import {
    ref,
    onValue,
    set,
    push, get
} from "firebase/database"
import {useInterval} from "../../customhook/UseInterval";
import {
    ButtonCard, Layout,
    Spinner, useContextDialog, useContextTranslation,
    useContextUserAuth,
    ValueCard
} from "@LS-Studios/components";
import {formatDate} from "@LS-Studios/date-helper";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";
import Saves from "../../components/saves/Saves";
import {breakTimerContext, workTimerContext} from "../../providers/Providers";
import TimerComponent from "../../components/timer/TimerComponent";

function Timer({setCurrentMenu}) {
    const translation = useContextTranslation()
    const dialog = useContextDialog();
    const auth = useContextUserAuth()

    const workTimer = useContext(workTimerContext)
    const breakTimer = useContext(breakTimerContext)

    const [startTime, setStartTime] = useState(null)
    const [startTimeIsFetching, setStartTimeIsFetching] = useState(true)

    const [saves, setSaves] = useState([])

    useEffect(() => {
        setCurrentMenu(2)

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
            workTimer.updateTimer(startTime, false)
            breakTimer.updateTimer(startTime, false)
        }

        if (workTimer.timeIsRunning) {
            workTimer.updateTimer(startTime)
        }
        if (breakTimer.timeIsRunning) {
            breakTimer.updateTimer(startTime)
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

    return (
        <div className="timingMenu">
            <Layout style={{width: 271}}>
                <ValueCard style={{width: "100%"}} title={translation.translate("timer.date")} value={startTimeIsFetching ? <Spinner type="dots" /> : (startTime != null ? formatDate(startTime) : translation.translate("timer.notStarted"))}/>
                <ValueCard style={{width: "100%"}} title={translation.translate("timer.startTime")} value={startTimeIsFetching ? <Spinner type="dots" /> : (startTime != null ? startTime.toLocaleTimeString("de") : translation.translate("timer.notStarted"))} clickAction={startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: DateTime.dateTimeFromDate(workTimer.startTime).toTimeString(),
                        type: "start-time"
                    })
                } : null}/>
            </Layout>

            <Layout style={{width: 271}}>
                <TimerComponent timer={workTimer} name={translation.translate("timer.worked")} />
                <TimerComponent timer={breakTimer} name={translation.translate("timer.break")} clickAction={startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: new DateTime(breakTimer.currentTime.hours, breakTimer.currentTime.minutes, breakTimer.currentTime.seconds).toTimeString(),
                        type: "break-time"
                    })
                } : null} />
            </Layout>

            <ButtonCard disabled={startTimeIsFetching} title={workTimer.isRunning ? translation.translate("timer.stopWorking") : translation.translate("timer.startWorking")} clickAction={toggleOverallTimer}/>
            <ButtonCard disabled={startTimeIsFetching || workTimer.startTime == null} title={breakTimer.isRunning ? translation.translate("timer.stopBreak") : translation.translate("timer.startBreak")} clickAction={toggleBreakTimer}/>
            <ButtonCard disabled={startTimeIsFetching || workTimer.startTime == null} title={translation.translate("timer.resetAndSave")} clickAction={startTime != null ? resetTimers : function (){}}/>

            <Saves saves={saves} setSaves={setSaves} />
        </div>
    );
}

export default Timer;