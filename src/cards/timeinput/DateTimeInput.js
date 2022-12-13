import React, {useState} from 'react';
import TimeNumberInput from "./TimeNumberInput";
import "./DateTimeInput.css"
import {padTo2Digits} from "../../helper/Helper";

function DateTimeInput({currentTimeState, setCurrentTimeState, maxHourValue=24, maxMinuteValue=60, maxSecondValue=60}) {
    return (
        <div className="changeTimeDialogInputRow">
            <TimeNumberInput currentState={currentTimeState.hours} setCurrentState={(newValue) => setCurrentTimeState({...currentTimeState, hours: newValue})} maxTimeVal={maxHourValue}/>
            <TimeNumberInput currentState={currentTimeState.minutes} setCurrentState={(newValue) => setCurrentTimeState({...currentTimeState, minutes: newValue})} maxTimeVal={maxMinuteValue}/>
            <TimeNumberInput currentState={currentTimeState.seconds} setCurrentState={(newValue) => setCurrentTimeState({...currentTimeState, seconds: newValue})} maxTimeVal={maxSecondValue}/>
        </div>
    );
}

export default DateTimeInput;