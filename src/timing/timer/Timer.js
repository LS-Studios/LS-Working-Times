import "./Timer.css"
import {DateTime} from "./DateTime";
import React from "react";
import {Spinner, ValueCard} from "@LS-Studios/components";

function Timer({name, timer, isLoading, clickAction}) {
    return (
        <ValueCard title={name} value={isLoading ? <Spinner type="dots"/> : (
            new DateTime(timer.getHours, timer.getMinutes, timer.getSeconds).toTimeString())
        } clickAction={clickAction}/>
    );
}

export default Timer;