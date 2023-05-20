import React from 'react';
import {ref, remove} from "firebase/database";
import {ButtonCard, useContextDialog, useContextTranslation, useContextUserAuth} from "@LS-Studios/components";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";

function AdditionalSettings() {
    const dialog = useContextDialog()
    const auth = useContextUserAuth()
    const translation = useContextTranslation()

    const resetData = () => {
        dialog.openDialog("YesNoDialog", {message:translation.translate("dialog.doYouReallyWantToDeleteAllData"), yesAction:() => {
                remove(ref(getFirebaseDB(), "/users/"+auth.user.id+"/saved"))
            }})
    }

    return (
        <div>
            <ButtonCard title={translation.translate("settings.resetSaves")} clickAction={resetData}/>
        </div>
    );
}

export default AdditionalSettings;