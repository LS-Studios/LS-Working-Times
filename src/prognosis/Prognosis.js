import React, {useEffect, useState} from 'react';
import "./Prognosis.css"
import InputCard from "../cards/Input/InputCard";
import Card from "../cards/Card";
import ToggleContent from "../cards/ToggleInput/ToggleContent";
import DateTimeInput from "../cards/timeinput/DateTimeInput";
import {getThemeClass} from "../helper/Theme/Theme";
import CheckboxCard from "../cards/Checkbox/CheckboxCard";
import DateTimeInputCard from "../cards/timeinput/DateTimeInputCard";
import {t} from "../helper/LanguageTransaltion/Transalation";

function Prognosis({setCurrentMenu}) {
    const [hoursPerWeekInput, setHoursPerWeekInput] = useState("40")
    const [alreadyWorkedState, setAlreadyWorkedState] = useState(0)
    const [alreadyWorkedTime, setAlreadyWorkedTime] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00"
    })

    const [earliestStartTime, setEarliestStartTime] = useState({
        hours: "08",
        minutes: "00",
        seconds: "00"
    })
    const [latestEndTime, setLatestEndTime] = useState({
        hours: "18",
        minutes: "00",
        seconds: "00"
    })

    const [workingDays, setWorkingDays] = useState([
        {day: t("prognosis.monday"), selected: true},
        {day: t("prognosis.tuesday"), selected: true},
        {day: t("prognosis.wednesday"), selected: true},
        {day: t("prognosis.thursday"), selected: true},
        {day: t("prognosis.friday"), selected: true},
        {day: t("prognosis.saturday"), selected: false},
        {day: t("prognosis.sunday"), selected: false},
    ])

    const fillEmptyTimeField = (currentState, setCurrentState) => {
        if (currentState == "") {
            setCurrentState("0")
        }
    }

    useEffect(() => {
        setCurrentMenu(2)
    }, [])

    return (
        <div className="prognosis">
            <InputCard title={t("prognosis.hoursPerWeek")} charType={1}  focusOnClick={true} blurFunction={() => fillEmptyTimeField(hoursPerWeekInput, setHoursPerWeekInput)} currentState={hoursPerWeekInput} setCurrentState={setHoursPerWeekInput}/>
            <Card cardContent={
                <div>
                    <ToggleContent title={t("prognosis.alreadyWorked")} currentState={alreadyWorkedState} setCurrentState={setAlreadyWorkedState} toggleList={[t("prognosis.current"), t("prognosis.custom")]}/>
                    <div className={getThemeClass("divider")}/>
                    <div className="prognosisAlreadyWorkedToggle">
                        {
                            alreadyWorkedState == 0 ? <div>16:02:22</div> : <DateTimeInput currentTimeState={alreadyWorkedTime} setCurrentTimeState={setAlreadyWorkedTime}/>
                        }
                    </div>
                </div>
            }/>
            <CheckboxCard title="Working days" currentState={workingDays} setCurrentState={setWorkingDays}/>
            <DateTimeInputCard title={t("prognosis.earliestStartTime")} currentTimeState={earliestStartTime} setCurrentTimeState={setEarliestStartTime}/>
            <DateTimeInputCard title={t("prognosis.latestEndTime")} currentTimeState={latestEndTime} setCurrentTimeState={setLatestEndTime}/>
        </div>
    );
}

export default Prognosis;