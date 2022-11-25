import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import "./InputContent.scss"
import {getThemeClass} from "../../helper/Theme/Theme";

const InputContent = ({title, placeholder, type="text", charType=0, submitFunc, currentState, setCurrentState}) => {
    const input = useRef(null);

    const onChange = (e) => {
        if (/[0-9.]/.test(e.target.value[e.target.value.length-1]) || charType != 1)
            setCurrentState(e.target.value)
        else {
            setCurrentState(currentState)
        }
    }

    const onKeyDown = (e) => {
        if (e.key == "Backspace" && currentState.length == 1) {
            setCurrentState("")
        }
    }

    const changeFocus = () => {
        input.current.blur()
    }

    const submit = (e) => {
        e.preventDefault()

        changeFocus()

        if (submitFunc != null)
            submitFunc()
    }

    return (
        <div className="inputContainer" onClick={() => input.current.focus()}>
            <div><b>{title}</b></div>
            <div className={getThemeClass("divider")}/>
            <form onSubmit={submit}>
                <input className={getThemeClass("input")} ref={input} value={currentState} type={type} placeholder={placeholder} onBlur={changeFocus} onChange={onChange} onKeyDown={onKeyDown}/>
            </form>
        </div>
    );
}

export default InputContent;