import {useDialog} from "use-react-dialog";
import "./ChangeCredentialsDialog.css"
import ButtonCard from "../../cards/Button/ButtonCard";
import React, {useEffect, useState} from "react";
import Dialog from "../Dialog";
import {setLanguage, t} from "../../helper/LanguageTransaltion/Transalation";
import {getThemeClass} from "../../helper/Theme/Theme";
import InputContent from "../../cards/Input/InputContent";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth, signInWithEmailAndPassword, reauthenticateWithCredential, updateEmail, updatePassword, EmailAuthProvider} from "firebase/auth";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {getDatabase, get, ref, set} from "firebase/database";
import {validateEmail, validatePassword} from "../../helper/Helper";

const ChangeCredentialsDialog = () => {
    const { closeCurrentDialog, isOpen, openCurrentDialog, data } = useDialog('ChangeCredentialsDialog');

    const [currentEmail, setCurrentEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")

    const [error, setError] = useState("")

    useEffect(() => {
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)

        get(ref(db, "/users/"+auth.currentUser.uid+"/email")).then((snapshot) => {
            if (snapshot.exists()) {
                setCurrentEmail(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });

        get(ref(db, "/users/"+auth.currentUser.uid+"/password")).then((snapshot) => {
            if (snapshot.exists()) {
                setCurrentPassword(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }, [])

    const close = () => {
        document.body.style.overflow = "visible"
        closeCurrentDialog()
    }

    const action = () => {
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)

        if (currentEmail == "") {
            setError(t("noEmailEntered"))
            return
        }

        if (currentPassword == "") {
            setError(t("noPasswordEntered"))
            return
        }

        if (!validateEmail(currentEmail)) {
            setError(t("invalidEmail"))
            return
        }

        const passwordValidity = validatePassword(currentPassword)

        if (passwordValidity != "") {
            setError(passwordValidity)
            return;
        }

        let password = prompt(t("passwordToContinueResetting"))

        signInWithEmailAndPassword(auth, auth.currentUser.email, password).then(res => {
            //Set db data
            set(ref(db, "/users/"+res.user.uid+"/email"), currentEmail)
            set(ref(db, "/users/"+res.user.uid+"/password"), currentPassword)

            //Set auth data
            updateEmail(res.user, currentEmail)
            updatePassword(res.user, currentPassword)

            close()
        }).catch(error => {
            setError(t("login.wrongPassword"))
        })
    }

    return (
        <Dialog title="" dialogContent={
            <div>
                <InputContent title={t("login.email")} type="email" useDivider={false} currentState={currentEmail} setCurrentState={setCurrentEmail}/>
                <InputContent title={t("login.password")} type="password" useDivider={false} currentState={currentPassword} setCurrentState={setCurrentPassword}/>
                { error != "" ? <div className="loginErrorText">{error}</div> : null }
                <div className="yesNoDialogButtons">
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.cancel")} action={close}/>
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.confirm")} action={action}/>
                </div>
            </div>
        } />
    );
}

export default ChangeCredentialsDialog