import React, {useRef, useState} from 'react';
import {IoCaretBack, IoCaretForward} from "react-icons/io5";
import DatePicker, {Calendar} from "react-multi-date-picker";
import SavedCard from "../../timing/save/card/SavedCard";
import "./ContentInWeekCard.scss"
import "../DateTime/DateTimePicker.scss"
import {formatDate, getDateFromString, getEndOfWeek, getStartOfWeek, getStartOfWeekDayValue} from "../../helper/Helper";
import {t} from "../../helper/LanguageTransaltion/Transalation";
import {loadingSpinner} from "../../spinner/LoadingSpinner";
import {getThemeClass} from "../../helper/Theme/Theme";

function ContentInWeekCard({dataArray, title, noItemMessage, ItemCard, selectedDate, setSelectedDate, isLoading}) {
    const datePickerRef = useRef()

    const getSavesOfPreviousWeek = () => {
        setSelectedDate(new Date(selectedDate.setDate(getStartOfWeekDayValue(selectedDate)-7)))
    }

    const getSavesOfNextWeek = () => {
        setSelectedDate(new Date(selectedDate.setDate(getStartOfWeekDayValue(selectedDate)+7)))
    }

    const getWeekRangeString = () => {
        return formatDate(getStartOfWeek(selectedDate)) + " - " + formatDate(getEndOfWeek(selectedDate))
    }

    const DatePickerLayout = (props) => {
        const open = () => {
            props.openCalendar()
        }
        return (
            <div onClick={open}>
                {getWeekRangeString()}
            </div>
        )
    }

    return (
        <div className={getThemeClass("contentInWeekCard")}>
            <div className="contentInWeekCardTitle"><b>{title}</b></div>
            <div className="contentInWeekCardSelect">
                <IoCaretBack className={getThemeClass("contentInWeekSelectIcon")} onClick={getSavesOfPreviousWeek}/>
                <DatePicker
                    portal
                    ref={datePickerRef}
                    inputMode="none"
                    editable={false}
                    value={getStartOfWeek(selectedDate)}
                    onChange={(dateObj) => {
                        const date = new Date(dateObj.year, dateObj.month.number-1, dateObj.day)
                        setSelectedDate(new Date(date.setDate(getStartOfWeekDayValue(date))))
                    }}
                    render={<DatePickerLayout/>}
                    format="DD.MM.YYYY"
                    calendarPosition={"bottom-center"}
                    className={getThemeClass("customPicker")}
                />
                <IoCaretForward className={getThemeClass("contentInWeekSelectIcon")} onClick={getSavesOfNextWeek}/>
            </div>
            {
                dataArray.filter(data => {
                    const date = getDateFromString(data.date)
                    return date >= getStartOfWeek(selectedDate) && date <= getEndOfWeek(selectedDate)
                }).sort((a, b) => {
                    const dateA = getDateFromString(a.date)
                    const dateB = getDateFromString(b.date)
                    return dateA < dateB
                }).map(data => {
                    return <ItemCard key={data.id} data={data} isExpanded={false}/>
                })
            }
            {
                isLoading ? loadingSpinner : (dataArray.filter(data => {
                    const date = getDateFromString(data.date)
                    return date >= getStartOfWeek(selectedDate) && date <= getEndOfWeek(selectedDate)
                }).length === 0 ? <div className="noContent">{noItemMessage}</div> : null)
            }
        </div>
    );
}

export default ContentInWeekCard;