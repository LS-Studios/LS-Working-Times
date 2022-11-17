import React, {useEffect, useState} from 'react';
import "./Timer.css"
import ValueCard from "../../cards/Value/ValueCard";

function Timer({name, timer}) {
    return (
        <ValueCard title={name} value={
            (timer.getHours.toString().length == 1 ? "0" + timer.getHours : timer.getHours)
            + ":" +
            (timer.getMinutes.toString().length == 1 ? "0" + timer.getMinutes : timer.getMinutes)
            + ":" +
            (timer.getSeconds.toString().length == 1 ? "0" + timer.getSeconds : timer.getSeconds)
        }/>
    );
}

export default Timer;