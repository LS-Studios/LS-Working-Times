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

const Settings = ({ setCurrentMenu }) => {
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

    const logout = () => {
        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(lsWalletApp)

        signOut(auth)
    }

    const editAccount = () => {

    }

    const resetData = () => {
        openDialog("YesNoDialog", {message:"Do you really want to delete all data?", yesAction:() => {
            const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
            const db = getDatabase(lsWorkingTimesApp)
            const app = initializeApp(LSWalletConfig, "LS-Wallet")
            const auth = getAuth(app)

            remove(ref(db, "/users/"+auth.currentUser.uid+"/saved"))
        }})
    }

    const deleteAccount = () => {
        openDialog("YesNoDialog", {message:"Do you really want to delete this account?", yesAction:() => {
            const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
            const db = getDatabase(lsWorkingTimesApp)
            const app = initializeApp(LSWalletConfig, "LS-Wallet")
            const auth = getAuth(app)

            remove(ref(db, "/users/"+auth.currentUser.uid)).then(_ => deleteUser(auth.currentUser))
        }})
    }

    return (
        <div>
            <ToggleCard title="Language" toggleList={["German", "English"]} currentState={currentLanguage} setCurrentState={setCurrentLanguage}/>
            <ToggleCard title="Color theme" toggleList={["Bright", "Dark"]} currentState={currentTheme} setCurrentState={setCurrentTheme}/>
            <ButtonCard title="Logout" action={logout}/>
            <ButtonCard title="Edit account" action={editAccount}/>
            <ButtonCard title="Reset data" action={resetData}/>
            <ButtonCard title="Delete account" action={deleteAccount}/>
        </div>
    );
}

export default Settings;