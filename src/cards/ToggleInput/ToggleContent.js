import React, {forwardRef, useImperativeHandle, useState} from 'react';
import "./ToggleContent.scss"

const ToggleContent = forwardRef(({title, toggleList, currentState, setCurrentState}, ref) => {
    useImperativeHandle(ref, () => ({

        onClick() {

        }

    }));

    return (
        <div className="toggleContainer">
            <div><b>{title}</b></div>
            <div className="toggleDivider"/>
            <div className="toggleBar">
                {
                    toggleList.map((toggle, i) => {
                        return (
                            <div className="toggleBar">
                                <input
                                    className="toggleInput"
                                    type="radio"
                                    key={i}
                                    id={toggle}
                                    value={toggle}
                                    checked={currentState == i}
                                    onChange={() => setCurrentState(i)}
                                />
                                <label
                                    className="toggleText"
                                    htmlFor={toggle}>
                                    {"  " + toggle}
                                </label>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
})

export default ToggleContent;