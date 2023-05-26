import React, {useEffect, useState} from 'react';
import {IoCaretBack, IoCaretForward} from "react-icons/io5";
import "./ContentInWeekCard.scss"
import {getStartOfWeekDayValue, formatDate, getStartOfWeek, getEndOfWeek, getDateFromString} from "@LS-Studios/date-helper"
import {Card, DateContent, Spinner, SpinnerType, Title} from "@LS-Studios/components";
import {Gone, GoneType} from "@LS-Studios/general";

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
                <DateContent style={{width:"82%"}} useBackgroundColor={false} customSelectedText={selectedDateText} currentState={selectedDate} setCurrentState={setSelectedDate} />
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
                isLoading ? <Spinner type={SpinnerType.dots}/> : <Gone style={{paddingBottom: 12}} isVisible={
                    (dataArray.filter(data => {
                        const date = getDateFromString(data.date)
                        return date >= getStartOfWeek(selectedDate) && date <= getEndOfWeek(selectedDate)
                    }).length === 0)} goneType={GoneType.SCALE} >
                    <div style={{fontStyle:"italic"}}>
                        {noItemMessage}
                    </div>
                </Gone>
            }
        </Card>
    );
}

export default ContentInWeekCard;