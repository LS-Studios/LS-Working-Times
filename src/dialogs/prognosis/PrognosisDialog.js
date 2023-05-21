import "./PrognosisDialog.scss"
import React, {useEffect, useState} from "react";
import {DateTime} from "../../classes/DateTime";
import {
    Divider,
    TimeInputContent,
    ButtonCard,
    Title,
    useContextTranslation, useContextTheme
} from "@LS-Studios/components";
import {padTo2Digits} from "@LS-Studios/date-helper";

const PrognosisDialog = ({data}) => {
    const translation = useContextTranslation()
    const dialog = useContextTheme();

    const [currentStartTime, setCurrentStartTime] = useState({
        hours: "08",
        minutes: "00",
        seconds: "00"
    })
    const [currentEndTime, setCurrentEndTime] = useState({
        hours: "18",
        minutes: "00",
        seconds: "00"
    })

    useEffect(() => {
        const startTime = data.workingDays[data.workingDayIndex][2][data.rangeIndex][0]
        const endTime = data.workingDays[data.workingDayIndex][2][data.rangeIndex][1]

        setCurrentStartTime({
            hours: padTo2Digits(startTime.hours),
            minutes: padTo2Digits(startTime.minutes),
            seconds: padTo2Digits(startTime.seconds)
        })
        setCurrentEndTime({
            hours: padTo2Digits(endTime.hours),
            minutes: padTo2Digits(endTime.minutes),
            seconds: padTo2Digits(endTime.seconds)
        })
    },[])

    const close = () => {
        dialog.closeTopDialog()
    }

    const updatePrognosis = () => {
        data.setWorkingDays(current => {
            const newWorkingDays = current
            newWorkingDays[data.workingDayIndex][2][data.rangeIndex][0] = new DateTime(currentStartTime.hours, currentStartTime.minutes, currentStartTime.seconds)
            newWorkingDays[data.workingDayIndex][2][data.rangeIndex][1] = new DateTime(currentEndTime.hours, currentEndTime.minutes, currentEndTime.seconds)
            return newWorkingDays
        });

        close()
    }

    return (
        <>
            <Title value={translation.translate("dialog.changeTime")} style={{fontSize:20}}/>
            <Divider marginBottom={5}/>

            <h4>{translation.translate("timer.startTime")}</h4>
            <TimeInputContent currentTimeState={currentStartTime} setCurrentTimeState={setCurrentStartTime}/>

            <h4>{translation.translate("timer.endTime")}</h4>
            <TimeInputContent currentTimeState={currentEndTime} setCurrentTimeState={setCurrentEndTime}/>

            <Divider/>

            <div className="prognosisDialogActionButtons">
                <ButtonCard title={translation.translate("dialog.cancel")} clickAction={close}/>
                <ButtonCard title={translation.translate("dialog.confirm")} clickAction={updatePrognosis}/>
            </div>
        </>
    );
}

export default PrognosisDialog