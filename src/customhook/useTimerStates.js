import React, {useState} from 'react';
import {DateTime} from "../classes/DateTime";

function useTimerStates() {
    const [startTime, setStartTime] = useState(null)
    const [timeIsRunning, setTimeIsRunning] = useState(false);
    const [timeStopTime, setTimeStopTime] = useState(null);
    const [timeTakenStop, setTimeTakenStop] = useState(new DateTime());

    return {
        startTime, setStartTime,
        timeIsRunning, setTimeIsRunning,
        timeStopTime, setTimeStopTime,
        timeTakenStop, setTimeTakenStop
    }
}

export default useTimerStates;