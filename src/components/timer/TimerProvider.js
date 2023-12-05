import {DateTime} from "../../classes/DateTime";
import React, {useEffect, useMemo, useState} from "react";
import {useContextGlobalVariables, useContextUserAuth} from "@LS-Studios/components";
import {get, onValue, ref, set} from "firebase/database";
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";
import useTimerStates from "../../customhook/useTimerStates";

export const TimerType = {
    Work: "work",
    Break: "break"
}

function TimerProvider({timerContext, timerType, children}) {
    const auth = useContextUserAuth()
    const globalVariables = useContextGlobalVariables()

    const [currentTime, setCurrentTime] = useState(null)

    const { startTime, setStartTime } = useTimerStates()
    const { timeIsRunning, setTimeIsRunning } = useTimerStates()
    const { timeStopTime, setTimeStopTime } = useTimerStates()
    const { timeTakenStop, setTimeTakenStop } = useTimerStates()

    const [timeIsFetching, setTimeIsFetching] = useState(true)

    const currentTimerId = globalVariables.getLSVar("currentTimerId")

    useEffect(() => {
        const firebaseDB = getFirebaseDB()

        const unsubscribeArray = []

        if (!auth.userIsFetching && auth.user) {
            setTimeIsFetching(true)
            setStartTime(null)
            setCurrentTime(null)
            setTimeIsRunning(false)
            setTimeStopTime(null)
            setTimeTakenStop(new DateTime())

            unsubscribeArray.push(
                onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + timerType + "-start-time"), snapshot => {
                    const data = snapshot.val()

                    if (data == null || data === "") {
                        setStartTime(null)
                        resetTimer(auth.user, currentTimerId)
                    } else {
                        setStartTime(DateTime.dateTimeFromString(data))
                        updateTimer()
                    }

                    setTimeIsFetching(false)
                })
            )

            unsubscribeArray.push(
                onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + timerType + "-stop-time"), snapshot => {
                    const data = snapshot.val()

                    if (data == null || data === "")
                        setTimeStopTime(null)
                    else
                        setTimeStopTime(DateTime.dateTimeFromString(data))
                }))
            unsubscribeArray.push(
                onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + timerType + "-taken-stop"), snapshot => {
                    const data = snapshot.val()

                    if (data == null || data === "")
                        setTimeTakenStop(new DateTime())
                    else
                        setTimeTakenStop(DateTime.dateTimeFromString(data))
                }))
            unsubscribeArray.push(
                onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + timerType + "-is-running"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setTimeIsRunning(false)
                        else
                            setTimeIsRunning(data)
                    })
            )
        }

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [auth.userIsFetching, currentTimerId])

    const startTimer = (user) => {
        const firebaseDB = getFirebaseDB()

        set(ref(firebaseDB, getCurrentTimerPath(currentTimerId, user) + timerType + "-is-running"), true)

        const newStopTime = timeTakenStop.addDateTime(DateTime.currentTime().getDateDiffToDateTime(timeStopTime))

        set(ref(firebaseDB, getCurrentTimerPath(currentTimerId, user) + timerType + "-taken-stop"), newStopTime.toTimeString())
    };

    const stopTimer = (user, actualTimerId) => {
        const firebaseDB = getFirebaseDB()

        set(ref(firebaseDB, getCurrentTimerPath(actualTimerId || currentTimerId, user) + timerType + "-is-running"), false)
        set(ref(firebaseDB, getCurrentTimerPath(actualTimerId || currentTimerId, user) + timerType + "-stop-time"), DateTime.currentTime().toTimeString())
    }

    const resetTimer = (user, actualTimerId) => {
        stopTimer(user, actualTimerId)
        setCurrentTime(null)
        const firebaseDB = getFirebaseDB()

        set(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + timerType + "-start-time"), "")
        set(ref(firebaseDB, getCurrentTimerPath(actualTimerId || currentTimerId, user) + timerType + "-is-running"), false)
        set(ref(firebaseDB, getCurrentTimerPath(actualTimerId || currentTimerId, user) + timerType + "-stop-time"), "")
        set(ref(firebaseDB, getCurrentTimerPath(actualTimerId || currentTimerId, user) + timerType + "-taken-stop"), "00:00:00")
    }

    const updateTimer = () => {
        if (!timeIsFetching && startTime) {
            const dateTimeDiff = (timeIsRunning ? DateTime.currentTime() : (timeStopTime ? timeStopTime : startTime)).getDateDiffToDateTime(startTime, timeTakenStop)

            setCurrentTime(
                new DateTime(
                    dateTimeDiff.hours,
                    dateTimeDiff.minutes,
                    dateTimeDiff.seconds
                )
            )
        }
    };

    const value = useMemo(
        () => ({
            timerType,
            currentTime,
            startTime,
            timeStopTime,
            timeIsRunning,
            timeIsFetching,
            startTimer,
            stopTimer,
            updateTimer,
            resetTimer
        }),
        [timerType, currentTime, startTime, timeStopTime, timeIsRunning, timeIsFetching]
    );

    return (
        <timerContext.Provider value={value}>
            {children}
        </timerContext.Provider>
    );
}

export default TimerProvider;