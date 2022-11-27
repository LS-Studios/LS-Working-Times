import React from 'react';
import {getThemeClass} from "../../helper/Theme/Theme";
import DateTimeInput from "./DateTimeInput";
import Card from "../Card";
import "./DateTimeInputCard.scss"

function DateTimeInputCard({title, currentTimeState, setCurrentTimeState}) {
    return (
        <Card cardContent={
            <div className="dateTimeInputCard">
                <div><b>{title}</b></div>
                <div className={getThemeClass("divider")}/>
                <DateTimeInput currentTimeState={currentTimeState} setCurrentTimeState={setCurrentTimeState}/>
            </div>
        }/>
    );
}

export default DateTimeInputCard;