import "./ChangeTimeDialog.scss"
import React, {useEffect, useState} from "react";
import {ref, set, get} from "firebase/database";
import {DateTime} from "../../classes/DateTime";
import {
    ButtonCard,
    Divider, Layout,
    TimeInputContent,
    Title, useContextDialog, useContextTranslation, useContextUserAuth
} from "@LS-Studios/components";
import {padTo2Digits} from "@LS-Studios/date-helper";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";

const ChangeTimeDialog = ({ data }) => {
    const translation = useContextTranslation()
    const dialog = useContextDialog();
    const [currentTime, setCurrentTime] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00"
    })

    const close = () => {
        dialog.closeTopDialog()
    }

    const changeTime = () => {
        const newDateTime = new DateTime(
            parseInt(currentTime.hours),
            parseInt(currentTime.minutes),
            parseInt(currentTime.seconds)
        )

        data.setNewTime(newDateTime)

        close()
    }

    useEffect(() => {
        const dateTime = data.value

        setCurrentTime({
            hours: padTo2Digits(dateTime.hours),
            minutes: padTo2Digits(dateTime.minutes),
            seconds: padTo2Digits(dateTime.seconds)
        })
    }, [])

    return (
        <>
            <Title value={translation.translate("dialog.changeTime")} style={{fontSize:20}}/>
            <Divider marginBottom={5}/>

            <TimeInputContent currentTimeState={currentTime} setCurrentTimeState={setCurrentTime}/>

            <Layout>
                <ButtonCard justButton buttonStyle={{width:"100%"}} title={translation.translate("dialog.cancel")} clickAction={close}/>
                <ButtonCard justButton buttonStyle={{width:"100%"}} title={translation.translate("dialog.confirm")} clickAction={changeTime}/>
            </Layout>
        </>
    );
}

export default ChangeTimeDialog