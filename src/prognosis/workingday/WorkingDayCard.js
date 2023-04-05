import React, {useState} from 'react';
import "./WorkingDayCard.scss"
import {BsPlusLg} from "react-icons/bs";
import WorkingDayRangeCard from "./card/WorkingDayRangeCard";
import {DateTime} from "../../timing/timer/DateTime";
import {Card, Divider, ToggleContent, useComponentTheme} from "@LS-Studios/components";
import {useTranslation} from "@LS-Studios/use-translation";

function WorkingDayCard({day, workingDays, setWorkingDays}) {
    const translation = useTranslation()
    const theme = useComponentTheme()

    const addRange = () => {
        setWorkingDays(current => {
            let newWorkingDays = JSON.parse(JSON.stringify(current))
            newWorkingDays[day[1]][2].push([new DateTime(8, 0, 0), new DateTime(18, 0, 0)])
            return newWorkingDays
        })
    }

    const [currentTimeType, setCurrentTimeType] = useState(0);

    return (
        <Card cardContent={
            <div className="workingDayCardHolder">
                <div className='workingDayCardTitle'>
                    <b>{translation.translate("prognosis.weekDay"+day[1])}</b>

                    <div className={theme.getThemeClass("divider")}/>

                    <ToggleContent currentState={currentTimeType} setCurrentState={(newState) => {
                        setCurrentTimeType(newState)
                        workingDays[day[1]][3] = newState
                    }} toggleList={[translation.translate("prognosis.undefined"), translation.translate("prognosis.defined")]}/>

                    {
                        currentTimeType == 1 ? <div>
                            <Divider />

                            <div className="workingDayCardRangeList">
                                {
                                    day[2].map((workingDayRange, i) => {
                                        return <WorkingDayRangeCard key={i} workingDayIndex={day[1]} rangeIndex={i} workingDays={workingDays} setWorkingDays={setWorkingDays}/>
                                    })
                                }
                            </div>

                            <Divider />

                            <BsPlusLg className={theme.getThemeClass("workingDayCardAddButton")} onClick={addRange}/>
                        </div> : null
                    }
                </div>
            </div>
        }/>
    );
}

export default WorkingDayCard;