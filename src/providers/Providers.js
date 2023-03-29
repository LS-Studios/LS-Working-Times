import React from 'react';
import {TranslationProvider} from "@LS-Studios/use-translation";
import {ComponentDialogProvider, ComponentUserAuthProvider, ComponentThemeProvider} from "@LS-Studios/components";
import de from "../translations/de.json"
import en from "../translations/en.json"
import YesNoDialog from "../dialogs/choice/YesNoDialog";
import ChangeTimeDialog from "../dialogs/time/ChangeTimeDialog";
import EditSaveTimeDialog from "../dialogs/edit/EditSaveTimeDialog";
import ChangeCredentialsDialog from "../dialogs/credentials/ChangeCredentialsDialog";
import EditPlanningDialog from "../dialogs/planning/EditPlanningDialog";
import PrognosisDialog from "../dialogs/prognosis/PrognosisDialog";

function Providers({children}) {
    return (
        <div>
            <TranslationProvider translationFiles={{de, en}}>
                <ComponentDialogProvider dialogs={{
                    "YesNoDialog":YesNoDialog,
                    "ChangeTimeDialog":ChangeTimeDialog,
                    "EditSaveTimeDialog":EditSaveTimeDialog,
                    "ChangeCredentialsDialog":ChangeCredentialsDialog,
                    "EditPlanningDialog":EditPlanningDialog,
                    "PrognosisDialog":PrognosisDialog
                }}>
                    <ComponentThemeProvider>
                        <ComponentUserAuthProvider>
                            { children }
                        </ComponentUserAuthProvider>
                    </ComponentThemeProvider>
                </ComponentDialogProvider>
            </TranslationProvider>
        </div>
    );
}

export default Providers;