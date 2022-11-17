import React, {useEffect, useRef, useState} from 'react';
import "./Timing.css"
import Timer from "./timer/Timer";
import {TimerClass} from "./timer/TimerClass";
import ContentCard from "./contentcard/ContentCard";
import {DateTime} from "./timer/DateTime";

import { getDatabase, ref, onValue, set, push, onChildAdded, onChildRemoved } from "firebase/database"
import {getAuth, signOut} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import Save from "./save/Save";
import {formatDate} from "../helper/Helper";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import ValueCard from "../cards/Value/ValueCard";
import ButtonCard from "../cards/Button/ButtonCard";

function Timing({setCurrentMenu}) {
    const navigate = useNavigate()

    const [currentUser, setCurrentUser] = useState(null)

    const [startTime, setStartTime] = useState(null);
    const [saved, setSaved] = useState([]);

    const [overallHours, setOverallHours] = useState(0);
    const [overallMinutes, setOverallMinutes] = useState(0);
    const [workSeconds, setWorkSeconds] = useState(0);
    const [workIsRunning, setWorkIsRunning] = useState(false);
    const [workStopTime, setWorkStopTime] = useState(null);
    const [workTakenStop, setWorkTakenStop] = useState(new DateTime(0, 0, 0));

    const workTimer = new TimerClass(
        currentUser, "work",
        overallHours, setOverallHours,
        overallMinutes, setOverallMinutes,
        workSeconds, setWorkSeconds,
        startTime, workStopTime,
        workTakenStop, workIsRunning)

    const [breakHours, setBreakHours] = useState(0);
    const [breakMinutes, setBreakMinutes] = useState(0);
    const [breakSeconds, setBreakSeconds] = useState(0);
    const [breakIsRunning, setBreakIsRunning] = useState(false);
    const [breakStopTime, setBreakStopTime] = useState(new DateTime());
    const [breakTakenStop, setBreakTakenStop] = useState(new DateTime(0, 0, 0));

    const breakTimer = new TimerClass(
        currentUser,"break",
        breakHours, setBreakHours,
        breakMinutes, setBreakMinutes,
        breakSeconds, setBreakSeconds,
        startTime, breakStopTime,
        breakTakenStop, breakIsRunning)

    const resetTimers = () => {
        workTimer.resetTimer()
        breakTimer.resetTimer()

        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")

        set(ref(getDatabase(lsWorkingTimesApp), "/users/" + currentUser.uid + "/start-time"), "")

        const newSaveRef = push(ref(getDatabase(lsWorkingTimesApp), "/users/" + currentUser.uid + "/saved"));
        set(newSaveRef, {
            id:newSaveRef.key,
            date:formatDate(startTime),
            startTime: startTime.toLocaleTimeString("de"),
            worked: new DateTime(overallHours, overallMinutes, workSeconds).toTimeString(),
            break: new DateTime(breakHours, breakMinutes, breakSeconds).toTimeString()
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

    function useInterval(callback, delay) {
        const intervalRef = React.useRef();
        const callbackRef = React.useRef(callback);

        // Remember the latest callback:
        //
        // Without this, if you change the callback, when setInterval ticks again, it
        // will still call your old callback.
        //
        // If you add `callback` to useEffect's deps, it will work fine but the
        // interval will be reset.

        React.useEffect(() => {
            callbackRef.current = callback;
        }, [callback]);

        // Set up the interval:

        React.useEffect(() => {
            if (typeof delay === 'number') {
                intervalRef.current = setInterval(() => callbackRef.current(), delay);

                // Clear interval if the components is unmounted or the delay changes:
                return () => clearInterval(intervalRef.current);
            }
        }, [delay]);

        // Returns a ref to the interval ID in case you want to clear it manually:
        return intervalRef;
    }

    useInterval(() => {
        if (startTime != null) {
            workTimer.setByTimeDiff(false)
            breakTimer.setByTimeDiff(false)
        }

        if (workIsRunning) {
            workTimer.setByTimeDiff()
        }
        if (breakIsRunning) {
            breakTimer.setByTimeDiff()
        }
    }, 1000);

    useEffect(() => {
        setCurrentMenu(1)

        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const db = getDatabase(lsWorkingTimesApp)
        const auth = getAuth(lsWalletApp)

        auth.onAuthStateChanged(function(user) {
            if (user == null) {
                navigate("/login")
            }

            setCurrentUser(user)

            onValue(ref(db, "/users/" + user.uid + "/start-time"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "") {
                    setStartTime(null)
                    workTimer.resetTimer()
                    breakTimer.resetTimer()
                }
                else
                    setStartTime(DateTime.dateTimeFromString(data).getDate())
            })
            onValue(ref(db, "/users/" + user.uid + "/work-stop-time"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setWorkStopTime(null)
                else
                    setWorkStopTime(DateTime.dateTimeFromString(data))
            })
            onValue(ref(db, "/users/" + user.uid + "/work-taken-stop"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setWorkTakenStop(new DateTime(0,0,0))
                else
                    setWorkTakenStop(DateTime.dateTimeFromString(data))
            })
            onValue(ref(db, "/users/" + user.uid + "/break-stop-time"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setBreakStopTime(null)
                else
                    setBreakStopTime(DateTime.dateTimeFromString(data))
            })
            onValue(ref(db, "/users/" + user.uid + "/break-taken-stop"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setBreakTakenStop(new DateTime(0,0,0))
                else
                    setBreakTakenStop(DateTime.dateTimeFromString(data))
            })
            onValue(ref(db, "/users/" + user.uid + "/work-is-running"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setWorkIsRunning(false)
                else
                    setWorkIsRunning(data)
            })
            onValue(ref(db, "/users/" + user.uid + "/break-is-running"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setBreakIsRunning(false)
                else
                    setBreakIsRunning(data)
            })
            onChildAdded(ref(db, "/users/" + user.uid + "/saved"), snapshot => {
                const value = snapshot.val()
                if (value != null) {
                    setSaved(prevState => (
                        [value].concat(prevState)
                    ))
                }
            });
            onChildRemoved(ref(db, "/users/" + user.uid + "/saved"), snapshot => {
                const value = snapshot.val()
                if (value != null) {
                    setSaved((current) =>
                        current.filter((save) => save.id !== value.id)
                    );
                }
            });
        });
    }, [])

    return (
        <div className="timing">
            <div className="timingTimers">
                <ValueCard title="Date" value={startTime != null ? formatDate(startTime) : "Not started"}/>
                <ValueCard title="Start time" value={startTime != null ? startTime.toLocaleTimeString("de") : "Not started"}/>
            </div>

            <div className="timingTimers">
                <Timer name="Worked" timer={workTimer}/>
                <Timer name="Break" timer={breakTimer}/>
            </div>

            <div className="timerButtons">
                <ButtonCard title={workTimer.getIsRunning ? "Stop working" : "Start working"} action={toggleOverallTimer}/>
                <ButtonCard title={breakTimer.getIsRunning ? "Stop break" : "Start break"} action={toggleBreakTimer}/>
                <ButtonCard className={ startTime != null ? "buttonCard" : "disabled"} title="Reset and save" action={startTime != null ? resetTimers : function (){}}/>
            </div>

            <Save saved={saved}/>
        </div>
    );
}

export default Timing;