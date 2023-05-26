import React, {createContext} from 'react';
import de from "../translations/de.json"
import en from "../translations/en.json"
import DarkTheme from "../themes/DarkTheme.json"
import BrightTheme from "../themes/BrightTheme.json"
import {
    OptionDialog,
    ItemDialog,
    ChangeCredentialsDialog
} from "@LS-Studios/components";

import {
    ContextDialogProvider,
    ContextThemeProvider,
    ContextTranslationProvider,
    ContextUserAuthProvider,
    ContextGlobalVariablesProvider
} from "@LS-Studios/components";
import ChangeTimeDialog from "../dialogs/time/ChangeTimeDialog";
import EditSaveTimeDialog from "../dialogs/save/EditSaveTimeDialog";
import EditPlanningDialog from "../dialogs/planning/EditPlanningDialog";
import PrognosisDialog from "../dialogs/prognosis/PrognosisDialog";
import CreateEditTimerDialog from "../dialogs/edittimer/CreateEditTimerDialog";
import ChangeTimerDialog from "../dialogs/changetimer/ChangeTimerDialog";

export const workTimerContext = createContext(null)
export const breakTimerContext = createContext(null)

function Providers({children}) {
    return (
        <div>
            <ContextThemeProvider themeFiles={{
                dark: DarkTheme,
                bright: BrightTheme
            }}>
                <ContextUserAuthProvider>
                    <ContextTranslationProvider translationFiles={{de, en}}>
                        <ContextGlobalVariablesProvider>
                            <ContextDialogProvider dialogs={{
                                "ChangeCredentialsDialog":ChangeCredentialsDialog,
                                "OptionDialog":OptionDialog,
                                "ItemDialog":ItemDialog,
                                "ChangeTimeDialog":ChangeTimeDialog,
                                "EditSaveTimeDialog":EditSaveTimeDialog,
                                "EditPlanningDialog":EditPlanningDialog,
                                "PrognosisDialog":PrognosisDialog,
                                "CreateEditTimerDialog":CreateEditTimerDialog,
                                "ChangeTimerDialog":ChangeTimerDialog
                            }}>
                                    { children }
                            </ContextDialogProvider>
                        </ContextGlobalVariablesProvider>
                    </ContextTranslationProvider>
                </ContextUserAuthProvider>
            </ContextThemeProvider>
        </div>
    );
}

export default Providers;