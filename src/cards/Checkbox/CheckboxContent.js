import React, {forwardRef, useImperativeHandle, useState} from 'react';
import "./CheckboxContent.scss"
import {getThemeClass} from "../../helper/Theme/Theme";
import {AiFillCaretUp} from "react-icons/ai"
import {AiFillCaretDown} from "react-icons/ai"

const CheckboxContent = forwardRef(({title, currentState, setCurrentState}, ref) => {
    const [expanded, setExpanded] = useState(true)

    return (
        <div className="checkboxContentContainer">
            <div><b>{title}</b></div>
            <div className={getThemeClass("divider")}/>
            {
                !expanded ? <div className="checkboxSelectedNames">{currentState.filter(checkboxObj => {
                    return checkboxObj.selected
                }).map(checkboxObj => {
                    return checkboxObj.day
                }).join(", ")}</div> : null
            }
            <div className={expanded ? "checkboxBar" : "gone"}>
                {
                    currentState.map((checkboxObj, i) => {
                        console.log(checkboxObj.day)
                        return (
                            <label className={getThemeClass("checkboxContainer")}>
                                <div className="checkboxText">{checkboxObj.day}</div>
                                <input
                                    key={i}
                                    id={checkboxObj.day}
                                    checked={currentState[i].selected}
                                    onChange={() => {
                                        const newState = [...currentState]
                                        newState[i].selected = !newState[i].selected
                                        setCurrentState(newState)
                                    }}
                                    type="checkbox"
                                />
                                <span className={getThemeClass("checkboxCheckmark")}></span>
                            </label>
                        )
                    })
                }
            </div>
            {
                expanded ? <AiFillCaretUp className={getThemeClass("checkboxExpandButton")} onClick={() => setExpanded(!expanded)}/> :
                    <AiFillCaretDown className={getThemeClass("checkboxExpandButton")} onClick={() => setExpanded(!expanded)}/>
            }
        </div>
    );
})

export default CheckboxContent;