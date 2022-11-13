import React, {useEffect, useRef, useState} from 'react';
import "./Timing.css"
import Timer from "./timer/Timer";
import {TimerClass} from "./timer/TimerClass";
import ContentCard from "./contentcard/ContentCard";
import {DateTime} from "./timer/DateTime";

function Timing() {
    const [startTime, setStartTime] = useState(null);

    const [overallHours, setOverallHours] = useState(0);
    const [overallMinutes, setOverallMinutes] = useState(0);
    const [overallSeconds, setOverallSeconds] = useState(0);
    const [overallCurrentInterval, setOverallCurrentInterval] = useState(null);
    const [overallIsRunning, setOverallIsRunning] = useState(false);
    const [overallBreakTime, setOverallBreakTime] = useState(null);
    const [overallTakenBreak, setOverallTakenBreak] = useState(new DateTime(0, 0, 0));

    const overallTimer = new TimerClass(
        overallHours, setOverallHours,
        overallMinutes, setOverallMinutes,
        overallSeconds, setOverallSeconds,
        overallCurrentInterval, setOverallCurrentInterval,
        startTime, setStartTime,
        overallBreakTime, setOverallBreakTime,
        overallTakenBreak, setOverallTakenBreak,
        overallIsRunning, setOverallIsRunning)

    const [breakHours, setBreakHours] = useState(0);
    const [breakMinutes, setBreakMinutes] = useState(0);
    const [breakSeconds, setBreakSeconds] = useState(0);
    const [breakCurrentInterval, setBreakCurrentInterval] = useState(null);
    const [breakIsRunning, setBreakIsRunning] = useState(false);
    const [breakBreakTime, setBreakBreakTime] = useState(null);
    const [breakTakenBreak, setBreakTakenBreak] = useState(new DateTime(0, 0, 0));

    const breakTimer = new TimerClass(
        breakHours, setBreakHours,
        breakMinutes, setBreakMinutes,
        breakSeconds, setBreakSeconds,
        breakCurrentInterval, setBreakCurrentInterval,
        startTime, setStartTime,
        breakBreakTime, setBreakBreakTime,
        breakTakenBreak, setBreakTakenBreak,
        breakIsRunning, setBreakIsRunning)

    const resetTimers = () => {
        overallTimer.resetTimer()
        breakTimer.resetTimer()
    }

    return (
        <div className="timing">
            <div className="timingTimers">
                <ContentCard name="Date" content={startTime != null ? startTime.toLocaleDateString("de") : "Not started"}/>
                <ContentCard name="Start time" content={startTime != null ? startTime.toLocaleTimeString("de") : "Not started"}/>
            </div>

            <div className="timingTimers">
                <Timer name="Overall" timer={overallTimer}/>
                <Timer name="Break" timer={breakTimer}/>
            </div>

            <div className="timerButtons">
                <button onClick={overallTimer.toggleTimer}>{overallTimer.getIsRunning ? "Stop" : "Start"}</button>
                <button onClick={breakTimer.toggleTimer}>{breakTimer.getIsRunning ? "Stop break" : "Start break"}</button>
                <button onClick={resetTimers}>Reset and save</button>
            </div>
        </div>
    );
}

export default Timing;