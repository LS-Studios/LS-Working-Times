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
import TimeNumberInput from "./TimeInput/TimeNumberInput";
import {padTo2Digits} from "../../helper/Helper";
import {DateTime} from "../../timing/timer/DateTime";
import DateTimeInput from "./TimeInput/DateTimeInput";
import {t} from "../../helper/LanguageTransaltion/Transalation";
import {getThemeClass} from "../../helper/Theme/Theme";

const ChangeTimeDialog = () => {
    const [currentHourState, setCurrentHourState] = useState("00")
    const [currentMinuteState, setCurrentMinuteState] = useState("00")
    const [currentSecondState, setCurrentSecondState] = useState("00")

    const [originalTime, setOriginalTime] = useState(new DateTime())

    const { closeCurrentDialog, isOpen, openCurrentDialog, data } = useDialog('ChangeTimeDialog', {value: "00:00:00", type: "break-time"});

    const close = () => {
        document.body.style.overflow = "visible"
        closeCurrentDialog()
    }

    const changeTime = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        const newDateTime = new DateTime(
            parseInt(currentHourState),
            parseInt(currentMinuteState),
            parseInt(currentSecondState)
        )

        get(ref(db, "/users/"+auth.currentUser.uid+"/break-taken-stop")).then((snapshot) => {
            if (snapshot.exists()) {
                const dateTime = originalTime.getAbsoluteDiffToDateTime(newDateTime)
                const newBreakTakenStopTime = DateTime.dateTimeFromString(snapshot.val()).addDateTime(dateTime)
                set(ref(db, "/users/"+auth.currentUser.uid+"/break-taken-stop"), newBreakTakenStopTime.toTimeString())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });

        if (data.type == "start-time") {
            set(ref(db, "/users/"+auth.currentUser.uid+"/start-time"), newDateTime.toTimeString())
        } else if (data.type == "break-time") {
            get(ref(db, "/users/"+auth.currentUser.uid+"/work-taken-stop")).then((snapshot) => {
                if (snapshot.exists()) {
                    const dateTime = originalTime.getAbsoluteDiffToDateTime(newDateTime)
                    const newBreakTakenStopTime = DateTime.dateTimeFromString(snapshot.val()).subtractDateTime(dateTime)

                    set(ref(db, "/users/"+auth.currentUser.uid+"/work-taken-stop"), newBreakTakenStopTime.toTimeString())
                } else {
                    console.log("No data available");
                }
            }).catch((error) => {
                console.error(error);
            });
        }

        close()
    }

    useEffect(() => {
        const dateTime = DateTime.dateTimeFromString(data.value)

        setCurrentHourState(padTo2Digits(dateTime.getHours))
        setCurrentMinuteState(padTo2Digits(dateTime.getMinutes))
        setCurrentSecondState(padTo2Digits(dateTime.getSeconds))

        setOriginalTime(dateTime)
    }, [])

    return (
        <Dialog title={t("dialog.changeTime")} dialogContent={
            <div>
                <DateTimeInput currentHourState={currentHourState} setCurrentHourState={setCurrentHourState}
                               currentMinuteState={currentMinuteState} setCurrentMinuteState={setCurrentMinuteState}
                               currentSecondState={currentSecondState} setCurrentSecondState={setCurrentSecondState}/>

                <div className="changeTimeActionButtons">
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.cancel")} action={close}/>
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.confirm")} action={changeTime}/>
                </div>
            </div>
        } />
    );
}

export default ChangeTimeDialog