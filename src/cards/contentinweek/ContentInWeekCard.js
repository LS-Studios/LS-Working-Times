import React, {useEffect, useState} from 'react';
import {IoCaretBack, IoCaretForward} from "react-icons/io5";
import "./ContentInWeekCard.scss"
import {getStartOfWeekDayValue, formatDate, getStartOfWeek, getEndOfWeek, getDateFromString} from "@LS-Studios/date-helper"
import {Card, DateContent, Spinner, SpinnerType, Title} from "@LS-Studios/components";
import {Gone, GoneType} from "@LS-Studios/general";
import WeekSelectComponent from "../../components/weekselect/WeekSelectComponent";

function ContentInWeekCard({dataArray, title, noItemMessage, ItemCard, selectedDate, setSelectedDate, isLoading}) {
    return (
        <Card>
            <Title value={title} />

            <WeekSelectComponent selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

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