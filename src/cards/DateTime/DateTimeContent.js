import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import "./DateTimeContent.scss"
import "./DateTimePicker.scss"
import DatePicker from "react-multi-date-picker"
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import {getThemeClass} from "../../helper/Theme/Theme";

const DateTimeContent = ({title, currentState, setCurrentState, type}) => {
    const datePickerRef = useRef()

    const onClick = () => {
        if (!datePickerRef.current.isOpen)
            datePickerRef.current.openCalendar()
    }

    const DatePickerLayout = (props) => {
        const open = () => {
            props.openCalendar()
        }
        return (
            <div style={{width: 250}} onClick={open}>
                {props.value}
            </div>
        )
    }

    return (
        <div className="dateTimeContainer" onClick={onClick}>
            {
                title != null ? <div>
                    <div><b>{title}</b></div>
                    <div className={getThemeClass("divider")}/>
                </div> : null
            }
            {
                type == "date"
                    ?
                    <DatePicker
                        portal
                        inputMode="none"
                        editable={false}
                        value={currentState}
                        onChange={(dateObj) => {
                            const date = new Date(dateObj.year, dateObj.month.number-1, dateObj.day)
                            setCurrentState(date)
                        }}
                        render={<DatePickerLayout/>}
                        format="DD.MM.YYYY"
                        calendarPosition={"bottom-center"}
                        className={getThemeClass("customPicker")}
                    />
                    :
                    <DatePicker
                        ref={datePickerRef}
                        portal
                        disableDayPicker
                        editable={false}
                        value={currentState}
                        format="HH:mm"
                        plugins={[
                            <TimePicker hideSeconds  />
                        ]}
                        render={<DatePickerLayout/>}
                        calendarPosition={"bottom-center"}
                        className={getThemeClass("customPicker")}
                    />
            }
        </div>
    );
}

export default DateTimeContent;