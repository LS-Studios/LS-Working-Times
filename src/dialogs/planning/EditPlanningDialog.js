import {useDialog} from "use-react-dialog";
import "./EditPlanningDialog.scss"
import ButtonCard from "../../cards/Button/ButtonCard";
import React, {useEffect, useRef, useState} from "react";
import {getDatabase, ref, set, get} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import Dialog from "../Dialog";
import {formatDate, getDateFromString, padTo2Digits} from "../../helper/Helper";
import {DateTime} from "../../timing/timer/DateTime";
import DateTimeInput from "../../cards/timeinput/DateTimeInput";
import DatePicker from "react-multi-date-picker";
import {t} from "../../helper/LanguageTransaltion/Transalation";
import {getThemeClass} from "../../helper/Theme/Theme";
import Card from "../../cards/Card";
import InputContent from "../../cards/Input/InputContent";
import DateTimeContent from "../../cards/DateTime/DateTimeContent";

const EditSaveTimeDialog = () => {
    const [currentNewPlanInput, setCurrentNewPlanInput] = useState("");
    const [currentPlanDate, setCurrentPlanDate] = useState(new Date());

    const { closeCurrentDialog, isOpen, openCurrentDialog, data } = useDialog('EditPlanningDialog', {plan: null});

    useEffect(() => {
        setCurrentNewPlanInput(data.plan.content)
        setCurrentPlanDate(getDateFromString(data.plan.date))
    }, [])

    const close = () => {
        document.body.style.overflow = "visible"
        closeCurrentDialog()
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
        <Dialog title={t("dialog.changePlan")} dialogContent={
            <div className="editPlanningHolder">
                <div className={getThemeClass("divider")}/>

                <h4>{t("planning.description")}</h4>
                <InputContent currentState={currentNewPlanInput}
                              setCurrentState={setCurrentNewPlanInput} inputType={3}
                              placeholder={t("planning.placeholder")}/>

                <h4>{t("planning.dateOfPlan")}</h4>
                <DateTimeContent currentState={currentPlanDate} setCurrentState={setCurrentPlanDate} type="date"/>

                <div className={getThemeClass("editPlanDialogDivider")}></div>

                <div className="editPlanDialogActionButtons">
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.cancel")} action={close}/>
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.confirm")} action={updatePlan}/>
                </div>
            </div>
        } />
    );
}

export default EditSaveTimeDialog