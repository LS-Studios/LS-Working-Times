import React, {useState} from 'react';
import "./LoinForm.css"
import {useNavigate} from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import InputCard from "../../cards/Input/InputCard";
import ButtonCard from "../../cards/Button/ButtonCard";
import {t} from "../../helper/LanguageTransaltion/Transalation";
import {get, getDatabase, ref, set} from "firebase/database";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {validateEmail, validatePassword} from "../../helper/Helper";

function LoginForm()
{
    const [error, setError] = useState("")
    const [emailInput, setEmailInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const navigate = useNavigate()

    const createFieldIfNotExist = (fieldName, defaultValue, navigateTo, uid, db) => {
        get(ref(db, "/users/"+uid+"/"+fieldName)).then((snapshot) => {
            if (!snapshot.exists()) {
                set(ref(db, "/users/"+uid+"/"+fieldName), defaultValue).then((snapshot) => {
                    if (navigateTo != null)
                        navigate(navigateTo)
                })
            } else {
                if (navigateTo != null)
                    navigate(navigateTo)
            }
        }).catch((error) => {
            console.error(error);
            if (navigateTo != null)
                navigate(navigateTo)
        });
    }

    const submitLogin = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        setError("")

        if (emailInput == "") {
            setError(t("noEmailEntered"))
            return
        }

        if (passwordInput == "") {
            setError(t("noPasswordEntered"))
            return
        }

        signInWithEmailAndPassword(auth, emailInput, passwordInput)
            .then((userCredential) => {
                createFieldIfNotExist("language", "en", null, userCredential.user.uid, db)
                createFieldIfNotExist("email", emailInput, null, userCredential.user.uid, db)
                createFieldIfNotExist("password", passwordInput, null, userCredential.user.uid, db)
                createFieldIfNotExist("theme", "dark", "/timing", userCredential.user.uid, db)
            })
            .catch((error) => {
                const errorMessage = error.message;

                setError(errorMessage)

                if (errorMessage == "Firebase: Error (auth/wrong-passwordInput)." || errorMessage == "Firebase: Error (auth/wrong-password).") {
                    setError(t("login.wrongPassword"))
                }

                if (errorMessage == "Firebase: Error (auth/invalid-email).") {
                    setError(t("login.wrongEmail"))
                }

                if (errorMessage == "Firebase: Error (auth/user-not-found).") {
                    setError(t("login.noAccountWithThisEmail"))
                }
            })
    }

    const submitCreateUser = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        setError("")

        if (emailInput == "") {
            setError(t("noEmailEntered"))
            return
        }

        if (passwordInput == "") {
            setError(t("noPasswordEntered"))
            return
        }

        if (!validateEmail(emailInput)) {
            setError(t("invalidEmail"))
            return
        }

        const passwordValidity = validatePassword(passwordInput)

        if (passwordValidity != "") {
            setError(passwordValidity)
            return;
        }

        createUserWithEmailAndPassword(auth, emailInput, passwordInput)
            .then((userCredential) => {
                createFieldIfNotExist("language", "en", null, userCredential.user.uid, db)
                createFieldIfNotExist("email", emailInput, null, userCredential.user.uid, db)
                createFieldIfNotExist("password", passwordInput, null, userCredential.user.uid, db)
                createFieldIfNotExist("theme", "dark", "/timing", userCredential.user.uid, db)
            })
            .catch((error) => {
                const errorMessage = error.message;

                setError(errorMessage)

                if (errorMessage == "Firebase: Error (auth/email-already-in-use).") {
                    setError(t("accountWithThisEmailAlreadyExist"))
                }
            });
    }

    return (
        <div className="login-form">
            <InputCard type="text" title={t("login.email")} submitFunc={submitLogin} currentState={emailInput} setCurrentState={setEmailInput} placeholder="max123@mustermann.de"/>
            <InputCard type="password" title={t("login.password")} submitFunc={submitLogin} currentState={passwordInput} setCurrentState={setPasswordInput} placeholder="abcdefg"/>
            <div>{ error != "" ? <div className="loginErrorText">{error}</div> : null }</div>
            <div>
                <ButtonCard title={t("login.login")} action={submitLogin}/>
                <ButtonCard title={t("login.createAccount")} action={submitCreateUser}/>
            </div>
        </div>
    )
}

export default LoginForm;