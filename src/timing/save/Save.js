import React, {useRef, useState} from 'react';
import {IoCaretBack, IoCaretForward} from "react-icons/io5";
import DatePicker, {Calendar} from "react-multi-date-picker";
import SavedCard from "./card/SavedCard";
import "./DateTimePicker.scss"
import "./Save.css"
import {formatDate, getDateFromString, getEndOfWeek, getStartOfWeek, getStartOfWeekDayValue} from "../../helper/Helper";

function Save({saved, selectedSaveDate, setSelectedSaveDate}) {
    const datePickerRef = useRef()

    const getSavesOfPreviousWeek = () => {
        setSelectedSaveDate(new Date(selectedSaveDate.setDate(getStartOfWeekDayValue(selectedSaveDate)-7)))
    }

    const getSavesOfNextWeek = () => {
        setSelectedSaveDate(new Date(selectedSaveDate.setDate(getStartOfWeekDayValue(selectedSaveDate)+7)))
    }

    const getWeekRangeString = () => {
        return formatDate(getStartOfWeek(selectedSaveDate)) + " - " + formatDate(getEndOfWeek(selectedSaveDate))
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
        <div className="saved">
            <div className="saveTitle"><b>Saved</b></div>
            <div className="saveWeekSelect">
                <IoCaretBack className="icon" onClick={getSavesOfPreviousWeek}/>
                <DatePicker
                    portal
                    ref={datePickerRef}
                    inputMode="none"
                    editable={false}
                    hideOnScroll
                    value={getStartOfWeek(selectedSaveDate)}
                    onChange={(dateObj) => {
                        const date = new Date(dateObj.year, dateObj.month.number-1, dateObj.day)
                        setSelectedSaveDate(new Date(date.setDate(getStartOfWeekDayValue(date))))
                    }}
                    render={<DatePickerLayout/>}
                    format="DD.MM.YYYY"
                    calendarPosition={"bottom-center"}
                    className="custom-picker"
                />
                <IoCaretForward className="icon" onClick={getSavesOfNextWeek}/>
            </div>
            {
                saved.filter(save => {
                    const saveDate = getDateFromString(save.date)
                    return saveDate >= getStartOfWeek(selectedSaveDate) && saveDate <= getEndOfWeek(selectedSaveDate)
                }).sort((a, b) => {
                    const saveDateA = getDateFromString(a.date)
                    const saveDateB = getDateFromString(b.date)
                   return saveDateA < saveDateB
                }).map(save => {
                    return <SavedCard key={save.id} save={save} isExpanded={false}/>
                })
            }
            {
                saved.filter(save => {
                    const saveDate = getDateFromString(save.date)
                    return saveDate >= getStartOfWeek(selectedSaveDate) && saveDate <= getEndOfWeek(selectedSaveDate)
                }).length === 0 ? <div className="saveNoSaves">No saves</div> : null
            }
        </div>
    );
}

export default Save;