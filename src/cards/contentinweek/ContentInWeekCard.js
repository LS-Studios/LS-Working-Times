import React, {useRef} from 'react';
import {IoCaretBack, IoCaretForward} from "react-icons/io5";
import "./ContentInWeekCard.scss"
import "../DateTime/DateTimePicker.scss"
import {getStartOfWeekDayValue, formatDate, getStartOfWeek, getEndOfWeek, getDateFromString} from "@LS-Studios/date-helper"
import {useComponentTheme} from "@LS-Studios/components/contextproviders/ComponentThemeProvider";
import {DateContent, Spinner} from "@LS-Studios/components";

function ContentInWeekCard({dataArray, title, noItemMessage, ItemCard, selectedDate, setSelectedDate, isLoading}) {
    const theme = useComponentTheme()

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
        <div className={theme.getThemeClass("contentInWeekCard")}>
            <div className="contentInWeekCardTitle"><b>{title}</b></div>
            <div className="contentInWeekCardSelect">
                <IoCaretBack className={theme.getThemeClass("contentInWeekSelectIcon")} onClick={getSavesOfPreviousWeek}/>
                <DateContent currentState={selectedDate} setCurrentState={setSelectedDate} />
                <IoCaretForward className={theme.getThemeClass("contentInWeekSelectIcon")} onClick={getSavesOfNextWeek}/>
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
                isLoading ? <Spinner type="cycle"/> : (dataArray.filter(data => {
                    const date = getDateFromString(data.date)
                    return date >= getStartOfWeek(selectedDate) && date <= getEndOfWeek(selectedDate)
                }).length === 0 ? <div className="noContent">{noItemMessage}</div> : null)
            }
        </div>
    );
}

export default ContentInWeekCard;