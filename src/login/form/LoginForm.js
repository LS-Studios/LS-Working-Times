import React, {useState} from 'react';
import "./LoinForm.css"
import {useNavigate} from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {initializeApp} from "firebase/app";
import firebaseConfig from "../../firebase/config";


function LoginForm()
{
    const [error, setError] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const submitLogin = (e) => {
        e.preventDefault()
        const app = initializeApp(firebaseConfig)
        const auth = getAuth()

        if (email == "") {
            setError("No email entered!")
            return
        }

        if (password == "") {
            setError("No password entered!")
            return
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                navigate("timing")
            })
            .catch((error) => {
                const errorMessage = error.message;

                setError(errorMessage)

                if (errorMessage == "Firebase: Error (auth/wrong-password).") {
                    setError("Password is wrong!")
                }

                if (errorMessage == "Firebase: Error (auth/user-not-found).") {
                    setError("Email or password is wrong!")
                }
            });
    }

    const submitCreateUser = (e) => {
        e.preventDefault()
        const auth = getAuth()

        if (email == "") {
            setError("No email entered!")
            return
        }

        if (password.length < 6)
            setError("Password need to be at least 6 sings long!")
        if (!password.contains("[A-Z]"))
            setError("Password need to contain a uppercase letter!")
        if (!password.contains("[a-z]"))
            setError("Password need to contain a lowercase letter!")
        if (!password.contains("[0-9]"))
            setError("Password need to contain a number character!")
        if (!password.contains("[#?!@\$%^&*-.,]"))
            setError("Password need to contain a special character!")

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                navigate("timing")
            })
            .catch((error) => {
                const errorMessage = error.message;

                setError(errorMessage)
            });
    }

    return (
            <div className="login-form">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}/>
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                { error != "" ? <div className="loginErrorText">{error}</div> : null }
                <button className="loginLoginButton" onClick={submitLogin}>Login</button>
                <button className="loginCreatButton" onClick={submitCreateUser}>Create account</button>
            </div>
    )
}

export default LoginForm;