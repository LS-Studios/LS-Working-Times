import React, {useEffect, useState} from 'react';
import {IoCaretBack, IoCaretForward} from "react-icons/io5";
import "./ContentInWeekCard.scss"
import {getStartOfWeekDayValue, formatDate, getStartOfWeek, getEndOfWeek, getDateFromString} from "@LS-Studios/date-helper"
import {Card, DateContent, Spinner, Title} from "@LS-Studios/components";

function ContentInWeekCard({dataArray, title, noItemMessage, ItemCard, selectedDate, setSelectedDate, isLoading}) {
    const [selectedDateText, setSelectedDateText] = useState("")

    useEffect(() => {
        setSelectedDateText(
            formatDate(
                getStartOfWeek(selectedDate)) + " - " + formatDate(getEndOfWeek(selectedDate)
            )
        )
    }, [selectedDate])

    const getSavesOfPreviousWeek = () => {
        setSelectedDate(new Date(selectedDate.setDate(getStartOfWeekDayValue(selectedDate)-7)))
    }

    const getSavesOfNextWeek = () => {
        setSelectedDate(new Date(selectedDate.setDate(getStartOfWeekDayValue(selectedDate)+7)))
    }

    return (
        <Card>
            <Title value={title} />

            <div className="contentInWeekCardSelect">
                <IoCaretBack className="contentInWeekSelectIcon" onClick={getSavesOfPreviousWeek}/>
                <DateContent style={{width:"85%"}} useBackgroundColor={false} customSelectedText={selectedDateText} currentState={selectedDate} setCurrentState={setSelectedDate} />
                <IoCaretForward className="contentInWeekSelectIcon" onClick={getSavesOfNextWeek}/>
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
                isLoading ? <Spinner type="dots"/> : (dataArray.filter(data => {
                    const date = getDateFromString(data.date)
                    return date >= getStartOfWeek(selectedDate) && date <= getEndOfWeek(selectedDate)
                }).length === 0 ? <div className="noContent">{noItemMessage}</div> : null)
            }
        </Card>
    );
}

export default ContentInWeekCard;