import "./Timer.css"
import ValueCard from "../../cards/Value/ValueCard";
import ClipLoader from "react-spinners/ClipLoader";
import {DateTime} from "./DateTime";
import React from "react";
import {getCurrentTheme} from "../../helper/Theme/Theme";

function Timer({name, timer, isLoading, clickable, onClick}) {
    const getThemeSpinnerColor = () => {
        switch (getCurrentTheme()) {
            case "dark":
                return "#CCCCCC";
            case "bright":
                return "#353535";
        }
    }

    const loadingSpinner = <ClipLoader
        color={getThemeSpinnerColor()}
        size={15}
        speedMultiplier={0.8}
    />

    return (
        <ValueCard title={name} value={isLoading ? loadingSpinner : (
            new DateTime(timer.getHours, timer.getMinutes, timer.getSeconds).toTimeString())
        } clickable={clickable} onClick={onClick}/>
    );
}

export default Timer;