import React, {useEffect, useRef, useState} from 'react';
import "./Timing.css"
import Timer from "./timer/Timer";
import {TimerClass} from "./timer/TimerClass";
import ContentCard from "./contentcard/ContentCard";
import {DateTime} from "./timer/DateTime";
import SavedCard from "./save/SavedCard";

import { initializeApp } from "firebase/app"
import { getDatabase, ref, onValue, set, push, onChildAdded, onChildChanged, onChildRemoved } from "firebase/database"
import firebaseConfig from "../firebase/config";
import {getAuth} from "firebase/auth";
import {useNavigate} from "react-router-dom";

function Timing() {
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

        set(ref(getDatabase(), "/users/" + currentUser.uid + "/start-time"), "")

        const newSaveRef = push(ref(getDatabase(), "/users/" + currentUser.uid + "/saved"));
        set(newSaveRef, {
            id:newSaveRef.key,
            date:startTime.toLocaleDateString("de"),
            startTime: startTime.toLocaleTimeString("de"),
            worked: new DateTime(overallHours, overallMinutes, workSeconds).toTimeString(),
            break: new DateTime(breakHours, breakMinutes, breakSeconds).toTimeString()
        });
    }

    const toggleOverallTimer = () => {
        if (workIsRunning) {
            workTimer.stopTimer()
        } else {
            workTimer.startTimer()
            breakTimer.stopTimer()
        }
    }

    const toggleBreakTimer = () => {
        if (breakIsRunning) {
            breakTimer.stopTimer()
        } else {
            breakTimer.startTimer()
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
        const db = getDatabase()
        const auth = getAuth()

        auth.onAuthStateChanged(function(user) {
            if (user == null) {
                navigate("/login")
            }

            setCurrentUser(user)

            onValue(ref(db, "/users/" + user.uid + "/start-time"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setStartTime(null)
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
            <h1>Timer</h1>
            <div className="timingTimers">
                <ContentCard name="Date" content={startTime != null ? startTime.toLocaleDateString("de") : "Not started"}/>
                <ContentCard name="Start time" content={startTime != null ? startTime.toLocaleTimeString("de") : "Not started"}/>
            </div>

            <div className="timingTimers">
                <Timer name="Worked" timer={workTimer}/>
                <Timer name="Break" timer={breakTimer}/>
            </div>

            <div className="timerButtons">
                <button onClick={toggleOverallTimer}>{workTimer.getIsRunning ? "Stop" : "Start"}</button>
                <button onClick={toggleBreakTimer}>{breakTimer.getIsRunning ? "Stop break" : "Start break"}</button>
                <button className={startTime != null ? "" : "disabled"} onClick={startTime != null ? resetTimers : null}>Reset and save</button>
            </div>

            <div className="saved">
                <div className="saveTitle"><b>Saved</b></div>
                {
                    saved.map(save => {
                        return <SavedCard key={save.id} save={save} isExpanded={false}/>
                    })
                }
                {
                    saved.length == 0 ? <div className="saveNoSaves">No saves</div> : null
                }
            </div>
        </div>
    );
}

export default Timing;