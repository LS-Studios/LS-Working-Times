import React, {useEffect, useRef, useState} from 'react';
import "./Timing.css"
import Timer from "./timer/Timer";
import {TimerClass} from "./timer/TimerClass";
import ContentCard from "./contentcard/ContentCard";
import {DateTime} from "./timer/DateTime";
import SavedCard from "./save/SavedCard";

function Timing() {
    const [startTime, setStartTime] = useState(null);
    const [saved, setSaved] = useState([]);

    const [overallHours, setOverallHours] = useState(0);
    const [overallMinutes, setOverallMinutes] = useState(0);
    const [workSeconds, setWorkSeconds] = useState(0);
    const [overallIsRunning, setOverallIsRunning] = useState(false);
    const [overallBreakTime, setOverallBreakTime] = useState(null);
    const [overallTakenBreak, setOverallTakenBreak] = useState(new DateTime(0, 0, 0));

    const overallTimer = new TimerClass(
        overallHours, setOverallHours,
        overallMinutes, setOverallMinutes,
        workSeconds, setWorkSeconds,
        startTime, setStartTime,
        overallBreakTime, setOverallBreakTime,
        overallTakenBreak, setOverallTakenBreak,
        overallIsRunning, setOverallIsRunning)

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
        if (overallIsRunning) {
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
        if (overallIsRunning) {
            overallTimer.getTime()
        }
        if (breakIsRunning) {
            breakTimer.getTime()
        }
    }, 1000);

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