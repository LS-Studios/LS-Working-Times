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

const PlanningCard = ({data, isExpanded=false}) => {
    const { dialogs, openDialog } = useDialog();

    const [expanded, setExpanded] = useState(isExpanded)

    const deletePlan = (e) => {
        e.stopPropagation();

        openDialog("YesNoDialog", {message:t("dialog.doYouRelayWantToDeleteThisPlan"), yesAction:() => {
                const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
                const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")

                const auth = getAuth(lsWalletApp)
                remove(ref(getDatabase(lsWorkingTimesApp), "/users/" + auth.currentUser.uid + "/plannings/"+data.id))
            }})
    }

    const editPlan = (e) => {
        e.stopPropagation()
        openDialog("EditPlanningDialog", {plan: data})
    }

    const expand = () => {
        setExpanded(!expanded)
    }

    return (
        <div className={getThemeClass("planningCardBg")} onClick={expand}>
            <div className={expanded ? "planningCardTitleExpanded" : ""}>
                <div><b>{getDateNameByString(data.date)} {t("timer.the")} {data.date}</b></div>
            </div>
            <div className={expanded ? "" : "gone"}>
                <div className={getThemeClass("planningCardDividerTop")}></div>

                <div className="planningCardContent">
                    <div>{data.content}</div>
                </div>

                <div className={getThemeClass("planningCardDividerBottom")}></div>
                <div className="planningCardActionBar">
                    <button className={getThemeClass("planningCardActionButton")} onClick={deletePlan}>{t("timer.delete")}</button>
                    <button className={getThemeClass("planningCardActionButton")} onClick={editPlan}>{t("timer.edit")}</button>
                </div>
            </div>
        </div>
    );
};

export default PlanningCard;