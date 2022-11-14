import React, {useEffect, useRef, useState} from 'react';
import "./Timing.css"
import Timer from "./timer/Timer";
import {TimerClass} from "./timer/TimerClass";
import ContentCard from "./contentcard/ContentCard";
import {DateTime} from "./timer/DateTime";
import SavedCard from "./save/SavedCard";

import { initializeApp } from "firebase/app"
import { getDatabase, ref, onValue, set } from "firebase/database"
import firebaseConfig from "../firebase/config";

function Timing() {
    const [startTime, setStartTime] = useState(null);
    const [saved, setSaved] = useState([]);

    const [overallHours, setOverallHours] = useState(0);
    const [overallMinutes, setOverallMinutes] = useState(0);
    const [workSeconds, setWorkSeconds] = useState(0);
    const [workIsRunning, setWorkIsRunning] = useState(false);
    const [workBreakTime, setWorkBreakTime] = useState(null);
    const [workTakenBreak, setWorkTakenBreak] = useState(new DateTime(0, 0, 0));

    const overallTimer = new TimerClass(
        overallHours, setOverallHours,
        overallMinutes, setOverallMinutes,
        workSeconds, setWorkSeconds,
        startTime, setStartTime,
        workBreakTime, setWorkBreakTime,
        workTakenBreak, setWorkTakenBreak,
        workIsRunning, setWorkIsRunning)

    const [breakHours, setBreakHours] = useState(0);
    const [breakMinutes, setBreakMinutes] = useState(0);
    const [breakSeconds, setBreakSeconds] = useState(0);
    const [breakIsRunning, setBreakIsRunning] = useState(false);
    const [breakBreakTime, setBreakBreakTime] = useState(new DateTime());
    const [breakTakenBreak, setBreakTakenBreak] = useState(new DateTime(0, 0, 0));

    const breakTimer = new TimerClass(
        breakHours, setBreakHours,
        breakMinutes, setBreakMinutes,
        breakSeconds, setBreakSeconds,
        startTime, setStartTime,
        breakBreakTime, setBreakBreakTime,
        breakTakenBreak, setBreakTakenBreak,
        breakIsRunning, setBreakIsRunning)

    const resetTimers = () => {
        overallTimer.resetTimer()
        breakTimer.resetTimer()

        setSaved(prevState => (
            [{
                date:startTime.toLocaleDateString("de"),
                startTime: startTime.toLocaleTimeString("de"),
                worked: new DateTime(overallHours, overallMinutes, workSeconds).toTimeString(),
                break: new DateTime(breakHours, breakMinutes, breakSeconds).toTimeString()
            }].concat(prevState)
        ))
    }

    const toggleOverallTimer = () => {
        if (workIsRunning) {
            overallTimer.stopTimer()
        } else {
            overallTimer.startTimer()
            breakTimer.stopTimer()
        }
    }

    const toggleBreakTimer = () => {
        if (breakIsRunning) {
            breakTimer.stopTimer()
        } else {
            breakTimer.startTimer()
            overallTimer.stopTimer()
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
        if (workIsRunning) {
            overallTimer.getTime()
        }
        if (breakIsRunning) {
            breakTimer.getTime()
        }
    }, 1000);

    useEffect(() => {
        const app = initializeApp(firebaseConfig)
        const db = getDatabase(app)
        onValue(ref(db, "/start-time"), snapshot => {
            const data = snapshot.val()

            if (data == "")
                setStartTime(null)
            else
                setStartTime(DateTime.dateTimeFromString(data).getDate())
        })
        onValue(ref(db, "/work-break-time"), snapshot => {
            const data = snapshot.val()

            if (data == "")
                setWorkBreakTime(null)
            else
                setWorkBreakTime(DateTime.dateTimeFromString(data))
        })
        onValue(ref(db, "/work-taken-break"), snapshot => {
            const data = snapshot.val()

            if (data == "")
                setWorkTakenBreak(null)
            else
                setWorkTakenBreak(DateTime.dateTimeFromString(data))
        })
        onValue(ref(db, "/break-break-time"), snapshot => {
            const data = snapshot.val()

            if (data == "")
                setBreakBreakTime(null)
            else
                setBreakBreakTime(DateTime.dateTimeFromString(data))
        })
        onValue(ref(db, "/break-taken-break"), snapshot => {
            const data = snapshot.val()

            if (data == "")
                setBreakTakenBreak(null)
            else
                setBreakTakenBreak(DateTime.dateTimeFromString(data))
        })

        set(ref(db, "/start-time"), startTime != null ? startTime.toLocaleDateString("de") : "")
    }, [])

    return (
        <div className="timing">
            <div className="timingTimers">
                <ContentCard name="Date" content={startTime != null ? startTime.toLocaleDateString("de") : "Not started"}/>
                <ContentCard name="Start time" content={startTime != null ? startTime.toLocaleTimeString("de") : "Not started"}/>
            </div>

            <div className="timingTimers">
                <Timer name="Worked" timer={overallTimer}/>
                <Timer name="Break" timer={breakTimer}/>
            </div>

            <div className="timerButtons">
                <button onClick={toggleOverallTimer}>{overallTimer.getIsRunning ? "Stop" : "Start"}</button>
                <button onClick={toggleBreakTimer}>{breakTimer.getIsRunning ? "Stop break" : "Start break"}</button>
                <button onClick={resetTimers}>Reset and save</button>
            </div>

            <div className="saved">
                <div className="saveTitle"><b>Saved</b></div>
                {
                    saved.map((save, i) => {
                        return <SavedCard save={save} index={i} isExpanded={false}/>
                    })
                }
            </div>
        </div>
    );
}

export default Timing;