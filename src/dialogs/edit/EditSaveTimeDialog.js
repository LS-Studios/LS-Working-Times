import "./EditSaveDialog.scss"
import React, {useEffect, useRef, useState} from "react";
import {getDatabase, ref, set, get} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {formatDate, getDateFromString, padTo2Digits} from "@LS-Studios/date-helper";
import {DateTime} from "../../timing/timer/DateTime";
import {useComponentDialog} from "@LS-Studios/components/contextproviders/ComponentDialogProvider"
import {useTranslation} from "@LS-Studios/use-translation";
import {ButtonCard, Divider, TimeInputContent, DateContent, Dialog} from "@LS-Studios/components";

const EditSaveTimeDialog = ({data}) => {
    const translation = useTranslation()
    const dialog = useComponentDialog();

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
        document.body.style.overflow = "visible"
        dialog.closeDialog("EditSaveTimeDialog")
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

        set(ref(db, "/users/"+auth.currentUser.uid+"/saved/"+data.save.id), {
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

    const DatePickerLayout = (props) => {
        const open = () => {
            props.openCalendar()
        }
        return (
            <div style={{width: 250}} onClick={open}>
                {props.value}
            </div>
        )
    }

    return (
        <Dialog title={translation.translate("dialog.changeTime")} dialogContent={
            <div className="editSaveTimeDialog">
                <Divider/>

                <h4>{translation.translate("timer.date")}</h4>
                <DateContent currentState={selectedDate} setCurrentState={setSelectedDate}/>

                <h4>{translation.translate("timer.startTime")}</h4>
                <TimeInputContent currentTimeState={startTimeState} setCurrentTimeState={setStartTimeState}/>

                <h4>{translation.translate("timer.endTime")}</h4>
                <TimeInputContent currentTimeState={endTimeState} setCurrentTimeState={setEndTimeState}/>

                <h4>{translation.translate("timer.breakTime")}</h4>
                <TimeInputContent currentTimeState={breakTimeState} setCurrentTimeState={setBreakTimeState}/>

                <Divider/>

                <div className="editSaveTimeDialogActionButtons">
                    <ButtonCard title={translation.translate("dialog.cancel")} action={close}/>
                    <ButtonCard title={translation.translate("dialog.confirm")} action={updateSave}/>
                </div>
            </div>
        } />
    );
}

export default EditSaveTimeDialog