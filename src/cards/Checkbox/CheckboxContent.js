import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import "./CheckboxContent.scss"
import {getThemeClass} from "../../helper/Theme/Theme";
import {AiFillCaretUp} from "react-icons/ai"
import {AiFillCaretDown} from "react-icons/ai"

const CheckboxContent = forwardRef(({title, checkboxList, currentState, setCurrentState}, ref) => {
    const [expanded, setExpanded] = useState(false)

    const getSelectedDays = () => {
        let result = []

        for (let i = 0; i < checkboxList.length; i++) {
            if (currentState[i]) {
                result.push(checkboxList[i])
            }
        }

        return result.join(", ")
    }

    return (
        <div className="checkboxContentContainer">
            <div><b>{title}</b></div>
            <div className={getThemeClass("divider")}/>
            {
                !expanded ? <div className="checkboxSelectedNames">{getSelectedDays()}</div> : null
            }
            <div className={expanded ? "checkboxBar" : "gone"}>
                {
                    checkboxList.map((checkbox, i) => {
                        return (
                            <label className={getThemeClass("checkboxContainer")}>
                                <div className="checkboxText">{checkbox}</div>
                                <input
                                    key={checkbox}
                                    id={checkbox}
                                    checked={currentState[i]}
                                    onChange={() => {
                                        const newState = [...currentState]
                                        newState[i] = !newState[i]
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
                expanded ? <AiFillCaretUp className={expanded ? getThemeClass("checkboxExpandButtonExpanded") : getThemeClass("checkboxExpandButtonNotExpanded")} onClick={() => setExpanded(!expanded)}/> :
                    <AiFillCaretDown className={expanded ? getThemeClass("checkboxExpandButtonExpanded") : getThemeClass("checkboxExpandButtonNotExpanded")} onClick={() => setExpanded(!expanded)}/>
            }
        </div>
    );
})

export default CheckboxContent;