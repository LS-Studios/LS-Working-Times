import './App.scss';
import Login from "./login/Login";
import {
    BrowserRouter as Router, Navigate,
    Route,
    Routes, useNavigate
} from "react-router-dom";
import Timing from "./timing/Timing";
import React, {useEffect, useState} from "react";
import Settings from "./settings/Settings";
import Prognosis from "./prognosis/Prognosis";
import Planning from "./planning/Planning";
import Providers from "./providers/Providers";
import OuterBody from "@LS-Studios/components/outerbody/OuterBody"
import {useTranslation} from "@LS-Studios/use-translation";
import {useComponentUserAuth} from "@LS-Studios/components/contextproviders/ComponentUserAuthProvider";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "./firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";

function App() {
    const translation = useTranslation()
    const auth = useComponentUserAuth()
    const navigate = useNavigate()

    const [currentMenu, setCurrentMenu] = useState(0)

    useEffect(() => {
        document.body.classList.add("darkBody")
    }, [])

    const getUserEmail = () => {
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        if (auth.currentUser != null)
            return auth.currentUser.email
        else
            return ""
    }

    return (
        <Providers>
            <OuterBody menuList={[
                {name:translation.translate(auth.user ? getUserEmail() : "login.menuName")},
                {name:translation.translate("timer.menuName"), link:"/timer"},
                {name:translation.translate("planning.menuName"), link:"/planning"},
                {name:translation.translate("prognosis.menuName"), link:"/prognosis"},
                {name:translation.translate("settings.menuName"), link:"/settings"}
            ]} isAvailable={(i) => {
                if (auth.user == null) {
                    if (i === 0) return true
                    else return false
                } else {
                    return true
                }
            }} changeLink={link => navigate(link)} currentMenu={currentMenu} setCurrentMenu={setCurrentMenu}>
                <Router className="holder">
                    <Routes>
                        <Route path="/login" element={<Login setCurrentMenu={setCurrentMenu}/>}/>
                        <Route
                            path="/timing"
                            element={<Timing setCurrentMenu={setCurrentMenu}/>}
                        />
                        <Route
                            path="/planning"
                            element={<Planning setCurrentMenu={setCurrentMenu}/>}
                        />
                        <Route
                            path="/prognosis"
                            element={<Prognosis setCurrentMenu={setCurrentMenu}/>}
                        />
                        <Route
                            path="/settings"
                            element={<Settings setCurrentMenu={setCurrentMenu}/>}
                        />
                        <Route
                            path="*"
                            element={<Navigate replace to="/timing" />}
                        />
                    </Routes>
                </Router>
            </OuterBody>
        </Providers>
    );
}

export default App
