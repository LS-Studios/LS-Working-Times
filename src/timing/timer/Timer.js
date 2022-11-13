import React, {useEffect, useState} from 'react';
import "./Timer.css"

function Timer({name, timer}) {
    return (
        <div className="timer">
            <div>{name}</div>
            <div className="content"><b>
                {
                    (timer.getHours.toString().length == 1 ? "0" + timer.getHours : timer.getHours)
                    + ":" +
                    (timer.getMinutes.toString().length == 1 ? "0" + timer.getMinutes : timer.getMinutes)
                    + ":" +
                    (timer.getSeconds.toString().length == 1 ? "0" + timer.getSeconds : timer.getSeconds)
                }
            </b></div>
        </div>
    );
}

export default Timer;