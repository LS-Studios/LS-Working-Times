import React, {useState} from 'react';
import DateTimeInput from "../../cards/timeinput/DateTimeInput";
import {DateTime} from "../../timing/timer/DateTime";
import "./WorkingDayCard.scss"
import {getThemeClass} from "../../helper/Theme/Theme";
import {AiFillCaretDown, AiFillCaretUp} from "react-icons/ai";
import Card from "../../cards/Card";
import ToggleContent from "../../cards/ToggleInput/ToggleContent";
import {t} from "../../helper/LanguageTransaltion/Transalation";

function WorkingDayCard({day}) {
    const [expanded, setExpanded] = useState(false)

    const [daytimeType, setDaytimeType] = useState(0)

    const [currentStartTime, setCurrentStartTime] = useState({
        hours: "08",
        minutes: "00",
        seconds: "00"
    })
    const [currentEndTime, setCurrentEdnTime] = useState({
        hours: "18",
        minutes: "00",
        seconds: "00"
    })

    return (
        <Card cardContent={
            <div className="workingDayCardHolder">
                <div className='workingDayCardTitle'>
                    <b>{day.name}</b>
                    <div className={getThemeClass("divider")}/>
                    <ToggleContent currentState={daytimeType} setCurrentState={setDaytimeType} toggleList={[t("prognosis.undefined"), t("prognosis.defined")]}/>
                    {
                        daytimeType == 1 ? <div>
                                <div className={getThemeClass("divider")}/>
                                <div>{currentStartTime.hours}:{currentStartTime.minutes}:{currentStartTime.seconds}-{currentEndTime.hours}:{currentEndTime.minutes}:{currentEndTime.seconds}</div>
                                <div className={getThemeClass("divider")}/>
                        </div>: null
                    }
                </div>
                <div className={expanded && daytimeType == 1 ? "" : "gone"}>
                    <div>Start time</div>
                    <div className={getThemeClass("divider")}/>
                    <DateTimeInput currentTimeState={currentStartTime} setCurrentTimeState={setCurrentStartTime}/>
                    <div className={getThemeClass("divider")}/>
                    <div>End time</div>
                    <div className={getThemeClass("divider")}/>
                    <DateTimeInput currentTimeState={currentEndTime} setCurrentTimeState={setCurrentEdnTime}/>
                    <div className={getThemeClass("divider")}/>
                </div>
                {
                    daytimeType == 1 ? <div> {
                        expanded ? <AiFillCaretUp
                                className={expanded ? getThemeClass("workingDayCardExpandButtonExpanded") : getThemeClass("workingDayCardExpandButtonNotExpanded")}
                                onClick={() => setExpanded(!expanded)}/> :
                            <AiFillCaretDown
                                className={expanded ? getThemeClass("workingDayCardExpandButtonExpanded") : getThemeClass("workingDayCardExpandButtonNotExpanded")}
                                onClick={() => setExpanded(!expanded)}/>
                    } </div> : null
                }
            </div>
        }/>
    );
}

export default WorkingDayCard;