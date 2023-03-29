import "./EditPlanningDialog.scss"
import React, {useEffect, useRef, useState} from "react";
import {getDatabase, ref, set, get} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {formatDate, getDateFromString} from "@LS-Studios/date-helper";
import {useComponentDialog} from "@LS-Studios/components/contextproviders/ComponentDialogProvider"
import {useTranslation} from "@LS-Studios/use-translation"
import {ButtonCard, Divider, TimeInputContent, InputContent, Dialog} from "@LS-Studios/components";

const EditSaveTimeDialog = ({data}) => {
    const translation = useTranslation()
    const dialog = useComponentDialog();

    const [currentNewPlanInput, setCurrentNewPlanInput] = useState("");
    const [currentPlanDate, setCurrentPlanDate] = useState(new Date());

    useEffect(() => {
        setCurrentNewPlanInput(data.plan.content)
        setCurrentPlanDate(getDateFromString(data.plan.date))
    }, [])

    const close = () => {
        document.body.style.overflow = "visible"
        dialog.closeDialog("EditSaveTimeDialog")
    }

    const updatePlan = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        set(ref(db, "/users/"+auth.currentUser.uid+"/plannings/"+data.plan.id), {
            id:data.plan.id,
            date:formatDate(currentPlanDate),
            content:currentNewPlanInput
        })

        close()
    }

    return (
        <Dialog title={translation.translate("dialog.changePlan")} dialogContent={
            <div className="editPlanningHolder">
                <Divider/>

                <h4>{translation.translate("planning.description")}</h4>
                <InputContent currentState={currentNewPlanInput}
                              setCurrentState={setCurrentNewPlanInput} inputType={3}
                              placeholder={translation.translate("planning.placeholder")}/>

                <h4>{translation.translate("planning.dateOfPlan")}</h4>
                <TimeInputContent currentState={currentPlanDate} setCurrentState={setCurrentPlanDate} type="date"/>

                <Divider/>

                <div className="editPlanDialogActionButtons">
                    <ButtonCard title={translation.translate("dialog.cancel")} action={close}/>
                    <ButtonCard title={translation.translate("dialog.confirm")} action={updatePlan}/>
                </div>
            </div>
        } />
    );
}

export default EditSaveTimeDialog