import React, {useState} from 'react';
import "./WorkingDayCard.scss"
import {getThemeClass} from "../../helper/Theme/Theme";
import {BsPlusLg} from "react-icons/bs";
import Card from "../../cards/Card";
import ToggleContent from "../../cards/ToggleInput/ToggleContent";
import {t} from "../../helper/LanguageTransaltion/Transalation";
import WorkingDayRangeCard from "./card/WorkingDayRangeCard";

function WorkingDayCard({day, workingDays, setWorkingDays}) {
    const [expanded, setExpanded] = useState(false)

    const [currentTimeType, setCurrentTimeType] = useState(0);

    const setDaytimeType = (newType) => {
        setCurrentTimeType(newType)
    }

    return (
        <Card cardContent={
            <div className="workingDayCardHolder">
                <div className='workingDayCardTitle'>
                    <b>{t("prognosis.weekDay"+day[1])}</b>

                    <div className={getThemeClass("divider")}/>

                    <ToggleContent currentState={currentTimeType} setCurrentState={setDaytimeType} toggleList={[t("prognosis.undefined"), t("prognosis.defined")]}/>

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

                            <BsPlusLg className={getThemeClass("workingDayCardAddButton")} onClick={() => setExpanded(!expanded)}/>
                        </div> : null
                    }
                </div>
            </div>
        }/>
    );
}

export default WorkingDayCard;