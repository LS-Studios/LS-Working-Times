import React, {useEffect} from 'react';
import LoginForm from "./form/LoginForm";
import "./Login.css"

function Login({setCurrentMenu}) {
    useEffect(() => {
        setCurrentMenu(0)
    }, [])

    return (
        <div className="login">
            <LoginForm/>
        </div>
    );
}

export default Login;