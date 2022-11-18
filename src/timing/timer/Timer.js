import "./Timer.css"
import ValueCard from "../../cards/Value/ValueCard";
import {getFormattedTime} from "../../helper/Helper";
import {DateTime} from "./DateTime";

function Timer({name, timer}) {
    return (
        <ValueCard title={name} value={
            new DateTime(timer.getHours, timer.getMinutes, timer.getSeconds).toTimeString()
        }/>
    );
}

export default Timer;