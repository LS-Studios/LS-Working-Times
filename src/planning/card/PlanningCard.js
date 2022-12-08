import React, {useState} from 'react';
import "./PlanningCard.scss"
import {getThemeClass} from "../../helper/Theme/Theme";
import {getDateNameByString} from "../../helper/Helper";
import {t} from "../../helper/LanguageTransaltion/Transalation";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {getDatabase, ref, remove} from "firebase/database";
import {useDialog} from "use-react-dialog";
import ContentCard from "../../cards/ContentInWeek/content/ContentCard";

const PlanningCard = ({data, isExpanded=false}) => {
    const { dialogs, openDialog } = useDialog();

    const deletePlan = (e) => {
        openDialog("YesNoDialog", {message:t("dialog.doYouRelayWantToDeleteThisPlan"), yesAction:() => {
                const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
                const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")

                const auth = getAuth(lsWalletApp)
                remove(ref(getDatabase(lsWorkingTimesApp), "/users/" + auth.currentUser.uid + "/plannings/"+data.id))
            }})
    }

    const editPlan = (e) => {
        openDialog("EditPlanningDialog", {plan: data})
    }

    return (
        <ContentCard title={getDateNameByString(data.date) + " " + t("timer.the") + " " + data.date} content={
            <div className="planningCardContent">
                <div>{data.content}</div>
            </div>
        } editAction={editPlan} deleteAction={deletePlan} isExpanded={isExpanded} />
    );
};

export default PlanningCard;