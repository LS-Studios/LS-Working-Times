import React, {useState} from 'react';
import "./SaveCard.scss"
import {DateTime} from "../../timer/DateTime";
import {getDatabase, ref, remove} from "firebase/database"
import {getAuth} from "firebase/auth";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../../firebase/LSWalletConfig";
import {useDialog} from "use-react-dialog";
import {t} from "../../../helper/LanguageTransaltion/Transalation";
import {getThemeClass} from "../../../helper/Theme/Theme";
import ContentCard from "../../../cards/ContentInWeek/content/ContentCard";

function SavedCard({data, isExpanded}) {
    const { dialogs, openDialog } = useDialog();

    const [expanded, setExpanded] = useState(isExpanded)

    const getDateNameByString = (string) => {
        const splitList = string.split(".")
        const date = new Date(splitList[2]+"/"+splitList[1]+"/"+splitList[0])
        return date.toLocaleDateString(t("langKey"), {weekday: 'long'})
    }

    const getEndTimeString = () => {
        const startDateTime = DateTime.dateTimeFromString(data.startTime)
        const workedDateTime = DateTime.dateTimeFromString(data.worked)
        const breakDateTime = DateTime.dateTimeFromString(data.break)
        const endDateTime = startDateTime.addDateTime(workedDateTime).addDateTime(breakDateTime)

        return endDateTime.toTimeString()
    }

    const expand = () => {
        setExpanded(!expanded)
    }

    const deleteSave = (e) => {
        openDialog("YesNoDialog", {message:t("dialog.doYouRelayWantToDeleteThisSave"), yesAction:() => {
            const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
            const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")

            const auth = getAuth(lsWalletApp)
            remove(ref(getDatabase(lsWorkingTimesApp), "/users/" + auth.currentUser.uid + "/saved/"+data.id))
        }})
    }

    const editSave = (e) => {
        openDialog("EditSaveTimeDialog", {save: data})
    }

    return (
        <ContentCard title={getDateNameByString(data.date) + " " + t("timer.the") + " " + data.date} content={
            <div>
                <div className="saveCardRowTitle">
                    <div>{t("timer.startedAt")}</div>
                    <div>{t("timer.endedAt")}</div>
                </div>

                <div className="saveCardRowValue">
                    <div>{data.startTime}</div>
                    <div>{getEndTimeString()}</div>
                </div>

                <div className="saveCardRowTitle">
                    <div>{t("timer.workedTime")}</div>
                    <div>{t("timer.breakTime")}</div>
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