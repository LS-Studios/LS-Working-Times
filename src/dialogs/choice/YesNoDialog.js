import "./YesNoDialog.css"
import React from "react";
import {useTranslation} from "@LS-Studios/use-translation";
import {ButtonCard, Dialog, useComponentDialog} from "@LS-Studios/components";

const YesNoDialog = ({data}) => {
    const translation = useTranslation()
    const dialog = useComponentDialog();

    const close = () => {
        dialog.closeDialog("YesNoDialog")
    }

    const action = () => {
        data.yesAction()

        close()
    }

    return (
        <Dialog title={data.title} name="YesNoDialog">
            <div>{data.message}</div>
            <div className="yesNoDialogButtons">
                <ButtonCard title={translation.translate("dialog.no")} clickAction={close}/>
                <ButtonCard title={translation.translate("dialog.yes")} clickAction={action}/>
            </div>
        </Dialog>
    );
}

export default YesNoDialog