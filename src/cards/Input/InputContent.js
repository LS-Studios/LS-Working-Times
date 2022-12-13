import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import "./InputContent.scss"
import {getThemeClass} from "../../helper/Theme/Theme";
import {BsFillEyeFill, BsFillEyeSlashFill} from "react-icons/bs"

const InputContent = ({title, placeholder, type="text", focusOnClick=false, useDivider=true, inputType=0, submitFunc, blurFunction, currentState, setCurrentState}) => {
    const input = useRef(null);

    const [showPassword, setShowPassword] = useState(false)

    const onChange = (e) => {
        const justNumberResult = e.target.value.replace(/\D/g, '')

        switch (inputType) {
            case 0:
                setCurrentState(e.target.value)
                break
            case 1:
                setCurrentState(justNumberResult)
                break
            default:
                setCurrentState(e.target.value)
        }
    }

    const onKeyDown = (e) => {
        if (e.key == "Backspace" && currentState.length == 1) {
            setCurrentState("")
        }
    }

    const changeFocus = () => {
        input.current.blur()

        if (inputType == 1 && currentState == "") {
            setCurrentState("0")
        }

        if (blurFunction != null) blurFunction()
    }

    const submit = (e) => {
        e.preventDefault()

        changeFocus()

        if (submitFunc != null)
            submitFunc()
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const showPasswordIcon = showPassword ? <BsFillEyeFill className="inputEye" onClick={toggleShowPassword}/> : <BsFillEyeSlashFill className="inputEye" onClick={toggleShowPassword}/>

    return (
        <div className="inputContainer" onClick={() => focusOnClick ? input.current.focus() : null}>
            {
                title != null ? <div>
                    <div><b>{title}</b></div>
                    <div className={useDivider ? getThemeClass("divider") : ""}/>
                </div> : null
            }
            <form className="inputHolder" onSubmit={submit}>
                {
                    inputType == 3 ? <textarea className={getThemeClass("input")} style={{textAlign: "left"}} ref={input} value={currentState}
                                               placeholder={placeholder} onBlur={changeFocus} onChange={onChange} onKeyDown={onKeyDown} rows={3}/> :
                                    <input className={getThemeClass("input")} ref={input} value={currentState}
                                                type={type === "password" ? (showPassword ? "text" : "password") : type}
                                                placeholder={placeholder} onBlur={changeFocus} onChange={onChange} onKeyDown={onKeyDown}/>

                }
                {type === "password" ? showPasswordIcon : null}
            </form>
        </div>
    );
}

export default InputContent;