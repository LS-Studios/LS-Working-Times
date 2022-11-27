import React, {useState} from 'react';
import TimeNumberInput from "./TimeNumberInput";
import "./DateTimeInput.css"
import {padTo2Digits} from "../../helper/Helper";

function DateTimeInput({currentTimeState, setCurrentTimeState}) {
    return (
        <div className="changeTimeDialogInputRow">
            <TimeNumberInput currentState={currentTimeState.hours} setCurrentState={(newValue) => setCurrentTimeState({...currentTimeState, hours: newValue})} maxTimeVal={24}/>
            <TimeNumberInput currentState={currentTimeState.minutes} setCurrentState={(newValue) => setCurrentTimeState({...currentTimeState, minutes: newValue})} maxTimeVal={60}/>
            <TimeNumberInput currentState={currentTimeState.seconds} setCurrentState={(newValue) => setCurrentTimeState({...currentTimeState, seconds: newValue})} maxTimeVal={60}/>
        </div>
    );
}

export default DateTimeInput;