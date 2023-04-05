import React, {useEffect, useState} from 'react';
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {deleteUser, getAuth, signOut} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import {get, getDatabase, ref, remove, set} from "firebase/database";
import {
    ButtonCard,
    ToggleCard,
    useComponentDialog,
    useComponentTheme,
    useComponentUserAuth
} from "@LS-Studios/components";
import {useTranslation} from "@LS-Studios/use-translation";

const Settings = ({ setCurrentMenu }) => {
    const [currentLanguage, setCurrentLanguage] = useState(-1)
    const [currentTheme, setCurrentTheme] = useState(-1)

    const dialog = useComponentDialog();
    const translation = useTranslation();
    const theme = useComponentTheme();
    const auth = useComponentUserAuth()

    const navigate = useNavigate()

    useEffect(() => {
        setCurrentMenu(4)

        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(lsWalletApp)
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)

        const unsubscribe = auth.onAuthStateChanged(function(user) {
            if (user == null) {
                navigate("/login")
            }

            //Language
            get(ref(db, "/users/"+user.uid+"/language")).then((snapshot) => {
                if (snapshot.exists()) {
                    switch (snapshot.val()) {
                        case "de":
                            setCurrentLanguage(0)
                            break
                        case "en":
                            setCurrentLanguage(1)
                            break
                    }
                } else {
                    console.log("No data available");
                }
            }).catch((error) => {
                console.error(error);
            });

            //Theme
            get(ref(db, "/users/"+user.uid+"/theme")).then((snapshot) => {
                if (snapshot.exists()) {
                    switch (snapshot.val()) {
                        case "bright":
                            setCurrentTheme(0)
                            break
                        case "dark":
                            setCurrentTheme(1)
                            break
                    }
                } else {
                    console.log("No data available");
                }
            }).catch((error) => {
                console.error(error);
            });
        });

        return () => {
            unsubscribe()
        }
    }, [])

    useEffect(() => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        if (auth.currentUser != null) {
            switch (currentLanguage) {
                case 0:
                    translation.changeLanguage("de")
                    set(ref(db, "/users/" + auth.currentUser.uid + "/language"), "de")
                    break
                case 1:
                    translation.changeLanguage("en")
                    set(ref(db, "/users/" + auth.currentUser.uid + "/language"), "en")
                    break
            }
        }
    }, [currentLanguage])

    useEffect(() => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        if (auth.currentUser != null) {
            switch (currentTheme) {
                case 0:
                    theme.changeTheme("bright")
                    set(ref(db, "/users/" + auth.currentUser.uid + "/theme"), "bright")
                    break
                case 1:
                    theme.changeTheme("dark")
                    set(ref(db, "/users/" + auth.currentUser.uid + "/theme"), "dark")
                    break
            }
        }
    }, [currentTheme])

    const logout = () => {
        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const dbAuth = getAuth(lsWalletApp)

        auth.logout()
        signOut(dbAuth)
    }

    const editAccount = () => {
        dialog.openDialog("ChangeCredentialsDialog")
    }

    const resetData = () => {
        dialog.openDialog("YesNoDialog", {message:translation.translate("dialog.doYouReallyWantToDeleteAllData"), yesAction:() => {
            const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
            const db = getDatabase(lsWorkingTimesApp)

            remove(ref(db, "/users/"+auth.currentUser.uid+"/saved"))
        }})
    }

    const deleteAccount = () => {
        dialog.openDialog("YesNoDialog", {message:translation.translate("dialog.doYouReallyWantToDeleteThisAccount"), yesAction:() => {
            const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
            const db = getDatabase(lsWorkingTimesApp)
            const app = initializeApp(LSWalletConfig, "LS-Wallet")
            const auth = getAuth(app)

            remove(ref(db, "/users/"+auth.currentUser.uid)).then(_ => deleteUser(auth.currentUser))
        }})
    }

    return (
        <div>
            <ToggleCard title={translation.translate("settings.language")} toggleList={[translation.translate("settings.german"), translation.translate("settings.english")]} currentState={currentLanguage} setCurrentState={setCurrentLanguage}/>
            <ToggleCard title={translation.translate("settings.colorTheme")} toggleList={[translation.translate("settings.bright"), translation.translate("settings.dark")]} currentState={currentTheme} setCurrentState={setCurrentTheme}/>
            <ButtonCard title={translation.translate("settings.logout")} clickAction={logout}/>
            <ButtonCard title={translation.translate("settings.editAccount")} clickAction={editAccount}/>
            <ButtonCard title={translation.translate("settings.resetSaves")} clickAction={resetData}/>
            <ButtonCard title={translation.translate("settings.deleteAccount")} clickAction={deleteAccount}/>
        </div>
    );
}

export default Settings;