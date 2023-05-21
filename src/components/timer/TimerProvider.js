import "./TimerProvider.css"
import {DateTime} from "../../classes/DateTime";
import React, {useEffect, useMemo, useState} from "react";
import {useContextUserAuth, ValueCard} from "@LS-Studios/components";
import {get, onValue, ref, set} from "firebase/database";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";

export const TimerType = {
    Work: "work",
    Break: "break"
}

function TimerProvider({timerContext, startTime, name, timerType, clickAction}) {
    const auth = useContextUserAuth()

    const [currentTime, setCurrentTime] = useState(new DateTime(0,0,0))

    const [timeIsRunning, setTimeIsRunning] = useState(false);
    const [timeStopTime, setTimeStopTime] = useState(null);
    const [timeTakenStop, setTimeTakenStop] = useState(new DateTime(0, 0, 0));

    const [timeIsFetching, setTimeIsFetching] = useState(true)

    useEffect(() => {
        const firebaseDB = getFirebaseDB()

        const unsubscribeArray = []

        unsubscribeArray.push(
            onValue(ref(firebaseDB, "/users/" + auth.user.id + "/" + timerType + "-stop-time"), snapshot => {
                const data = snapshot.val()

                setTimeIsFetching(false)

                if (data == null || data === "")
                    setTimeStopTime(null)
                else
                    setTimeStopTime(DateTime.dateTimeFromString(data))
            }))
        unsubscribeArray.push(
            onValue(ref(firebaseDB, "/users/" + auth.user.id + "/" + timerType + "-taken-stop"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setTimeTakenStop(new DateTime(0,0,0))
                else
                    setTimeTakenStop(DateTime.dateTimeFromString(data))
            }))
        unsubscribeArray.push(
            onValue(
                ref(firebaseDB, "/users/" + auth.user.id + "/" + timerType + "-is-running"),
                    snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setTimeIsRunning(false)
                else
                    setTimeIsRunning(data)
            })
        )

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [])

    const startTimer = () => {
        const firebaseDB = getFirebaseDB()

        set(ref(firebaseDB, "/users/" + auth.user.id + "/" + timerType + "-is-running"), true)

        const newStopTime = timeTakenStop.addDateTime(new DateTime().getDateDiffToDateTime(timeStopTime))

        set(ref(firebaseDB, "/users/" + auth.user.id + "/" + timerType + "-taken-stop"), newStopTime.toTimeString())
    };

    const stopTimer = () => {
        const firebaseDB = getFirebaseDB()
        set(ref(firebaseDB, "/users/" + auth.user.id + "/" + timerType + "-is-running"), false)
        set(ref(firebaseDB, "/users/" + auth.user.id + "/" + timerType + "-stop-currentTime"), new DateTime().toTimeString())
    }

    const resetTimer = () => {
        stopTimer()
        setCurrentTime({...currentTime, hours: 0, minutes: 0, seconds: 0})

        const firebaseDB = getFirebaseDB()

        set(ref(firebaseDB, "/users/" + auth.user.id + "/" + timerType + "-is-running"), false)
        set(ref(firebaseDB, "/users/" + auth.user.id + "/" + timerType + "-stop-currentTime"), "")
        set(ref(firebaseDB, "/users/" + auth.user.id + "/" + timerType + "-taken-stop"), "00:00:00")
    }

    const updateTimer = (takeCurrent = true) => {
        const dateTimeDiff = (takeCurrent ? new DateTime() : timeStopTime).getDateDiffToDateTime(DateTime.dateTimeFromDate(startTime), timeTakenStop)

        setCurrentTime({...currentTime, hours: dateTimeDiff.hours,
            minutes: dateTimeDiff.minutes,
            seconds: dateTimeDiff.seconds})
    };

    const value = useMemo(
        () => ({
            startTime,
            currentTime,
            timeStopTime,
            timeIsRunning,
            timeIsFetching,
            startTimer,
            stopTimer,
            updateTimer
        }),
        [startTime, currentTime, timeStopTime, timeIsRunning, timeIsFetching]
    );

    return (
        <timerContext.Provider value={value}>
            <ValueCard title={name} isLoading={timeIsFetching} value={
                new DateTime(
                    currentTime.hours,
                    currentTime.minutes,
                    currentTime.seconds
                ).toTimeString()
            } clickAction={clickAction}/>
        </timerContext.Provider>
    );
}

export default TimerProvider;