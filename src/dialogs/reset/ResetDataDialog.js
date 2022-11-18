import {useDialog} from "use-react-dialog";
import "./ResetDataDialog.css"
import ButtonCard from "../../cards/Button/ButtonCard";
import React from "react";
import {getDatabase, ref, remove} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import Dialog from "../Dialog";

const ResetDataDialog = () => {
    const { closeCurrentDialog, isOpen, openCurrentDialog } = useDialog('ResetDataDialog');

    const deleteAllSaves = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        remove(ref(db, "/users/"+auth.currentUser.uid+"/saved"))

        closeCurrentDialog()
    }

    return (
        <Dialog title="Deleting all saves" dialogContent={
            <div>
                <div>Do you really want to delete all saves?</div>
                <div className="horizontalButtons">
                    <ButtonCard className="horizontalButtonCard" title="No" action={closeCurrentDialog}/>
                    <ButtonCard className="horizontalButtonCard" title="Yes" action={deleteAllSaves}/>
                </div>
            </div>
        } />
    );
}

export default ResetDataDialog