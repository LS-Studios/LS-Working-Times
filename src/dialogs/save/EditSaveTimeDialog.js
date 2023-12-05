import "./EditSaveDialog.scss"
import React, {useEffect, useState} from "react";
import {ref, set} from "firebase/database";
import {formatDate, getDateFromString, padTo2Digits} from "@LS-Studios/date-helper";
import {DateTime} from "../../classes/DateTime";
import {
    ButtonCard,
    Divider,
    TimeInputContent,
    DateContent,
    Title, useContextTranslation, useContextDialog, useContextUserAuth, Layout, useContextGlobalVariables
} from "@LS-Studios/components";
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";

const EditSaveTimeDialog = ({data}) => {
    const translation = useContextTranslation()
    const dialog = useContextDialog();
    const auth = useContextUserAuth()
    const globalVariables = useContextGlobalVariables()

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
        const startTime = new DateTime(startTimeState.hours, startTimeState.minutes, startTimeState.seconds)
        const endTime = new DateTime(endTimeState.hours, endTimeState.minutes, endTimeState.seconds)
        const breakTime = new DateTime(breakTimeState.hours, breakTimeState.minutes, breakTimeState.seconds)
        const workedTime = endTime.subtractDateTime(startTime).subtractDateTime(breakTime)

        set(ref(getFirebaseDB(), getCurrentTimerPath(globalVariables.getLSVar("currentTimerId"), auth.user) + "saved/" + data.save.id), {
            id:data.save.id,
            date:formatDate(selectedDate, translation),
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

        setStartTimeState({...startTimeState, hours: padTo2Digits(startTimeDateTime.hours),
            minutes: padTo2Digits(startTimeDateTime.minutes),
            seconds: padTo2Digits(startTimeDateTime.seconds)})

        const endTimeDatTime = startTimeDateTime.addDateTime(workedTimeDateTime).addDateTime(breakTimeDateTime)

        setEndTimeState({...endTimeState, hours: padTo2Digits(endTimeDatTime.hours),
            minutes: padTo2Digits(endTimeDatTime.minutes),
            seconds: padTo2Digits(endTimeDatTime.seconds)})


        setBreakTimeState({...breakTimeState, hours: padTo2Digits(breakTimeDateTime.hours),
            minutes: padTo2Digits(breakTimeDateTime.minutes),
            seconds: padTo2Digits(breakTimeDateTime.seconds)})
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

            <Layout>
                <ButtonCard justButton buttonStyle={{width:"100%"}} title={translation.translate("dialog.cancel")} clickAction={close}/>
                <ButtonCard justButton buttonStyle={{width:"100%"}} title={translation.translate("dialog.confirm")} clickAction={updateSave}/>
            </Layout>
        </>
    );
}

export default EditSaveTimeDialog