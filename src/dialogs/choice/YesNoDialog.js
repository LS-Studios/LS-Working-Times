import {useDialog} from "use-react-dialog";
import "./YesNoDialog.css"
import ButtonCard from "../../cards/Button/ButtonCard";
import React from "react";
import Dialog from "../Dialog";

const YesNoDialog = () => {
    const { closeCurrentDialog, isOpen, openCurrentDialog, data } = useDialog('YesNoDialog', {message:"None", yesAction:()=>{}});

    const deleteAccount = () => {
        data.yesAction()

        closeCurrentDialog()
    }

    return (
        <Dialog title="Deleting account" dialogContent={
            <div>
                <div>{data.message}</div>
                <div className="horizontalButtons">
                    <ButtonCard className="horizontalButtonCard" title="No" action={closeCurrentDialog}/>
                    <ButtonCard className="horizontalButtonCard" title="Yes" action={deleteAccount}/>
                </div>
            </div>
        } />
    );
}

export default YesNoDialog