import React, {useState} from 'react';
import "./WorkingDayCard.scss"
import {getThemeClass} from "../../helper/Theme/Theme";
import {BsPlusLg} from "react-icons/bs";
import Card from "../../cards/Card";
import ToggleContent from "../../cards/ToggleInput/ToggleContent";
import {t} from "../../helper/LanguageTransaltion/Transalation";
import WorkingDayRangeCard from "./card/WorkingDayRangeCard";
import {DateTime} from "../../timing/timer/DateTime";

function WorkingDayCard({day, workingDays, setWorkingDays}) {
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
                    <b>{t("prognosis.weekDay"+day[1])}</b>

                    <div className={getThemeClass("divider")}/>

                    <ToggleContent currentState={currentTimeType} setCurrentState={(newState) => {
                        setCurrentTimeType(newState)
                        workingDays[day[1]][3] = newState
                    }} toggleList={[t("prognosis.undefined"), t("prognosis.defined")]}/>

                    {
                        currentTimeType == 1 ? <div>
                            <div className={getThemeClass("divider")}/>

                            <div className="workingDayCardRangeList">
                                {
                                    day[2].map((workingDayRange, i) => {
                                        return <WorkingDayRangeCard key={i} workingDayIndex={day[1]} rangeIndex={i} workingDays={workingDays} setWorkingDays={setWorkingDays}/>
                                    })
                                }
                            </div>

                            <div className={getThemeClass("divider")}/>

                            <BsPlusLg className={getThemeClass("workingDayCardAddButton")} onClick={addRange}/>
                        </div> : null
                    }
                </div>
            </div>
        }/>
    );
}

export default WorkingDayCard;