import React, {useEffect, useState} from 'react';
import "./Timer.css"

function Timer(props) {
    const [currentInterval, setCurrentInterval] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [stopped, setStopped] = useState(false);
    const [startTime, setStartTime] = useState(new Date());
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    const getTime = () => {
        console.log(isRunning)

        const time = Date.now() - startTime;

        setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
        setMinutes(Math.floor((time / 1000 / 60) % 60));
        setSeconds(Math.floor((time / 1000) % 60));
    };

    const startTimer = () => {
        setIsRunning(true)
        if (currentInterval == null) {
            setCurrentInterval(setInterval(() => {
                getTime(startTime)
            }, 1000))
        }
    };

    const stopTimer = () => {
        setIsRunning(false)
        clearInterval(currentInterval)
        setCurrentInterval(null)
        setStopped(true)
    };

    const reset = () => {
        stopTimer()
        setSeconds(0)
        setMinutes(0)
        setSeconds(0)
        setStartTime(new Date())
        setStopped(false)
    };

    return (
        <div className="timer">
            <h1 className="timerCounter">
                {
                    (hours.toString().length == 1 ? "0" + hours : hours)
                    + ":" +
                    (minutes.toString().length == 1 ? "0" + minutes : minutes)
                    + ":" +
                    (seconds.toString().length == 1 ? "0" + seconds : seconds)
                }
            </h1>
            <div className="timerButtons">
                <button className={isRunning || stopped  ? "disabled" : ""} onClick={startTimer}>Start</button>
                <button className={!isRunning ? "disabled" : ""} onClick={stopTimer}>Stop</button>
                <button onClick={reset}>Restart</button>
            </div>
        </div>
    );
}

export default Timer;