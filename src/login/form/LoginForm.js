import React, {useState} from 'react';
import "./LoinForm.css"
import {useNavigate} from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getDatabase, ref, set} from "firebase/database";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import InputCard from "../../cards/Input/InputCard";
import ButtonCard from "../../cards/Button/ButtonCard";

function LoginForm()
{
    const [error, setError] = useState("")
    const [emailInput, setEmailInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const navigate = useNavigate()

    const submitLogin = (e) => {
        e.preventDefault()
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
                navigate("timing")
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

    const submitCreateUser = (e) => {
        e.preventDefault()
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        setError("")

        if (emailInput == "") {
            setError("No emailInput entered!")
            return
        }

        if (passwordInput.length < 6)
            setError("Password need to be at least 6 sings long!")
        if (!passwordInput.includes("[A-Z]"))
            setError("Password need to contain a uppercase letter!")
        if (!passwordInput.includes("[a-z]"))
            setError("Password need to contain a lowercase letter!")
        if (!passwordInput.includes("[0-9]"))
            setError("Password need to contain a number character!")
        if (!passwordInput.includes("[#?!@\$%^&*-.,]"))
            setError("Password need to contain a special character!")

        createUserWithEmailAndPassword(auth, emailInput, passwordInput)
            .then((userCredential) => {
                navigate("timing")
            })
            .catch((error) => {
                const errorMessage = error.message;
                setError(errorMessage)
            });
    }

    return (
            <div className="login-form">
                <InputCard type="email" title="Email" currentState={emailInput} setCurrentState={setEmailInput} placeholder="max123@mustermann.de"/>
                <InputCard type="password" title="Password" currentState={passwordInput} setCurrentState={setPasswordInput} placeholder="abcdefg"/>
                { error != "" ? <div className="loginErrorText">{error}</div> : null }
                <div>
                    <ButtonCard title="Login" action={submitLogin}/>
                    <ButtonCard title="Create account" action={submitCreateUser}/>
                </div>
            </div>
    )
}

export default LoginForm;