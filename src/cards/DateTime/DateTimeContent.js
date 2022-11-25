import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import "./DateTimeContent.scss"
import "./DateTimePicker.scss"
import DatePicker from "react-multi-date-picker"
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import {getThemeClass} from "../../helper/Theme/Theme";

const DateTimeContent = ({title, value, type}) => {
    const [startDate, setStartDate] = useState(value);

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
            <div onClick={open}>
                {props.value}
            </div>
        )
    }

    return (
        <div className="dateTimeContainer" onClick={onClick}>
            <div><b>{title}</b></div>
            <div className={getThemeClass("divider")}/>
            {
                type == "date"
                    ?
                    <DatePicker
                        portal
                        ref={datePickerRef}
                        inputMode="none"
                        editable={false}
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
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
                        value={startDate}
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