import React from 'react';
import "./PlanningCard.scss";
import {ref, remove} from "firebase/database";
import ContentCard from "../content/ContentCard";
import {getDateNameByString} from "@LS-Studios/date-helper";
import {
    useContextDialog,
    useContextGlobalVariables,
    useContextTranslation,
    useContextUserAuth
} from "@LS-Studios/components";
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";

const PlanningCard = ({data, isExpanded=false}) => {
    const translation = useContextTranslation()
    const dialog = useContextDialog();
    const auth = useContextUserAuth()
    const globalVariables = useContextGlobalVariables()

    const deletePlan = (e) => {
        dialog.openDialog("OptionDialog", {
            title: translation.translate("dialog.deletePlan"),
            message: translation.translate("dialog.doYouRelayWantToDeleteThisPlan"),
            options: [{
                name: translation.translate("dialog.yes"),
                action: () => remove(ref(getFirebaseDB(), getCurrentTimerPath(globalVariables.getLSVar("currentTimerId"), auth.user) + "/plannings/"+data.id))
            }, {
                name: translation.translate("dialog.no")
            }]
        })
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