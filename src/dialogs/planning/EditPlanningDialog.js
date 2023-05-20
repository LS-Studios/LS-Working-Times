import "./EditPlanningDialog.scss"
import React, {useEffect, useState} from "react";
import {getDatabase, ref, set} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/config/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/config/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {formatDate, getDateFromString} from "@LS-Studios/date-helper";
import {useTranslation} from "@LS-Studios/use-translation"
import {
    ButtonCard,
    Divider,
    InputContent,
    Dialog,
    useComponentDialog,
    DateContent, Title
} from "@LS-Studios/components";

const EditPlanningDialog = ({data}) => {
    const translation = useTranslation()
    const dialog = useComponentDialog();

    const [currentNewPlanInput, setCurrentNewPlanInput] = useState("");
    const [currentPlanDate, setCurrentPlanDate] = useState(new Date());

    useEffect(() => {
        setCurrentNewPlanInput(data.plan.content)
        setCurrentPlanDate(getDateFromString(data.plan.date))
    }, [])

    const close = () => {
        dialog.closeDialog("EditPlanningDialog")
    }

    const updatePlan = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        set(ref(db, "/users/"+auth.user.id+"/plannings/"+data.plan.id), {
            id:data.plan.id,
            date:formatDate(currentPlanDate),
            content:currentNewPlanInput
        })

        close()
    }

    return (
        <>
            <Title value={translation.translate("dialog.changePlan")} style={{fontSize:20}}/>
            <Divider marginBottom={5}/>

            <div style={{marginTop:8}}><b>{translation.translate("planning.description")}</b></div>
            <InputContent isBold={false} currentState={currentNewPlanInput}
                          setCurrentState={setCurrentNewPlanInput} inputType={3}
                          placeholder={translation.translate("planning.placeholder")}/>

            <b>{translation.translate("planning.dateOfPlan")}</b>
            <DateContent currentState={currentPlanDate} setCurrentState={setCurrentPlanDate} type="date"/>

            <Divider marginTop={16}/>

            <div className="editPlanDialogActionButtons">
                <ButtonCard title={translation.translate("dialog.cancel")} clickAction={close}/>
                <ButtonCard title={translation.translate("dialog.confirm")} clickAction={updatePlan}/>
            </div>
        </>
    );
}

export default EditPlanningDialog