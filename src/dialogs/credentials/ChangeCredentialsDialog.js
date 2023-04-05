import "./ChangeCredentialsDialog.css"
import React, {useEffect, useState} from "react";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth, signInWithEmailAndPassword, updateEmail, updatePassword, EmailAuthProvider} from "firebase/auth";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {getDatabase, get, ref, set} from "firebase/database";
import {useTranslation} from "@LS-Studios/use-translation";
import {ButtonCard, InputContent, Dialog, useComponentDialog, useComponentTheme} from "@LS-Studios/components";
import {validateEmail, validatePassword} from "@LS-Studios/use-user-auth";

const ChangeCredentialsDialog = ({data}) => {
    const translation = useTranslation()
    const dialog = useComponentDialog();

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
        dialog.closeDialog("ChangeCredentialsDialog")
    }

    const action = () => {
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)

        if (currentEmail == "") {
            setError(translation.translate("noEmailEntered"))
            return
        }

        if (currentPassword == "") {
            setError(translation.translate("noPasswordEntered"))
            return
        }

        if (!validateEmail(currentEmail)) {
            setError(translation.translate("invalidEmail"))
            return
        }

        const passwordValidity = validatePassword(currentPassword)

        if (passwordValidity != "") {
            setError(passwordValidity)
            return;
        }

        let password = prompt(translation.translate("passwordToContinueResetting"))

        signInWithEmailAndPassword(auth, auth.currentUser.email, password).then(res => {
            //Set db data
            set(ref(db, "/users/"+res.user.uid+"/email"), currentEmail)
            set(ref(db, "/users/"+res.user.uid+"/password"), currentPassword)

            //Set auth data
            updateEmail(res.user, currentEmail)
            updatePassword(res.user, currentPassword)

            close()
        }).catch(error => {
            setError(translation.translate("login.wrongPassword"))
        })
    }

    return (
        <Dialog title={translation.translate("dialog.changeCredentials")} name="ChangeCredentialsDialog">
            <InputContent title={translation.translate("login.email")} type="email" useDivider={false} currentState={currentEmail} setCurrentState={setCurrentEmail}/>
            <InputContent title={translation.translate("login.password")} type="password" useDivider={false} currentState={currentPassword} setCurrentState={setCurrentPassword}/>

            { error != "" ? <div className="loginErrorText">{error}</div> : null }

            <div className="yesNoDialogButtons">
                <ButtonCard title={translation.translate("dialog.cancel")} clickAction={close}/>
                <ButtonCard title={translation.translate("dialog.confirm")} clickAction={action}/>
            </div>
        </Dialog>
    );
}

export default ChangeCredentialsDialog