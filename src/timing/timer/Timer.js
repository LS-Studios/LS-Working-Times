import "./Timer.css"
import ValueCard from "../../cards/Value/ValueCard";
import ClipLoader from "react-spinners/ClipLoader";
import {DateTime} from "./DateTime";
import React from "react";
import {getCurrentTheme} from "../../helper/Theme/Theme";
import {loadingSpinner} from "../../spinner/LoadingSpinner";

function Timer({name, timer, isLoading, clickable, onClick}) {
    return (
        <ValueCard title={name} value={isLoading ? loadingSpinner : (
            new DateTime(timer.getHours, timer.getMinutes, timer.getSeconds).toTimeString())
        } clickable={clickable} onClick={onClick}/>
    );
}

export default Timer;