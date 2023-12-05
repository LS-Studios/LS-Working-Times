import React, {useEffect, useState} from 'react';
import {
    formatDate,
    getDateWithoutTime,
    getEndOfWeek,
    getStartOfWeek,
    getStartOfWeekDayValue
} from "@LS-Studios/date-helper";
import {IoCaretBack, IoCaretForward} from "react-icons/io5";
import {DateContent, useContextTranslation} from "@LS-Studios/components";
import "./WeekSelectComponent.scss"

function WeekSelectComponent({ justFuture=false, selectedDate, setSelectedDate }) {
    const translation = useContextTranslation()

    const [selectedDateText, setSelectedDateText] = useState("")

    useEffect(() => {
        setSelectedDateText(
            formatDate(getStartOfWeek(selectedDate), translation) + " - " + formatDate(getEndOfWeek(selectedDate), translation)
        )
    }, [selectedDate])

    const getSavesOfPreviousWeek = () => {
        const pastWeekDate = new Date(new Date(selectedDate).setDate(getStartOfWeekDayValue(selectedDate)-7))

        if (justFuture && pastWeekDate <= getStartOfWeek(new Date()))
            return

        setSelectedDate(pastWeekDate)
    }

    const getSavesOfNextWeek = () => {
        setSelectedDate(new Date(new Date(selectedDate).setDate(getStartOfWeekDayValue(selectedDate)+7)))
    }

    return (
        <div className="weekSelect">
            <IoCaretBack className="contentInWeekSelectIcon" onClick={getSavesOfPreviousWeek}/>
            <DateContent useBackgroundColor={false}
                         customSelectedText={selectedDateText}
                         currentState={selectedDate}
                         setCurrentState={setSelectedDate}
                         minDate={justFuture ? getStartOfWeek(new Date()) : null}
            />
            <IoCaretForward className="contentInWeekSelectIcon" onClick={getSavesOfNextWeek}/>
        </div>
    );
}

export default WeekSelectComponent;