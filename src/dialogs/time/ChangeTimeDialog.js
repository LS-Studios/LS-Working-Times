import "./ChangeTimeDialog.css"
import React, {useEffect, useState} from "react";
import {getDatabase, ref, set, get} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {padTo2Digits} from "../../helper/Helper";
import {DateTime} from "../../timing/timer/DateTime";
import {useComponentDialog} from "@LS-Studios/components/contextproviders/ComponentDialogProvider";
import {useTranslation} from "@LS-Studios/use-translation/TranslationProvider";
import Dialog from "@LS-Studios/components/";
import DateTimeInput from "@LS-Studios/components/";
import DropdownContent from "@LS-Studios/components/";
import ButtonCard from "@LS-Studios/components/";

const ChangeTimeDialog = ({ data }) => {
    const translation = useTranslation()
    const dialog = useComponentDialog();

    const [currentTime, setCurrentTime] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00"
    })
    const [state, setState] = useState(null)

    const [originalTime, setOriginalTime] = useState(new DateTime())

    const close = () => {
        document.body.style.overflow = "visible"
        dialog.closeDialog("ChangeTimeDialog")
    }

    const changeTime = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        const newDateTime = new DateTime(
            parseInt(currentTime.hours),
            parseInt(currentTime.minutes),
            parseInt(currentTime.seconds)
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

        setCurrentTime({...currentTime, hours: padTo2Digits(dateTime.getHours),
            minutes: padTo2Digits(dateTime.getMinutes),
            seconds: padTo2Digits(dateTime.getSeconds)})

        setOriginalTime(dateTime)
    }, [])

    return (
        <Dialog title={translation.translate("dialog.changeTime")} dialogContent={
            <div>
                <DateTimeInput currentTimeState={currentTime} setCurrentTimeState={setCurrentTime} />

                <DropdownContent items={["A", "B", "C"]} currentState={state} setCurrentState={setState}/>

                <div className="changeTimeActionButtons">
                    <ButtonCard title={translation.translate("dialog.cancel")} action={close}/>
                    <ButtonCard title={translation.translate("dialog.confirm")} action={changeTime}/>
                </div>
            </div>
        } />
    );
}

export default ChangeTimeDialog