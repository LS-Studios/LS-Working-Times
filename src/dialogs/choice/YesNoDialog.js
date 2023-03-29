import "./YesNoDialog.css"
import React from "react";
import {useComponentDialog} from "@LS-Studios/components/contextproviders/ComponentDialogProvider"
import {useTranslation} from "@LS-Studios/use-translation";
import {ButtonCard, Dialog} from "@LS-Studios/components";

const YesNoDialog = ({data}) => {
    const translation = useTranslation()
    const dialog = useComponentDialog();

    const close = () => {
        document.body.style.overflow = "visible"
        dialog.closeDialog("YesNoDialog")
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
                    <ButtonCard title={translation.translate("dialog.no")} action={close}/>
                    <ButtonCard title={translation.translate("dialog.yes")} action={action}/>
                </div>
            </div>
        } />
    );
}

export default YesNoDialog