import React, {useState} from 'react';
import "./LoinForm.css"
import {useNavigate} from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {get, getDatabase, ref, set} from "firebase/database";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {useTranslation} from "@LS-Studios/use-translation";
import {validateEmail, validatePassword} from "@LS-Studios/use-user-auth";
import {ButtonCard, InputCard, useComponentUserAuth} from "@LS-Studios/components";

function LoginForm() {
    const navigate = useNavigate()
    const translation = useTranslation()
    const auth = useComponentUserAuth()

    const [error, setError] = useState("")
    const [emailInput, setEmailInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")

    const createFieldIfNotExist = (fieldName, defaultValue, navigateTo, user, db) => {
        get(ref(db, "/users/"+user.uid+"/"+fieldName)).then((snapshot) => {
            if (!snapshot.exists()) {
                set(ref(db, "/users/"+user.uid+"/"+fieldName), defaultValue).then((snapshot) => {
                    if (navigateTo != null) {
                        auth.login(user)
                        navigate(navigateTo)
                    }
                })
            } else {
                if (navigateTo != null) {
                    auth.login(user)
                    navigate(navigateTo)
                }
            }
        }).catch((error) => {
            setError(error)
        });
    }

    const submitLogin = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        setError("")

        if (emailInput == "") {
            setError(translation.translate("noEmailEntered"))
            return
        }

        if (passwordInput == "") {
            setError(translation.translate("noPasswordEntered"))
            return
        }

        signInWithEmailAndPassword(auth, emailInput, passwordInput)
            .then((userCredential) => {
                createFieldIfNotExist("language", "en", null, userCredential.user, db)
                createFieldIfNotExist("email", emailInput, null, userCredential.user, db)
                createFieldIfNotExist("password", passwordInput, null, userCredential.user, db)
                createFieldIfNotExist("theme", "dark", "/timing", userCredential.user, db)
            })
            .catch((error) => {
                const errorMessage = error.message;

                setError(errorMessage)

                if (errorMessage == "Firebase: Error (auth/wrong-passwordInput)." || errorMessage == "Firebase: Error (auth/wrong-password).") {
                    setError(translation.translate("login.wrongPassword"))
                }

                if (errorMessage == "Firebase: Error (auth/invalid-email).") {
                    setError(translation.translate("login.wrongEmail"))
                }

                if (errorMessage == "Firebase: Error (auth/user-not-found).") {
                    setError(translation.translate("login.noAccountWithThisEmail"))
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
            setError(translation.translate("noEmailEntered"))
            return
        }

        if (passwordInput == "") {
            setError(translation.translate("noPasswordEntered"))
            return
        }

        if (!validateEmail(emailInput)) {
            setError(translation.translate("invalidEmail"))
            return
        }

        const passwordValidity = validatePassword(passwordInput)

        if (passwordValidity != "") {
            setError(passwordValidity)
            return;
        }

        createUserWithEmailAndPassword(auth, emailInput, passwordInput)
            .then((userCredential) => {
                createFieldIfNotExist("language", "en", null, userCredential.user, db)
                createFieldIfNotExist("email", emailInput, null, userCredential.user, db)
                createFieldIfNotExist("password", passwordInput, null, userCredential.user, db)
                createFieldIfNotExist("theme", "dark", "/timing", userCredential.user, db)
            })
            .catch((error) => {
                const errorMessage = error.message;

                setError(errorMessage)

                if (errorMessage == "Firebase: Error (auth/email-already-in-use).") {
                    setError(translation.translate("accountWithThisEmailAlreadyExist"))
                }
            });
    }

    return (
        <div className="login-form">
            <InputCard type="text" title={translation.translate("login.email")} submitAction={submitLogin} currentState={emailInput} setCurrentState={setEmailInput} placeholder="max123@mustermann.de"/>
            <InputCard type="password" title={translation.translate("login.password")} submitAction={submitLogin} currentState={passwordInput} setCurrentState={setPasswordInput} placeholder="abcdefg"/>
            <div>{ error != "" ? <div className="loginErrorText">{error}</div> : null }</div>
            <div>
                <ButtonCard title={translation.translate("login.login")} clickAction={submitLogin}/>
                <ButtonCard title={translation.translate("login.createAccount")} clickAction={submitCreateUser}/>
            </div>
        </div>
    )
}

export default LoginForm;