import React, {useState} from 'react';
import "./SaveCard.scss"
import {DateTime} from "../../classes/DateTime";
import {getDatabase, ref, remove} from "firebase/database"
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/config/LSWorkingTimesConfig";
import ContentCard from "../content/ContentCard";
import {useComponentDialog, useComponentUserAuth} from "@LS-Studios/components";
import {useTranslation} from "@LS-Studios/use-translation";
import {getDateNameByString} from "@LS-Studios/date-helper";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";

function SavedCard({data, isExpanded}) {
    const translation = useTranslation()
    const auth = useComponentUserAuth()
    const dialog = useComponentDialog();

    const getEndTimeString = () => {
        const startDateTime = DateTime.dateTimeFromString(data.startTime)
        const workedDateTime = DateTime.dateTimeFromString(data.worked)
        const breakDateTime = DateTime.dateTimeFromString(data.break)
        const endDateTime = startDateTime.addDateTime(workedDateTime).addDateTime(breakDateTime)

        return endDateTime.toTimeString()
    }

    const deleteSave = (e) => {
        dialog.openDialog("YesNoDialog", {message:translation.translate("dialog.doYouRelayWantToDeleteThisSave"), yesAction:() => {
            remove(ref(getFirebaseDB(), "/users/" + auth.user.id + "/saved/"+data.id))
        }})
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