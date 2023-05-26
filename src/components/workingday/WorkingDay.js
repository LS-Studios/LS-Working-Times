import React, {useState} from 'react';
import "./WorkingDay.scss"
import {BsPlusLg} from "react-icons/bs";
import WorkingDayCard from "../../cards/workingday/WorkingDayCard";
import {DateTime} from "../../classes/DateTime";
import {
    Card,
    Divider,
    ListContent,
    Title,
    ToggleContent,
    useContextTheme,
    useContextTranslation
} from "@LS-Studios/components";
import {Gone} from "@LS-Studios/general";
import PrognosisCard from "../../cards/prognosis/PrognosisCard";

function WorkingDay({day, workingDays, setWorkingDays}) {
    const translation = useContextTranslation()

    const addRange = () => {
        setWorkingDays(current => {
            let newWorkingDays = JSON.parse(JSON.stringify(current))
            newWorkingDays[day[1]][2].push([new DateTime(8, 0, 0), new DateTime(18, 0, 0)])
            return newWorkingDays
        })
    }

    const [currentTimeType, setCurrentTimeType] = useState(0);

    return (
        <Card>
            <>
                <Title value={translation.translate("prognosis.weekDay"+day[1])} />

                <Divider />

                <ToggleContent currentState={currentTimeType} setCurrentState={(newState) => {
                    setCurrentTimeType(newState)
                    workingDays[day[1]][3] = newState
                }} toggleList={[translation.translate("prognosis.undefined"), translation.translate("prognosis.defined")]}/>

                <Gone isVisible={currentTimeType == 1}>
                    <Divider />

                    <ListContent items={day[2]}
                                 noItemsText={translation.translate("prognosis.noTimeRanges")}
                                 itemMapFunc={day[2].map((workingDayRange, i) => {
                                     return <WorkingDayCard key={i} workingDayIndex={day[1]} rangeIndex={i} workingDays={workingDays} setWorkingDays={setWorkingDays}/>
                                 })}/>

                    <Divider />

                    <BsPlusLg className="workingDayCardAddButton" onClick={addRange}/>
                </Gone>
            </>
        </Card>
    );
}

export default WorkingDay;