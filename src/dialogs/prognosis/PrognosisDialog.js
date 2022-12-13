import {useDialog} from "use-react-dialog";
import "./PrognosisDialog.scss"
import ButtonCard from "../../cards/Button/ButtonCard";
import React, {useEffect, useRef, useState} from "react";
import Dialog from "../Dialog";
import DateTimeInput from "../../cards/timeinput/DateTimeInput";
import {t} from "../../helper/LanguageTransaltion/Transalation";
import {getThemeClass} from "../../helper/Theme/Theme";
import {DateTime} from "../../timing/timer/DateTime";
import {padTo2Digits} from "../../helper/Helper";

const PrognosisDialog = () => {
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

    const { closeCurrentDialog, isOpen, openCurrentDialog, data } = useDialog('PrognosisDialog', {workingDayIndex: null, rangeIndex: null, workingDays: null, setWorkingDays: null});

    useEffect(() => {
        const startTime = data.workingDays[data.workingDayIndex][2][data.rangeIndex][0]
        const endTime = data.workingDays[data.workingDayIndex][2][data.rangeIndex][1]

        setCurrentStartTime({
            hours: padTo2Digits(startTime.getHours),
            minutes: padTo2Digits(startTime.getMinutes),
            seconds: padTo2Digits(startTime.getSeconds)
        })
        setCurrentEndTime({
            hours: padTo2Digits(endTime.getHours),
            minutes: padTo2Digits(endTime.getMinutes),
            seconds: padTo2Digits(endTime.getSeconds)
        })
    },[])

    const close = () => {
        document.body.style.overflow = "visible"
        closeCurrentDialog()
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
        <Dialog title={t("dialog.changeTime")} dialogContent={
            <div className="editSaveTimeDialog">
                <div className={getThemeClass("editSaveTimeDialogDivider")}></div>

                <h4>{t("timer.startTime")}</h4>
                <DateTimeInput currentTimeState={currentStartTime} setCurrentTimeState={setCurrentStartTime}/>

                <h4>{t("timer.endTime")}</h4>
                <DateTimeInput currentTimeState={currentEndTime} setCurrentTimeState={setCurrentEndTime}/>

                <div className={getThemeClass("editSaveTimeDialogDivider")}></div>

                <div className="editSaveTimeDialogActionButtons">
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.cancel")} action={close}/>
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.confirm")} action={updatePrognosis}/>
                </div>
            </div>
        } />
    );
}

export default PrognosisDialog