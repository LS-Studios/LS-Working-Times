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
            setError("No email entered!")
            return
        }

        if (passwordInput == "") {
            setError("No password entered!")
            return
        }

        signInWithEmailAndPassword(auth, emailInput, passwordInput)
            .then((userCredential) => {
                createFieldIfNotExist("language", "en", null, userCredential.user.uid, db)
                createFieldIfNotExist("theme", "dark", "/timing", userCredential.user.uid, db)
            })
            .catch((error) => {
                const errorMessage = error.message;

                setError(errorMessage)

                if (errorMessage == "Firebase: Error (auth/wrong-passwordInput)." || errorMessage == "Firebase: Error (auth/wrong-password).") {
                    setError("Password is wrong!")
                }

                if (errorMessage == "Firebase: Error (auth/invalid-email).") {
                    setError("Email is wrong!")
                }

                if (errorMessage == "Firebase: Error (auth/user-not-found).") {
                    setError("Account with this email do not exist!")
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
            setError("No emailInput entered!")
            return
        }

        if (passwordInput.length < 6) {
            setError("Password need to be at least 6 sings long!")
            return;
        }
        if (!/[A-Z]/.test(passwordInput)) {
            setError("Password need to contain a uppercase letter!")
            return;
        }
        if (!/[a-z]/.test(passwordInput)) {
            setError("Password need to contain a lowercase letter!")
            return;
        }
        if (!/[0-9]/.test(passwordInput)) {
            setError("Password need to contain a number character!")
            return;
        }
        if (!/[#?!@$%^&*-.,]/.test(passwordInput)) {
            setError("Password need to contain a special character!")
            return;
        }

        createUserWithEmailAndPassword(auth, emailInput, passwordInput)
            .then((userCredential) => {
                createFieldIfNotExist("language", "en", null, userCredential.user.uid, db)
                createFieldIfNotExist("theme", "dark", "/timing", userCredential.user.uid, db)
            })
            .catch((error) => {
                const errorMessage = error.message;

                setError(errorMessage)

                if (errorMessage == "Firebase: Error (auth/email-already-in-use).") {
                    setError("Account with this email already exist!")
                }
            });
    }

    return (
        <div className="login-form">
            <InputCard type="email" title={t("login.email")} submitFunc={submitLogin} currentState={emailInput} setCurrentState={setEmailInput} placeholder="max123@mustermann.de"/>
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