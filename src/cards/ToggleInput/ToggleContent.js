import React, {forwardRef, useImperativeHandle, useState} from 'react';
import "./ToggleContent.scss"
import {getThemeClass} from "../../helper/Theme/Theme";

function ToggleContent({title, toggleList, currentState, setCurrentState}) {
    return (
        <div className="toggleContainer">
            {
                title != null ? <div>
                    <div><b>{title}</b></div>
                    <div className={getThemeClass("divider")}/>
                </div>: null
            }
            <div className="toggleBar">
                {
                    toggleList.map((toggle, i) => {
                        return (
                            <div key={i} className="toggleBar">
                                <input
                                    className={getThemeClass("toggleInput")}
                                    type="radio"
                                    key={toggle}
                                    id={toggle}
                                    value={toggle}
                                    checked={currentState == i}
                                    onChange={() => setCurrentState(i)}
                                />
                                <label
                                    className="toggleText"
                                    onClick={() => setCurrentState(i)}>
                                    {"  " + toggle}
                                </label>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
}

export default ToggleContent;