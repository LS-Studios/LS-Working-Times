import React from 'react';
import "./SaveCard.scss"
import {DateTime} from "../../classes/DateTime";
import {ref, remove} from "firebase/database"
import ContentCard from "../content/ContentCard";
import {
    useContextDialog,
    useContextGlobalVariables,
    useContextTranslation,
    useContextUserAuth
} from "@LS-Studios/components";
import {getDateNameByString} from "@LS-Studios/date-helper";
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";

function SavedCard({data, isExpanded}) {
    const translation = useContextTranslation()
    const auth = useContextUserAuth()
    const dialog = useContextDialog();
    const globalVariables = useContextGlobalVariables()

    const getEndTimeString = () => {
        const startDateTime = DateTime.dateTimeFromString(data.startTime)
        const workedDateTime = DateTime.dateTimeFromString(data.worked)
        const breakDateTime = DateTime.dateTimeFromString(data.break)
        const endDateTime = startDateTime.addDateTime(workedDateTime).addDateTime(breakDateTime)

        return endDateTime.toTimeString()
    }

    const deleteSave = (e) => {
        dialog.openDialog("OptionDialog", {
            title: translation.translate("dialog.deleteSave"),
            message: translation.translate("dialog.doYouRelayWantToDeleteThisSave"),
            options: [{
                name: translation.translate("dialog.yes"),
                action: () => remove(ref(getFirebaseDB(), getCurrentTimerPath(globalVariables.getLSVar("currentTimerId"), auth.user) + "saved/"+data.id))
            }, {
                name: translation.translate("dialog.no")
            }]
        })
    }

    const editSave = (e) => {
        dialog.openDialog("EditSaveTimeDialog", {save: data})
    }

    return (
        <ContentCard title={getDateNameByString(data.date, translation.translate("langKey")) + " " + translation.translate("timer.the") + " " + data.date} content={
            <div>
                <div className="saveCardRowTitle">
                    <div>{translation.translate("timer.startedAt")}</div>
                    <div>{translation.translate("timer.endedAt")}</div>
                </div>

                <div className="saveCardRowValue">
                    <div>{data.startTime}</div>
                    <div>{getEndTimeString()}</div>
                </div>

                <div className="saveCardRowTitle">
                    <div>{translation.translate("timer.workedTime")}</div>
                    <div>{translation.translate("timer.breakTime")}</div>
                </div>

                <div className="saveCardRowValue">
                    <div>{data.worked}</div>
                    <div>{data.break}</div>
                </div>
            </div>
        } isExpanded={isExpanded} deleteAction={deleteSave} editAction={editSave} />
    );
}

export default SavedCard;