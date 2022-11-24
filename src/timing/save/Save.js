import React, {useRef, useState} from 'react';
import {IoCaretBack, IoCaretForward} from "react-icons/io5";
import DatePicker, {Calendar} from "react-multi-date-picker";
import SavedCard from "./card/SavedCard";
import "./DateTimePicker.scss"
import "./Save.css"
import {formatDate, getDateFromString, getEndOfWeek, getStartOfWeek, getStartOfWeekDayValue} from "../../helper/Helper";
import ClipLoader from "react-spinners/ClipLoader";
import {t} from "../../helper/Translation/Transalation";

function Save({saved, selectedSaveDate, setSelectedSaveDate, isLoading}) {
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

    const loadingSpinner = <ClipLoader
        cssOverride={{marginBottom: 8}}
        color="#CCCCCC"
        size={15}
        speedMultiplier={0.8}
    />

    return (
        <div className="saved">
            <div className="saveTitle"><b>{t("timer.saved")}</b></div>
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
                isLoading ? loadingSpinner : (saved.filter(save => {
                    const saveDate = getDateFromString(save.date)
                    return saveDate >= getStartOfWeek(selectedSaveDate) && saveDate <= getEndOfWeek(selectedSaveDate)
                }).length === 0 ? <div className="saveNoSaves">{t("timer.noSaves")}</div> : null)
            }
        </div>
    );
}

export default Save;