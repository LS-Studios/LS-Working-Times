import "./EditSaveDialog.scss"
import React, {useEffect, useState} from "react";
import {getDatabase, ref, set} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/config/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/config/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {formatDate, getDateFromString, padTo2Digits} from "@LS-Studios/date-helper";
import {DateTime} from "../../classes/DateTime";
import {
    ButtonCard,
    Divider,
    TimeInputContent,
    DateContent,
    Title, useContextTranslation, useContextDialog
} from "@LS-Studios/components";

const EditSaveTimeDialog = ({data}) => {
    const translation = useContextTranslation()
    const dialog = useContextDialog();

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [startTimeState, setStartTimeState] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00"
    })

    const [endTimeState, setEndTimeState] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00"
    })

    const [breakTimeState, setBreakTimeState] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00"
    })

    const close = () => {
        dialog.closeTopDialog()
    }

    const updateSave = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        const startTime = new DateTime(startTimeState.hours, startTimeState.minutes, startTimeState.seconds)
        const endTime = new DateTime(endTimeState.hours, endTimeState.minutes, endTimeState.seconds)
        const breakTime = new DateTime(breakTimeState.hours, breakTimeState.minutes, breakTimeState.seconds)
        const workedTime = endTime.subtractDateTime(startTime).subtractDateTime(breakTime)

        set(ref(db, "/users/"+auth.user.id+"/saved/"+data.save.id), {
            id:data.save.id,
            date:formatDate(selectedDate),
            startTime: startTime.toTimeString(),
            worked: workedTime.toTimeString(),
            break: breakTime.toTimeString(),
        })

        close()
    }

    useEffect(() => {
        const saveDate = getDateFromString(data.save.date)
        setSelectedDate(saveDate)

        const startTimeDateTime = DateTime.dateTimeFromString(data.save.startTime)
        const workedTimeDateTime = DateTime.dateTimeFromString(data.save.worked)
        const breakTimeDateTime = DateTime.dateTimeFromString(data.save.break)

        setStartTimeState({...startTimeState, hours: padTo2Digits(startTimeDateTime.getHours),
            minutes: padTo2Digits(startTimeDateTime.getMinutes),
            seconds: padTo2Digits(startTimeDateTime.getSeconds)})

        const endTimeDatTime = startTimeDateTime.addDateTime(workedTimeDateTime).addDateTime(breakTimeDateTime)

        setEndTimeState({...endTimeState, hours: padTo2Digits(endTimeDatTime.getHours),
            minutes: padTo2Digits(endTimeDatTime.getMinutes),
            seconds: padTo2Digits(endTimeDatTime.getSeconds)})


        setBreakTimeState({...breakTimeState, hours: padTo2Digits(breakTimeDateTime.getHours),
            minutes: padTo2Digits(breakTimeDateTime.getMinutes),
            seconds: padTo2Digits(breakTimeDateTime.getSeconds)})
    }, [])

    return (
        <>
            <Title value={translation.translate("dialog.changeTime")} style={{fontSize:20}}/>
            <Divider marginBottom={5}/>

            <div>{translation.translate("timer.date")}</div>
            <DateContent currentState={selectedDate} setCurrentState={setSelectedDate}/>

            <div>{translation.translate("timer.startTime")}</div>
            <TimeInputContent currentTimeState={startTimeState} setCurrentTimeState={setStartTimeState}/>

            <div>{translation.translate("timer.endTime")}</div>
            <TimeInputContent currentTimeState={endTimeState} setCurrentTimeState={setEndTimeState}/>

            <div>{translation.translate("timer.breakTime")}</div>
            <TimeInputContent currentTimeState={breakTimeState} setCurrentTimeState={setBreakTimeState}/>

            <Divider/>

            <div className="editSaveTimeDialogActionButtons">
                <ButtonCard title={translation.translate("dialog.cancel")} clickAction={close}/>
                <ButtonCard title={translation.translate("dialog.confirm")} clickAction={updateSave}/>
            </div>
        </>
    );
}

export default EditSaveTimeDialog