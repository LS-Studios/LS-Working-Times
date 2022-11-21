import {useDialog} from "use-react-dialog";
import "./ChangeTimeDialog.css"
import ButtonCard from "../../cards/Button/ButtonCard";
import React, {useEffect, useRef, useState} from "react";
import {getDatabase, ref, set, get} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import Dialog from "../Dialog";
import TimeInput from "./TimeInput";
import {padTo2Digits} from "../../helper/Helper";
import {DateTime} from "../../timing/timer/DateTime";

const ChangeTimeDialog = () => {
    const [currentHourState, setCurrentHourState] = useState("00")
    const [currentMinuteState, setCurrentMinuteState] = useState("00")
    const [currentSecondState, setCurrentSecondState] = useState("00")

    const increaseHour = () => {
        if (parseInt(currentHourState)+1 <= 24)
            setCurrentHourState(padTo2Digits(parseInt(currentHourState)+1))
    }

    const increaseMinute = () => {
        if (parseInt(currentMinuteState)+1 <= 24)
            setCurrentMinuteState(padTo2Digits(parseInt(currentMinuteState)+1))
    }

    const { closeCurrentDialog, isOpen, openCurrentDialog, data } = useDialog('ChangeTimeDialog', {type: "start-time"});

    const changeTime = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        set(ref(db, "/users/"+auth.currentUser.uid+"/"+data.type), new DateTime(parseInt(currentHourState), parseInt(currentMinuteState), parseInt(currentSecondState)).toTimeString())

        closeCurrentDialog()
    }

    useEffect(() => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        //Todo wenn noch keine daten geladen black screen

        get(ref(db, "/users/"+auth.currentUser.uid+"/"+data.type)).then((snapshot) => {
            if (snapshot.exists()) {
                const dateTime = DateTime.dateTimeFromString(snapshot.val())
                setCurrentHourState(padTo2Digits(dateTime.getHours))
                setCurrentMinuteState(padTo2Digits(dateTime.getMinutes))
                setCurrentSecondState(padTo2Digits(dateTime.getSeconds))
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }, [])

    return (
        <Dialog title={"Change Time"} dialogContent={
            <div>
                <div className="changeTimeDialogInputRow">
                    <TimeInput currentState={currentHourState} setCurrentState={setCurrentHourState} maxTimeVal={24}/>
                    <TimeInput currentState={currentMinuteState} setCurrentState={setCurrentMinuteState} maxTimeVal={60} increasePartner={increaseHour}/>
                    <TimeInput currentState={currentSecondState} setCurrentState={setCurrentSecondState} maxTimeVal={60} increasePartner={increaseMinute}/>
                </div>

                <div className="horizontalButtons">
                    <ButtonCard className="horizontalButtonCard" title="Cancel" action={closeCurrentDialog}/>
                    <ButtonCard className="horizontalButtonCard" title="Confirm" action={changeTime}/>
                </div>
            </div>
        } />
    );
}

export default ChangeTimeDialog