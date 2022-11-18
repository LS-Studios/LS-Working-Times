import {useDialog} from "use-react-dialog";
import "./DeleteAccountDialog.css"
import ButtonCard from "../../cards/Button/ButtonCard";
import React from "react";
import {getDatabase, ref, remove} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth, deleteUser} from "firebase/auth";
import Dialog from "../Dialog";

const DeleteAccountDialog = () => {
    const { closeCurrentDialog, isOpen, openCurrentDialog } = useDialog('DeleteAccountDialog');

    const deleteAccount = () => {
        console.log("dds")
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        remove(ref(db, "/users/"+auth.currentUser.uid)).then(_ => deleteUser(auth.currentUser))

        closeCurrentDialog()
    }

    return (
        <Dialog title="Deleting account" dialogContent={
            <div>
                <div>Do you really want to delete this account?</div>
                <div className="horizontalButtons">
                    <ButtonCard className="horizontalButtonCard" title="No" action={closeCurrentDialog}/>
                    <ButtonCard className="horizontalButtonCard" title="Yes" action={deleteAccount}/>
                </div>
            </div>
        } />
    );
}

export default DeleteAccountDialog