import {DateTime} from "../../classes/DateTime";
import React, {useEffect, useMemo, useState} from "react";
import {useContextGlobalVariables, useContextUserAuth} from "@LS-Studios/components";
import {get, onValue, ref, set} from "firebase/database";
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";

export const TimerType = {
    Work: "work",
    Break: "break"
}

function TimerProvider({timerContext, timerType, children}) {
    const auth = useContextUserAuth()
    const globalVariables = useContextGlobalVariables()

    const [currentTime, setCurrentTime] = useState(null)

    const [timeIsRunning, setTimeIsRunning] = useState(false);
    const [timeStopTime, setTimeStopTime] = useState(null);
    const [timeTakenStop, setTimeTakenStop] = useState(new DateTime());

    const [timeIsFetching, setTimeIsFetching] = useState(true)

    const currentTimerId = globalVariables.getLSVar("currentTimerId")

    useEffect(() => {
        const firebaseDB = getFirebaseDB()

        const unsubscribeArray = []

        if (!auth.userIsFetching && auth.user) {
            setTimeIsFetching(true)
            setCurrentTime(null)
            setTimeIsRunning(false)
            setTimeStopTime(null)
            setTimeTakenStop(new DateTime())

            get(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + timerType + "-star-time")).then((snapshot) => {
                if (snapshot.exists()) {
                    const startTime = DateTime.dateTimeFromString(snapshot.val())
                    updateTimer(startTime)
                }

                setTimeIsFetching(false)
            })

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

        set(ref(firebaseDB, getCurrentTimerPath(actualTimerId || currentTimerId, user) + timerType + "-is-running"), false)
        set(ref(firebaseDB, getCurrentTimerPath(actualTimerId || currentTimerId, user) + timerType + "-stop-time"), "")
        set(ref(firebaseDB, getCurrentTimerPath(actualTimerId || currentTimerId, user) + timerType + "-taken-stop"), "00:00:00")
    }

    const updateTimer = (startTime) => {
        if (!timeIsFetching) {
            const dateTimeDiff = (timeIsRunning ? DateTime.currentTime() : timeStopTime).getDateDiffToDateTime(startTime, timeTakenStop)

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
            currentTime,
            timeStopTime,
            timeIsRunning,
            timeIsFetching,
            startTimer,
            stopTimer,
            updateTimer,
            resetTimer
        }),
        [currentTime, timeStopTime, timeIsRunning, timeIsFetching]
    );

    return (
        <timerContext.Provider value={value}>
            {children}
        </timerContext.Provider>
    );
}

export default TimerProvider;