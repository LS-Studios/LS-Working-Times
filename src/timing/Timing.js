import React, {useEffect, useRef, useState} from 'react';
import "./Timing.css"
import Timer from "./timer/Timer";
import {TimerClass} from "./timer/TimerClass";
import ContentCard from "./contentcard/ContentCard";
import {DateTime} from "./timer/DateTime";

function Timing() {
    const [startTime, setStartTime] = useState(new Date());

    const [overallHours, setOverallHours] = useState(0);
    const [overallMinutes, setOverallMinutes] = useState(0);
    const [overallSeconds, setOverallSeconds] = useState(0);
    const [overallCurrentInterval, setOverallCurrentInterval] = useState(null);
    const [overallIsRunning, setOverallIsRunning] = useState(false);

    const overallTimer = new TimerClass(
        overallHours, setOverallHours,
        overallMinutes, setOverallMinutes,
        overallSeconds, setOverallSeconds,
        overallCurrentInterval, setOverallCurrentInterval,
        startTime, setStartTime,
        overallIsRunning, setOverallIsRunning)

    const [breakHours, setBreakHours] = useState(0);
    const [breakMinutes, setBreakMinutes] = useState(0);
    const [breakSeconds, setBreakSeconds] = useState(0);
    const [breakCurrentInterval, setBreakCurrentInterval] = useState(null);
    const [breakSsRunning, setBreakIsRunning] = useState(false);

    const breakTimer = new TimerClass(
        breakHours, setBreakHours,
        breakMinutes, setBreakMinutes,
        breakSeconds, setBreakSeconds,
        breakCurrentInterval, setBreakCurrentInterval,
        startTime, setStartTime,
        breakSsRunning, setBreakIsRunning)

    const resetTimers = () => {
        overallTimer.resetTimer()
        breakTimer.resetTimer()
    }

    return (
        <div className="timing">
            <div className="timingTimers">
                <ContentCard name="Date" content={startTime.toLocaleDateString("de")}/>
                <ContentCard name="Start time" content={startTime.toLocaleTimeString("de")}/>
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