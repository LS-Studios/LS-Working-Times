import React, {useState} from 'react';
import TimeNumberInput from "./TimeNumberInput";
import "./DateTimeInput.css"
import {padTo2Digits} from "../../../helper/Helper";

function DateTimeInput({currentHourState, setCurrentHourState, currentMinuteState, setCurrentMinuteState, currentSecondState, setCurrentSecondState}) {
    return (
        <div className="changeTimeDialogInputRow">
            <TimeNumberInput currentState={currentHourState} setCurrentState={setCurrentHourState} maxTimeVal={24}/>
            <TimeNumberInput currentState={currentMinuteState} setCurrentState={setCurrentMinuteState} maxTimeVal={60}/>
            <TimeNumberInput currentState={currentSecondState} setCurrentState={setCurrentSecondState} maxTimeVal={60}/>
        </div>
    );
}

export default DateTimeInput;