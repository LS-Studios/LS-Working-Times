import React from 'react';
import {DateTime} from "../../classes/DateTime";
import {ValueCard} from "@LS-Studios/components";

function TimerComponent({name, clickAction, timer}) {
    return (
        <ValueCard title={name} isLoading={timer.timeIsFetching} value={
            new DateTime(
                timer.currentTime.hours,
                timer.currentTime.minutes,
                timer.currentTime.seconds
            ).toTimeString()
        } clickAction={clickAction}/>
    );
}

export default TimerComponent;