import {useDialog} from "use-react-dialog";
import "./ResetDialog.scss"
import ButtonCard from "../cards/Button/ButtonCard";
import React from "react";
import {getDatabase, ref, remove} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";

const DialogOne = () => {
    const { closeCurrentDialog, isOpen, openCurrentDialog } = useDialog('ResetDialog');

    const deleteAllSaves = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        remove(ref(db, "/users/"+auth.currentUser.uid+"/saved"))

        closeCurrentDialog()
    }

    return (
        <div id="popup1" className="overlay">
            <div className="popup">
                <div className="title"><b>Deleting all saves</b></div>
                <div className="content">
                    <div>Do you really want to delete all saves?</div>
                    <div className="horizontalButtons">
                        <ButtonCard className="darkerButtonCard" title="No" action={closeCurrentDialog}/>
                        <ButtonCard className="darkerButtonCard" title="Yes" action={deleteAllSaves}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DialogOne