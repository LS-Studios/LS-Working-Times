import React, {Component, useEffect, useState} from 'react';
import ToggleCard from "../cards/ToggleInput/ToggleCard";
import ButtonCard from "../cards/Button/ButtonCard";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {deleteUser, getAuth, signOut} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import {useDialog} from "use-react-dialog";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import {get, getDatabase, ref, remove, set} from "firebase/database";
import {t} from "../helper/LanguageTransaltion/Transalation";
import {setLanguage} from "../helper/LanguageTransaltion/Transalation";
import {getThemeClass, setTheme} from "../helper/Theme/Theme";

const Settings = ({ setCurrentMenu }) => {
    const [currentLanguage, setCurrentLanguage] = useState(-1)
    const [currentTheme, setCurrentTheme] = useState(-1)

    const { dialogs, openDialog } = useDialog();

    const navigate = useNavigate()

    useEffect(() => {
        setCurrentMenu(3)

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
                    setLanguage("de")
                    set(ref(db, "/users/" + auth.currentUser.uid + "/language"), "de")
                    break
                case 1:
                    setLanguage("en")
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
                    setTheme("bright")
                    document.body.classList.forEach((v, k, p) => {
                        document.body.classList.remove(v)
                    })
                    document.body.classList.add(getThemeClass("body"))
                    set(ref(db, "/users/" + auth.currentUser.uid + "/theme"), "bright")
                    break
                case 1:
                    setTheme("dark")
                    document.body.classList.forEach((v, k, p) => {
                        document.body.classList.remove(v)
                    })
                    document.body.classList.add(getThemeClass("body"))
                    set(ref(db, "/users/" + auth.currentUser.uid + "/theme"), "dark")
                    break
            }
        }
    }, [currentTheme])

    const logout = () => {
        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(lsWalletApp)

        signOut(auth)
    }

    const editAccount = () => {
        openDialog("ChangeCredentialsDialog")
    }

    const resetData = () => {
        openDialog("YesNoDialog", {message:t("dialog.doYouReallyWantToDeleteAllData"), yesAction:() => {
            const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
            const db = getDatabase(lsWorkingTimesApp)
            const app = initializeApp(LSWalletConfig, "LS-Wallet")
            const auth = getAuth(app)

            remove(ref(db, "/users/"+auth.currentUser.uid+"/saved"))
        }})
    }

    const deleteAccount = () => {
        openDialog("YesNoDialog", {message:t("dialog.doYouReallyWantToDeleteThisAccount"), yesAction:() => {
            const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
            const db = getDatabase(lsWorkingTimesApp)
            const app = initializeApp(LSWalletConfig, "LS-Wallet")
            const auth = getAuth(app)

            remove(ref(db, "/users/"+auth.currentUser.uid)).then(_ => deleteUser(auth.currentUser))
        }})
    }

    return (
        <div>
            <ToggleCard title={t("settings.language")} toggleList={[t("settings.german"), t("settings.english")]} currentState={currentLanguage} setCurrentState={setCurrentLanguage}/>
            <ToggleCard title={t("settings.colorTheme")} toggleList={[t("settings.bright"), t("settings.dark")]} currentState={currentTheme} setCurrentState={setCurrentTheme}/>
            <ButtonCard title={t("settings.logout")} action={logout}/>
            <ButtonCard title={t("settings.editAccount")} action={editAccount}/>
            <ButtonCard title={t("settings.resetSaves")} action={resetData}/>
            <ButtonCard title={t("settings.deleteAccount")} action={deleteAccount}/>
        </div>
    );
}

export default Settings;