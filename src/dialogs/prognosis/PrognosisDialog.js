import "./PrognosisDialog.scss"
import React, {useEffect, useRef, useState} from "react";
import {DateTime} from "../../timing/timer/DateTime";
import {padTo2Digits} from "../../helper/Helper";
import Dialog from "@LS-Studios/components/dialog/Dialog"
import {useComponentDialog} from "@LS-Studios/components/contextproviders/ComponentDialogProvider"
import {useTranslation} from "@LS-Studios/use-translation";
import {Divider, TimeInputContent, ButtonCard} from "@LS-Studios/components";

const PrognosisDialog = ({data}) => {
    const translation = useTranslation()
    const dialog = useComponentDialog();

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
        document.body.style.overflow = "visible"
        dialog.closeDialog("PrognosisDialog")
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
        <Dialog title={("dialog.changeTime")} dialogContent={
            <div className="editSaveTimeDialog">
                <Divider/>

                <h4>{translation.translate("timer.startTime")}</h4>
                <TimeInputContent currentTimeState={currentStartTime} setCurrentTimeState={setCurrentStartTime}/>

                <h4>{translation.translate("timer.endTime")}</h4>
                <TimeInputContent currentTimeState={currentEndTime} setCurrentTimeState={setCurrentEndTime}/>

                <Divider/>

                <div className="editSaveTimeDialogActionButtons">
                    <ButtonCard title={translation.translate("dialog.cancel")} action={close}/>
                    <ButtonCard title={translation.translate("dialog.confirm")} action={updatePrognosis}/>
                </div>
            </div>
        } />
    );
}

export default PrognosisDialog