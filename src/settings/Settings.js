import React, {Component, useEffect, useState} from 'react';
import ToggleCard from "../cards/ToggleInput/ToggleCard";
import ButtonCard from "../cards/Button/ButtonCard";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {getAuth, signOut} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import {useDialog} from "use-react-dialog";

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
        openDialog("ResetDataDialog")
    }

    const deleteAccount = () => {
        openDialog("DeleteAccountDialog")
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