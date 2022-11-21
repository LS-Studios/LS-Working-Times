import React, {useRef, useState} from 'react';
import "./TimeInput.css"
import {AiFillCaretUp} from "react-icons/ai"
import {AiFillCaretDown} from "react-icons/ai"
import {padTo2Digits} from "../../helper/Helper";

function TimeInput({currentState, setCurrentState, maxTimeVal, increasePartner}) {
    const input = useRef(null);

    const onChange = (e) => {
        if (/[0-9.]/.test(e.target.value[e.target.value.length - 1])) setCurrentState(e.target.value)
        else setCurrentState(currentState)
    }

    const increase = () => {
        if (parseInt(currentState)+1 <= maxTimeVal) {
            setCurrentState(padTo2Digits(parseInt(currentState)+1))
        } else {
            if (increasePartner != null) {
                increasePartner()
                setCurrentState("00")
            }
        }
    }

    const decrease = () => {
        if (parseInt(currentState)-1 >= 0) {
            setCurrentState(padTo2Digits(parseInt(currentState)-1))
        } else {
            setCurrentState(maxTimeVal.toString())
        }
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

    return (
        <div className="timeInputRow">
            <AiFillCaretUp className="timeInputRowChangeButton" onClick={increase}/>
            <form onSubmit={submit}>
                <input className="changeTimeDialogInput" value={currentState} ref={input} type="text" onChange={onChange} onKeyDown={onKeyDown}/>
            </form>
            <AiFillCaretDown className="timeInputRowChangeButton" onClick={decrease}/>
        </div>
    );
}

export default TimeInput;