import './App.scss';
import React, {useEffect} from "react";
import {BrowserRouter as Router} from "react-router-dom"
import Providers from "./providers/Providers";
import Screens from "./screens/Screens";
import {get, ref} from "firebase/database";
import {getFirebaseDB} from "./firebase/FirebaseHelper";
import {getUserFirebaseAuth, getUserFirebaseDB} from "@LS-Studios/use-user-auth";

function App() {
    useEffect(() => {
        console.log("1")

        get(ref(getFirebaseDB(), "/")).then(_ => {
            console.log("2")
        }).catch((e) => {
            alert(e)
        })
    }, [])
    return (
        <div></div>
        // <Providers>
        //     <Router className="holder">
        //         <Screens />
        //     </Router>
        // </Providers>
    );
}

export default App
