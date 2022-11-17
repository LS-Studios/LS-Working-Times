import React, {useRef, useState} from 'react';
import {IoCaretBack, IoCaretForward} from "react-icons/io5";
import DatePicker, {Calendar} from "react-multi-date-picker";
import SavedCard from "./card/SavedCard";
import "./DateTimePicker.scss"
import "./Save.css"
import {formatDate} from "../../helper/Helper";

function Save({saved}) {
    const [selectedSaveDate, setSelectedSaveDate] = useState(new Date())

    const datePickerRef = useRef()

    const getStartOfWeekDayValue = (date) => {
        date = new Date(date)
        const day = date.getDay()
        const firstDay = date.getDate() - day + (day == 0 ? -6:1) // adjust when day is sunday cause it starts with 0 on sunday
        return firstDay
    }

    const getStartOfWeek = (date) => {
        const startDate = new Date(date.setDate(getStartOfWeekDayValue(date)))
        return new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
        )
    }

    const getEndOfWeek = (date) => {
        const endDate = new Date(date.setDate(getStartOfWeekDayValue(date)+6))
        return new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
        )
    }

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
                    const splitList = save.date.split(".")
                    const saveDate = new Date(splitList[2], splitList[1]-1, splitList[0])
                    return saveDate >= getStartOfWeek(selectedSaveDate) && saveDate <= getEndOfWeek(selectedSaveDate)
                }).sort((a, b) => {
                    const splitListA = a.date.split(".")
                    const saveDateA = new Date(splitListA[2], splitListA[1]-1, splitListA[0])
                    const splitListB = b.date.split(".")
                    const saveDateB = new Date(splitListB[2], splitListB[1]-1, splitListB[0])
                   return saveDateA < saveDateB
                }).map(save => {
                    return <SavedCard key={save.id} save={save} isExpanded={false}/>
                })
            }
            {
                saved.filter(save => {
                    const splitList = save.date.split(".")
                    const saveDate = new Date(splitList[2], splitList[1]-1, splitList[0])
                    return saveDate >= getStartOfWeek(selectedSaveDate) && saveDate <= getEndOfWeek(selectedSaveDate)
                }).length === 0 ? <div className="saveNoSaves">No saves</div> : null
            }
        </div>
    );
}

export default Save;