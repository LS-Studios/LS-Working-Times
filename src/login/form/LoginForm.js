import React, {useState} from 'react';
import "./LoinForm.css"
import {useNavigate} from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import InputCard from "../../cards/Input/InputCard";
import ButtonCard from "../../cards/Button/ButtonCard";

function LoginForm()
{
    const [error, setError] = useState("")
    const [emailInput, setEmailInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const navigate = useNavigate()

    const submitLogin = () => {
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

    const submitCreateUser = () => {
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
                navigate("timing")
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
            <InputCard type="email" title="Email" submitFunc={submitLogin} currentState={emailInput} setCurrentState={setEmailInput} placeholder="max123@mustermann.de"/>
            <InputCard type="password" title="Password" submitFunc={submitLogin} currentState={passwordInput} setCurrentState={setPasswordInput} placeholder="abcdefg"/>
            <div>{ error != "" ? <div className="loginErrorText">{error}</div> : null }</div>
            <div>
                <ButtonCard title="Login" action={submitLogin}/>
                <ButtonCard title="Create account" action={submitCreateUser}/>
            </div>
        </div>
    )
}

export default LoginForm;