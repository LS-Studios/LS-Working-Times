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

    const [saves, setSaves] = useState([])

    const currentTimerId = globalVariables.getLSVar("currentTimerId")

    const timersAreFetching = workTimer.timeIsFetching || breakTimer.timeIsFetching

    useInterval(() => {
        if (!auth.userIsFetching && auth.user) {
            workTimer.updateTimer()
            breakTimer.updateTimer()
        }
    }, 1000);

    const resetTimers = () => {
        workTimer.resetTimer(auth.user)
        breakTimer.resetTimer(auth.user)

        const firebaseDB = getFirebaseDB()

        const newSaveRef = push(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved"));

        set(newSaveRef, {
            id:newSaveRef.key,
            date:formatDate(new Date(), translation),
            startTime: workTimer.startTime.toTimeString(),
            worked: workTimer.currentTime.toTimeString(),
            break: breakTimer.currentTime.toTimeString()
        });
    }

    const timerSetUp = () => {
        const firebaseDB = getFirebaseDB()

        const setStartTime = (timer) => {
            if (timer.startTime == null) {
                set(ref(getFirebaseDB(), getCurrentTimerPath(currentTimerId, auth.user) + timer.timerType + "-start-time"), DateTime.dateTimeFromDate(new Date()).toTimeString())
            }
        }

        const setStopTime = (timer) => {
            if (timer.timeStopTime != null) return


            if (timer.startTime == null)
                set(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + timer.timerType + "-stop-time"), DateTime.currentTime().toTimeString())
            else
                set(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + timer.timerType + "-stop-time"), timer.startTime.toTimeString())
        }

        setStartTime(workTimer)
        setStartTime(breakTimer)

        setStopTime(workTimer)
        setStopTime(breakTimer)
    }

    const toggleWorkTimer = () => {
        timerSetUp()

        if (workTimer.timeIsRunning) {
            workTimer.stopTimer(auth.user)
        } else {
            workTimer.startTimer(auth.user)

            if (breakTimer.timeIsRunning)
                breakTimer.stopTimer(auth.user)
        }
    }

    const toggleBreakTimer = () => {
        timerSetUp()

        if (breakTimer.startTime == null)
            set(ref(getFirebaseDB(), getCurrentTimerPath(currentTimerId, auth.user) + breakTimer.timerType + "-start-time"), DateTime.dateTimeFromDate(new Date()).toTimeString())

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
                <ValueCard style={{width: "100%"}} title={translation.translate("timer.date")} value={timersAreFetching ? <Spinner type={SpinnerType.dots} /> : (workTimer.startTime != null ? formatDate(new Date(), translation) : translation.translate("timer.notStarted"))}/>
                <ValueCard style={{width: "100%"}} title={translation.translate("timer.startTime")} value={timersAreFetching ? <Spinner type={SpinnerType.dots} /> : (workTimer.startTime != null ? workTimer.startTime.toTimeString() : translation.translate("timer.notStarted"))} clickAction={workTimer.startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: workTimer.startTime,
                        setNewTime: (newTime) => {
                            const firebaseDB = getFirebaseDB()

                            set(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + workTimer.timerType + "-start-time"), newTime.toTimeString())
                        }
                    })
                } : null}/>
            </Layout>

            <Layout style={{width: 271}}>
                <TimerComponent timer={workTimer} name={translation.translate("timer.worked")} />
                <TimerComponent timer={breakTimer} name={translation.translate("timer.break")} clickAction={workTimer.startTime != null ? () => {
                    dialog.openDialog("ChangeTimeDialog", {
                        value: breakTimer.currentTime,
                        setNewTime: async (newTime) => {
                            const firebaseDB = getFirebaseDB()

                            const dateTimeDiff = breakTimer.currentTime.getAbsoluteDiffToDateTime(newTime)

                            //Subtract work if break added

                            const breakTakenStopRef = ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "break-taken-stop")
                            const breakTakenStopSnapshot = await get(breakTakenStopRef)
                            const newBreakTakenStopTime = DateTime.dateTimeFromString(breakTakenStopSnapshot.val()).addDateTime(dateTimeDiff)
                            set(breakTakenStopRef, newBreakTakenStopTime.toTimeString())

                            const workTakenStopRef = ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "work-taken-stop")
                            const workTakenStopSnapshot = await get(workTakenStopRef)
                            const newWorkTakenStopTime = DateTime.dateTimeFromString(workTakenStopSnapshot.val()).subtractDateTime(dateTimeDiff)
                            set(workTakenStopRef, newWorkTakenStopTime.toTimeString())
                        }
                    })
                } : null} />
            </Layout>

            <ButtonCard disabled={timersAreFetching} title={workTimer.timeIsRunning ? translation.translate("timer.stopWorking") : translation.translate("timer.startWorking")} clickAction={toggleWorkTimer}/>
            <ButtonCard disabled={timersAreFetching || !workTimer.startTime} title={breakTimer.timeIsRunning ? translation.translate("timer.stopBreak") : translation.translate("timer.startBreak")} clickAction={toggleBreakTimer}/>
            <ButtonCard disabled={timersAreFetching || !workTimer.startTime} title={translation.translate("timer.resetAndSave")} clickAction={workTimer.startTime && resetTimers}/>

            <Saves saves={saves} setSaves={setSaves} />
        </div>
    );
}