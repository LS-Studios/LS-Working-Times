import {useDialog} from "use-react-dialog";
import "./YesNoDialog.css"
import ButtonCard from "../../cards/Button/ButtonCard";
import React, {useEffect} from "react";
import Dialog from "../Dialog";
import {t} from "../../helper/LanguageTransaltion/Transalation";
import {getThemeClass} from "../../helper/Theme/Theme";

const YesNoDialog = () => {
    const { closeCurrentDialog, isOpen, openCurrentDialog, data } = useDialog('YesNoDialog', {title: "None", message:"None", yesAction:()=>{}});

    const close = () => {
        document.body.style.overflow = "visible"
        closeCurrentDialog()
    }

    const action = () => {
        data.yesAction()

        close()
    }

    return (
        <Dialog title={data.title} dialogContent={
            <div>
                <div>{data.message}</div>
                <div className="yesNoDialogButtons">
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.no")} action={close}/>
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.yes")} action={action}/>
                </div>
            </div>
        } />
    );
}

export default YesNoDialog