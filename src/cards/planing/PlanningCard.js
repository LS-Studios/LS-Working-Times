import React from 'react';
import "./PlanningCard.scss";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/config/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/config/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {getDatabase, ref, remove} from "firebase/database";
import ContentCard from "../content/ContentCard";
import {getDateNameByString} from "@LS-Studios/date-helper";
import {useContextDialog, useContextTranslation} from "@LS-Studios/components";

const PlanningCard = ({data, isExpanded=false}) => {
    const translation = useContextTranslation()
    const dialog = useContextDialog();

    const deletePlan = (e) => {
        dialog.openDialog("YesNoDialog", {message:translation.translate("dialog.doYouRelayWantToDeleteThisPlan"), yesAction:() => {
                const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
                const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")

                const auth = getAuth(lsWalletApp)
                remove(ref(getDatabase(lsWorkingTimesApp), "/users/" + auth.user.id + "/plannings/"+data.id))
            }})
    }

    const editPlan = (e) => {
        dialog.openDialog("EditPlanningDialog", {plan: data})
    }

    return (
        <ContentCard title={getDateNameByString(data.date) + " " + translation.translate("timer.the") + " " + data.date} content={
            <div className="planningCardContent">
                <div>{data.content}</div>
            </div>
        } editAction={editPlan} deleteAction={deletePlan} isExpanded={isExpanded} />
    );
};

export default PlanningCard;