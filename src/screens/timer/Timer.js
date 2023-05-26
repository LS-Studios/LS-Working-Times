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
    Spinner, SpinnerType, useContextDialog, useContextGlobalVariables, useContextTranslation,
    useContextUserAuth,
    ValueCard
} from "@LS-Studios/components";
import {formatDate} from "@LS-Studios/date-helper";
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";
import Saves from "../../components/saves/Saves";
import {breakTimerContext, workTimerContext} from "../../providers/Providers";
import TimerComponent from "../../components/timer/TimerComponent";
import TimerProvider, {TimerType} from "../../components/timer/TimerProvider";
import {CreateEditTimerDialogType} from "../../dialogs/edittimer/CreateEditTimerDialog";

function Timer() {
    return (
        <TimerProvider timerContext={workTimerContext} timerType={TimerType.Work}>
            <TimerProvider timerContext={breakTimerContext} timerType={TimerType.Break}>
                <TimerContent />
            </TimerProvider>
        </TimerProvider>
    )
}

export default Timer;

function TimerContent() {
    const translation = useContextTranslation()
    const dialog = useContextDialog();
    const auth = useContextUserAuth()
    const globalVariables = useContextGlobalVariables()

    const workTimer = useContext(workTimerContext)
    const breakTimer = useContext(breakTimerContext)

    const [startTime, setStartTime] = useState(null)
    const [startTimeIsFetching, setStartTimeIsFetching] = useState(true)

    const [saves, setSaves] = useState([])

    const currentTimerId = globalVariables.getLSVar("currentTimerId")

    useEffect(() => {
        const unsubscribeArray = []

        if (!auth.userIsFetching && auth.user) {
            setStartTimeIsFetching(true)

            const firebaseDB = getFirebaseDB()

            unsubscribeArray.push(
                onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "start-time"), snapshot => {
                    const data = snapshot.val()

                    setStartTimeIsFetching(false)

                    if (data == null || data === "") {
                        setStartTime(null)
                        workTimer.resetTimer(auth.user, currentTimerId)
                        breakTimer.resetTimer(auth.user, currentTimerId)
                    } else {
                        setStartTime(DateTime.dateTimeFromString(data))
                    }
                })
            )
        }

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [auth.user, currentTimerId])

    useInterval(() => {
        if (!auth.userIsFetching && auth.user && startTime) {
            workTimer.updateTimer(startTime, currentTimerId)
            breakTimer.updateTimer(startTime, currentTimerId)
        }
    }, 1000);

    const resetTimers = () => {
        workTimer.resetTimer(auth.user)
        breakTimer.resetTimer(auth.user)

        setStartTime(null)

        const firebaseDB = getFirebaseDB()

        set(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "start-time"), "")

        const newSaveRef = push(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved"));

        set(newSaveRef, {
            id:newSaveRef.key,
            date:formatDate(new Date()),
            startTime: startTime.toTimeString(),
            worked: new DateTime(workTimer.currentTime.hours, workTimer.currentTime.minutes, workTimer.currentTime.seconds).toTimeString(),
            break: new DateTime(breakTimer.currentTime.hours, breakTimer.currentTime.minutes, breakTimer.currentTime.seconds).toTimeString()
        });
    }

    const setTimerOnStartUp = () => {
        const firebaseDB = getFirebaseDB()

        const setStopTime = (type) => {
            const newDateTime = DateTime.currentTime()

            if (startTime == null)
                set(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + type + "-stop-time"), newDateTime.toTimeString())
            else
                set(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + type + "-stop-time"), startTime.toTimeString())
        }

        if (startTime == null) {
            set(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "start-time"), DateTime.dateTimeFromDate(new Date()).toTimeString())
        }

        if (workTimer.timeStopTime == null) {
            setStopTime("work")
        }

        if (breakTimer.timeStopTime == null) {
            setStopTime("break")
        }
    }

    const toggleWorkTimer = () => {
        setTimerOnStartUp()

        if (workTimer.timeIsRunning) {
            workTimer.stopTimer(auth.user)
        } else {
            workTimer.startTimer(auth.user)

            if (breakTimer.timeIsRunning)
                breakTimer.stopTimer(auth.user)
        }
    }

    const toggleBreakTimer = () => {
        setTimerOnStartUp()

        if (breakTimer.timeIsRunning) {
            breakTimer.stopTimer(auth.user)
        } else {
            breakTimer.startTimer(auth.user)

            if (workTimer.timeIsRunning)
                workTimer.stopTimer(auth.user)
        }
    }

    const changeTimer = () => {
        dialog.openDialog("ChangeTimerDialog", {})
    }

    const editTimer = () => {
        dialog.openDialog("CreateEditTimerDialog", {type: CreateEditTimerDialogType.EDIT})
    }

    return (
        <div className="timingMenu">
            <ButtonCard title={translation.translate("timer.change-timer")} clickAction={changeTimer}/>
            <ButtonCard title={translation.translate("timer.editTimer")} clickAction={editTimer}/>

            <Layout style={{width: 271}}>
                <ValueCard style={{width: "100%"}} title={translation.translate("timer.date")} value={startTimeIsFetching ? <Spinner type={SpinnerType.dots} /> : (startTime != null ? formatDate(new Date()) : translation.translate("timer.notStarted"))}/>
                <ValueCard style={{width: "100%"}} title={translation.translate("timer.startTime")} value={startTimeIsFetching ? <Spinner type={SpinnerType.dots} /> : (startTime != null ? startTime.toTimeString() : translation.translate("timer.notStarted"))} clickAction={startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: startTime,
                        setNewTime: (newTime) => {
                            const firebaseDB = getFirebaseDB()

                            set(ref(firebaseDB, "/users/"+auth.user.id+"/start-time"), newTime.toTimeString())
                        }
                    })
                } : null}/>
            </Layout>

            <Layout style={{width: 271}}>
                <TimerComponent timer={workTimer} name={translation.translate("timer.worked")} />
                <TimerComponent timer={breakTimer} name={translation.translate("timer.break")} clickAction={startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: breakTimer.currentTime,
                        setNewTime: async (newTime) => {
                            const firebaseDB = getFirebaseDB()

                            const dateTimeDiff = breakTimer.currentTime.getAbsoluteDiffToDateTime(newTime)

                            //Subtract work if break added

                            const breakTakenStopSnapshot = await get(ref(firebaseDB, "/users/"+auth.user.id+"/break-taken-stop"))
                            const newBreakTakenStopTime = DateTime.dateTimeFromString(breakTakenStopSnapshot.val()).addDateTime(dateTimeDiff)
                            set(ref(firebaseDB, "/users/"+auth.user.id+"/break-taken-stop"), newBreakTakenStopTime.toTimeString())

                            const workTakenStopSnapshot = await get(ref(firebaseDB, "/users/"+auth.user.id+"/work-taken-stop"))
                            const newWorkTakenStopTime = DateTime.dateTimeFromString(workTakenStopSnapshot.val()).subtractDateTime(dateTimeDiff)
                            set(ref(firebaseDB, "/users/"+auth.user.id+"/work-taken-stop"), newWorkTakenStopTime.toTimeString())
                        }
                    })
                } : null} />
            </Layout>

            <ButtonCard disabled={startTimeIsFetching} title={workTimer.timeIsRunning ? translation.translate("timer.stopWorking") : translation.translate("timer.startWorking")} clickAction={toggleWorkTimer}/>
            <ButtonCard disabled={startTimeIsFetching || !startTime} title={breakTimer.timeIsRunning ? translation.translate("timer.stopBreak") : translation.translate("timer.startBreak")} clickAction={toggleBreakTimer}/>
            <ButtonCard disabled={startTimeIsFetching || !startTime} title={translation.translate("timer.resetAndSave")} clickAction={startTime && resetTimers}/>

            <Saves saves={saves} setSaves={setSaves} />
        </div>
    );
}