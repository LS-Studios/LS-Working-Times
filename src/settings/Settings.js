import React, {Component, useEffect, useState} from 'react';
import ToggleCard from "../cards/ToggleInput/ToggleCard";
import ButtonCard from "../cards/Button/ButtonCard";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {deleteUser, getAuth, signOut} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import {useDialog} from "use-react-dialog";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import {getDatabase, ref, remove} from "firebase/database";
import {setLanguage, t} from "react-switch-lang";

const Settings = ({ setCurrentMenu, setLanguage }) => {
    const [currentLanguage, setCurrentLanguage] = useState(1)
    const [currentTheme, setCurrentTheme] = useState(1)

    const { dialogs, openDialog } = useDialog();

    const navigate = useNavigate()

    useEffect(() => {
        setCurrentMenu(2)

        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(lsWalletApp)

        auth.onAuthStateChanged(function(user) {
            if (user == null) {
                navigate("/login")
            }
        });
    }, [])

    useEffect(() => {
        switch (currentLanguage) {
            case 0:
                setLanguage("de")
                break
            case 1:
                setLanguage("en")
                break
        }
    }, [currentLanguage])

    const logout = () => {
        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(lsWalletApp)

        signOut(auth)
    }

    const editAccount = () => {

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