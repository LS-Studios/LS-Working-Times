import React from 'react';
import {useContextTranslation, ValueCard} from "@LS-Studios/components";

function TimerComponent({name, clickAction, timer}) {
    const translation = useContextTranslation()

    return (
        <ValueCard title={name} isLoading={timer.timeIsFetching} value={
            timer.currentTime ? timer.currentTime.toTimeString() : translation.translate("timer.notStarted")
        } clickAction={clickAction}/>
    );
}

export default TimerComponent;