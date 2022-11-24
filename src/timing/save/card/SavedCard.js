import React, {useState} from 'react';
import "./SaveCard.css"
import {DateTime} from "../../timer/DateTime";
import {getDatabase, ref, remove} from "firebase/database"
import {getAuth} from "firebase/auth";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../../firebase/LSWalletConfig";
import {useDialog} from "use-react-dialog";
import {t} from "../../../helper/Translation/Transalation";

function SavedCard({save, isExpanded}) {
    const { dialogs, openDialog } = useDialog();

    const [expanded, setExpanded] = useState(isExpanded)

    const getDateNameByString = (string) => {
        const splitList = string.split(".")
        const date = new Date(splitList[2]+"/"+splitList[1]+"/"+splitList[0])
        return date.toLocaleDateString(t("langKey"), {weekday: 'long'})
    }

    const getEndTimeString = () => {
        const startDateTime = DateTime.dateTimeFromString(save.startTime)
        const workedDateTime = DateTime.dateTimeFromString(save.worked)
        const breakDateTime = DateTime.dateTimeFromString(save.break)
        const endDateTime = startDateTime.addDateTime(workedDateTime).addDateTime(breakDateTime)

        return endDateTime.toTimeString()
    }

    const expand = () => {
        setExpanded(!expanded)
    }

    const deleteSave = (e) => {
        e.stopPropagation();

        openDialog("YesNoDialog", {message:t("dialog.doYouRelayWantToDeleteThisSave"), yesAction:() => {
            const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
            const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")

            const auth = getAuth(lsWalletApp)
            remove(ref(getDatabase(lsWorkingTimesApp), "/users/" + auth.currentUser.uid + "/saved/"+save.id))
        }})
    }

    const editSave = (e) => {
        e.stopPropagation()
        openDialog("EditSaveTimeDialog", {save: save})
    }

    return (
        <div className="saveCardBg" onClick={expand}>
            <div className={expanded ? "saveCardTitleExpanded" : ""}>
                <div><b>{getDateNameByString(save.date)} {t("timer.the")} {save.date}</b></div>
            </div>
            <div className={expanded ? "" : "gone"}>
                <div className="saveCardRowTitle">
                    <div>{t("timer.startedAt")}</div>
                    <div>{t("timer.endedAt")}</div>
                </div>
                <div className="saveCardRowValue">
                    <div>{save.startTime}</div>
                    <div>{getEndTimeString()}</div>
                </div>
                <div className="saveCardRowTitle">
                    <div>{t("timer.workedTime")}</div>
                    <div>{t("timer.breakTime")}</div>
                </div>
                <div className="saveCardRowValue">
                    <div>{save.worked}</div>
                    <div>{save.break}</div>
                </div>
                <div className="saveCardActionBar">
                    <button className="saveCardActionButton" onClick={deleteSave}>{t("timer.delete")}</button>
                    <button className="saveCardActionButton" onClick={editSave}>{t("timer.edit")}</button>
                </div>
            </div>
        </div>
    );
}

export default SavedCard;