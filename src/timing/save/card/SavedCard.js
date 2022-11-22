import React, {useState} from 'react';
import "./SaveCard.css"
import {DateTime} from "../../timer/DateTime";
import {getDatabase, ref, remove} from "firebase/database"
import {getAuth} from "firebase/auth";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../../firebase/LSWalletConfig";
import {useDialog} from "use-react-dialog";

function SavedCard({save, isExpanded}) {
    const { dialogs, openDialog } = useDialog();

    const [expanded, setExpanded] = useState(isExpanded)

    const getDateNameByString = (string) => {
        const splitList = string.split(".")
        const date = new Date(splitList[2]+"/"+splitList[1]+"/"+splitList[0])
        return date.toLocaleDateString("en", {weekday: 'long'})
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

        openDialog("YesNoDialog", {message:"Do you really want to delete this save?", yesAction:() => {
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
                <div><b>{getDateNameByString(save.date)} the {save.date}</b></div>
            </div>
            <div className={expanded ? "" : "gone"}>
                <div className="saveCardRowTitle">
                    <div>Started at</div>
                    <div>Ended at</div>
                </div>
                <div className="saveCardRowValue">
                    <div>{save.startTime}</div>
                    <div>{getEndTimeString()}</div>
                </div>
                <div className="saveCardRowTitle">
                    <div>Worked time</div>
                    <div>Break time</div>
                </div>
                <div className="saveCardRowValue">
                    <div>{save.worked}</div>
                    <div>{save.break}</div>
                </div>
                <div className="saveCardActionBar">
                    <button className="saveCardActionButton" onClick={deleteSave}>Delete</button>
                    <button className="saveCardActionButton" onClick={editSave}>Edit</button>
                </div>
            </div>
        </div>
    );
}

export default SavedCard;