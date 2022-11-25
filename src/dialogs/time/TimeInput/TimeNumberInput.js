import React, {useRef, useState} from 'react';
import "./TimeNumberInput.scss"
import {AiFillCaretUp} from "react-icons/ai"
import {AiFillCaretDown} from "react-icons/ai"
import {padTo2Digits} from "../../../helper/Helper";
import {getThemeClass} from "../../../helper/Theme/Theme";

function TimeNumberInput({currentState, setCurrentState, maxTimeVal}) {
    const input = useRef(null);

    const onChange = (e) => {
        const justNumberResult = e.target.value.replace(/\D/g, '')

        if (parseInt(justNumberResult) >= maxTimeVal)
            setCurrentState(maxTimeVal-1)
        else
            setCurrentState(justNumberResult)
    }

    const increase = () => {
        if (parseInt(currentState)+1 < maxTimeVal)
            setCurrentState(padTo2Digits(parseInt(currentState)+1))
        else
            setCurrentState("00")
    }

    const decrease = () => {
        if (parseInt(currentState)-1 >= 0)
            setCurrentState(padTo2Digits(parseInt(currentState)-1))
        else
            setCurrentState((maxTimeVal-1).toString())
    }

    const onKeyDown = (e) => {
        if (e.key == "Backspace" && currentState.length == 1) {
            setCurrentState("")
        }
    }

    const submit = (e) => {
        e.preventDefault()

        input.current.blur()
    }

    const changeFocus = () => {
        if (currentState == "") {
            setCurrentState("00")
        }
    }

    return (
        <div className="timeInputRow">
            <AiFillCaretUp className={getThemeClass("timeInputRowChangeButton")} onClick={increase}/>
            <form onSubmit={submit}>
                <input className={getThemeClass("changeTimeDialogInput")} value={currentState} onBlur={changeFocus} ref={input} type="text" onChange={onChange} onKeyDown={onKeyDown}/>
            </form>
            <AiFillCaretDown className={getThemeClass("timeInputRowChangeButton")} onClick={decrease}/>
        </div>
    );
}

export default TimeNumberInput;