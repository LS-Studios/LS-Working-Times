import {useDialog} from "use-react-dialog";
import "./YesNoDialog.css"
import ButtonCard from "../../cards/Button/ButtonCard";
import React from "react";
import Dialog from "../Dialog";
import {t} from "react-switch-lang";

const YesNoDialog = () => {
    const { closeCurrentDialog, isOpen, openCurrentDialog, data } = useDialog('YesNoDialog', {title: "None", message:"None", yesAction:()=>{}});

    const action = () => {
        data.yesAction()

        closeCurrentDialog()
    }

    return (
        <Dialog title={data.title} dialogContent={
            <div>
                <div>{data.message}</div>
                <div className="yesNoDialogButtons">
                    <ButtonCard className="horizontalButtonCard" title={t("dialog.no")} action={closeCurrentDialog}/>
                    <ButtonCard className="horizontalButtonCard" title={t("dialog.yes")} action={action}/>
                </div>
            </div>
        } />
    );
}

export default YesNoDialog