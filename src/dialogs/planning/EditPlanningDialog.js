import "./EditPlanningDialog.scss"
import React, {useEffect, useState} from "react";
import {ref, set} from "firebase/database";
import {formatDate, getDateFromString} from "@LS-Studios/date-helper";
import {
    ButtonCard,
    Divider,
    InputContent,
    DateContent, Title, useContextTranslation, useContextDialog, useContextUserAuth, Layout, useContextGlobalVariables
} from "@LS-Studios/components";
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";

const EditPlanningDialog = ({data}) => {
    const translation = useContextTranslation()
    const dialog = useContextDialog();
    const auth = useContextUserAuth()
    const globalVariables = useContextGlobalVariables()

    const [currentNewPlanInput, setCurrentNewPlanInput] = useState("");
    const [currentPlanDate, setCurrentPlanDate] = useState(new Date());

    useEffect(() => {
        setCurrentNewPlanInput(data.plan.content)
        setCurrentPlanDate(getDateFromString(data.plan.date))
    }, [])

    const close = () => {
        dialog.closeTopDialog()
    }

    const updatePlan = () => {
        set(ref(getFirebaseDB(), getCurrentTimerPath(globalVariables.getLSVar("currentTimerId"), auth.user) + "plannings/" + data.plan.id), {
            id:data.plan.id,
            date:formatDate(currentPlanDate, translation),
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

            <Layout>
                <ButtonCard justButton buttonStyle={{width:"100%"}} title={translation.translate("dialog.cancel")} clickAction={close}/>
                <ButtonCard justButton buttonStyle={{width:"100%"}} title={translation.translate("dialog.confirm")} clickAction={updatePlan}/>
            </Layout>
        </>
    );
}

export default EditPlanningDialog