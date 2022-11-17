import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import "./InputContent.scss"

const InputContent = ({title, placeholder, type="text", charType=0, currentState, setCurrentState}) => {
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

    const submit = (e) => {
        e.preventDefault()

        input.current.blur()

        // if (type==1)
        //     setCurrentState(Math.round(currentState * 100) / 100)
    }

    return (
        <div className="inputContainer" onClick={() => input.current.focus()}>
            <div><b>{title}</b></div>
            <div className="inputDivider"/>
            <form onSubmit={submit}>
                <input className="inputInput" ref={input} value={currentState} type={type} placeholder={placeholder} onBlur={submit} onChange={onChange} onKeyDown={onKeyDown}/>
            </form>
        </div>
    );
}

export default InputContent;