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

const PlanningCard = ({plan}) => {
    const { dialogs, openDialog } = useDialog();

    const [expanded, setExpanded] = useState(false)

    const deletePlan = (e) => {
        e.stopPropagation();

        openDialog("YesNoDialog", {message:t("dialog.doYouRelayWantToDeleteThisPlan"), yesAction:() => {
                const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
                const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")

                const auth = getAuth(lsWalletApp)
                remove(ref(getDatabase(lsWorkingTimesApp), "/users/" + auth.currentUser.uid + "/plannings/"+plan.id))
            }})
    }

    const editPlan = (e) => {
        e.stopPropagation()
        openDialog("EditPlanningDialog", {plan: plan})
    }

    return (
        <div className={getThemeClass("planningCard")} onClick={() => setExpanded(!expanded)}>
            <div className="planningContainer">
                <div><b>{t("timer.on") + " " + getDateNameByString(plan.date) + " " + t("timer.the2") + " " + plan.date}</b></div>
                {
                    expanded ? <div>
                        <div className={getThemeClass("divider")}/>
                        <div className="planningCardText">{plan.content}</div>
                    </div> : null
                }
            </div>

            {
                expanded ? <div>
                    <div className={getThemeClass("planningActionDivider")}/>
                    <div className="planningCardActionBar">
                        <button className={getThemeClass("planningCardActionButton")} onClick={deletePlan}>{t("timer.delete")}</button>
                        <button className={getThemeClass("planningCardActionButton")} onClick={editPlan}>{t("timer.edit")}</button>
                    </div>
                </div> : null
            }
        </div>
    );
};

export default PlanningCard;