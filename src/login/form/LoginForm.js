import React from 'react';
import "./LoinForm.css"
import {useNavigate} from "react-router-dom";

function LoginForm()
{
        const navigate = useNavigate()
        const submitLogin = () => {
                navigate("timer")
        }

        return (
                <form className="Login-Form" onSubmit={submitLogin}>
                        <label>Email</label>
                        <input/>
                        <label>Password</label>
                        <input type="password"/>
                        <button>Login</button>
                </form>
        )
}

export default LoginForm;