import {useDialog} from "use-react-dialog";
import "./EditSaveDialog.css"
import ButtonCard from "../../cards/Button/ButtonCard";
import React, {useEffect, useRef, useState} from "react";
import {getDatabase, ref, set, get} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import Dialog from "../Dialog";
import {formatDate, padTo2Digits} from "../../helper/Helper";
import {DateTime} from "../../timing/timer/DateTime";
import DateTimeInput from "../time/TimeInput/DateTimeInput";

const EditSaveTimeDialog = () => {
    const [startTimeHourState, setStartTimeHourState] = useState("00")
    const [startTimeMinuteState, setStartTimeMinuteState] = useState("00")
    const [startTimeSecondState, setStartTimeSecondState] = useState("00")

    const [workedTimeHourState, setWorkedTimeHourState] = useState("00")
    const [workedTimeMinuteState, setWorkedTimeMinuteState] = useState("00")
    const [workedTimeSecondState, setWorkedTimeSecondState] = useState("00")

    const [breakTimeHourState, setBreakTimeHourState] = useState("00")
    const [breakTimeMinuteState, setBreakTimeMinuteState] = useState("00")
    const [breakTimeSecondState, setBreakTimeSecondState] = useState("00")

    const { closeCurrentDialog, isOpen, openCurrentDialog, data } = useDialog('EditSaveTimeDialog', {save: null});

    const updateSave = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        set(ref(db, "/users/"+auth.currentUser.uid+"/saved/"+data.save.id), {
            id:data.save.id,
            date:data.save.date,
            startTime: new DateTime(startTimeHourState, startTimeMinuteState, startTimeSecondState).toTimeString(),
            worked: new DateTime(workedTimeHourState, workedTimeMinuteState, workedTimeSecondState).toTimeString(),
            break: new DateTime(breakTimeHourState, breakTimeMinuteState, breakTimeSecondState).toTimeString(),
        })

        closeCurrentDialog()
    }

    useEffect(() => {
        const startTimeDateTime = DateTime.dateTimeFromString(data.save.startTime)
        setStartTimeHourState(startTimeDateTime.getHours)
        setStartTimeMinuteState(startTimeDateTime.getMinutes)
        setStartTimeSecondState(startTimeDateTime.getSeconds)

        const workedTimeDateTime = DateTime.dateTimeFromString(data.save.worked)
        setWorkedTimeHourState(workedTimeDateTime.getHours)
        setWorkedTimeMinuteState(workedTimeDateTime.getMinutes)
        setWorkedTimeSecondState(workedTimeDateTime.getSeconds)

        const breakTimeDateTime = DateTime.dateTimeFromString(data.save.break)
        setBreakTimeHourState(breakTimeDateTime.getHours)
        setBreakTimeMinuteState(breakTimeDateTime.getMinutes)
        setBreakTimeSecondState(breakTimeDateTime.getSeconds)
    }, [])

    return (
        <Dialog title={"Change Time"} dialogContent={
            <div className="editSaveTimeDialog">

                <div className="editSaveTimeDialogDivider"></div>

                <h4>Start time</h4>
                <DateTimeInput currentHourState={startTimeHourState} setCurrentHourState={setStartTimeHourState}
                               currentMinuteState={startTimeMinuteState} setCurrentMinuteState={setStartTimeMinuteState}
                               currentSecondState={startTimeSecondState} setCurrentSecondState={setStartTimeSecondState}/>

                <h4>Worked time</h4>
                <DateTimeInput currentHourState={workedTimeHourState} setCurrentHourState={setWorkedTimeHourState}
                               currentMinuteState={workedTimeMinuteState} setCurrentMinuteState={setWorkedTimeMinuteState}
                               currentSecondState={workedTimeSecondState} setCurrentSecondState={setWorkedTimeSecondState}/>

                <h4>Break time</h4>
                <DateTimeInput currentHourState={breakTimeHourState} setCurrentHourState={setBreakTimeHourState}
                               currentMinuteState={breakTimeMinuteState} setCurrentMinuteState={setBreakTimeMinuteState}
                               currentSecondState={breakTimeSecondState} setCurrentSecondState={setBreakTimeSecondState}/>

                <div className="editSaveTimeDialogDivider"></div>

                <div className="horizontalButtons">
                    <ButtonCard className="horizontalButtonCard" title="Cancel" action={closeCurrentDialog}/>
                    <ButtonCard className="horizontalButtonCard" title="Confirm" action={updateSave}/>
                </div>
            </div>
        } />
    );
}

export default EditSaveTimeDialog