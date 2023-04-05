import React from 'react';
import "./PlanningCard.scss";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {getDatabase, ref, remove} from "firebase/database";
import ContentCard from "../../cards/contentinweek/content/ContentCard";
import {useTranslation} from "@LS-Studios/use-translation";
import {getDateNameByString} from "@LS-Studios/date-helper";
import {useComponentDialog} from "@LS-Studios/components";

const PlanningCard = ({data, isExpanded=false}) => {
    const translation = useTranslation()
    const dialog = useComponentDialog();

    const deletePlan = (e) => {
        dialog.openDialog("YesNoDialog", {message:translation.translate("dialog.doYouRelayWantToDeleteThisPlan"), yesAction:() => {
                const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
                const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")

                const auth = getAuth(lsWalletApp)
                remove(ref(getDatabase(lsWorkingTimesApp), "/users/" + auth.currentUser.uid + "/plannings/"+data.id))
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