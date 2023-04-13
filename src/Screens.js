import React, {useEffect, useState} from 'react';
import {Navigate, Route, Routes, useNavigate} from "react-router-dom";
import Login from "./login/Login";
import Timing from "./timing/Timing";
import Planning from "./planning/Planning";
import Prognosis from "./prognosis/Prognosis";
import Settings from "./settings/Settings";
import {OuterBody, useComponentTheme, useComponentUserAuth} from "@LS-Studios/components";
import {useTranslation} from "@LS-Studios/use-translation";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "./firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import {AuthRequired} from "@LS-Studios/use-user-auth";
import useLocalStorage from "@LS-Studios/use-local-storage";
import {LSWorkingTimesConfig} from "./firebase/LSWorkingTimesConfig";
import {get, getDatabase, ref} from "firebase/database";

function Screens() {
    const translation = useTranslation()
    const auth = useComponentUserAuth()
    const theme = useComponentTheme()
    const navigate = useNavigate()

    const [currentMenu, setCurrentMenu] = useLocalStorage("currentMenu", 0)
    const [menuText, setMenuText] = useState("Test")

    const getUserEmail = () => {
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const dbAuth = getAuth(app)

        if (dbAuth.currentUser != null)
            return dbAuth.currentUser.email
        else
            return ""
    }

    useEffect(() => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const db = getDatabase(lsWorkingTimesApp)
        const dbAuth = getAuth(lsWalletApp)

        const unsubscribeArray = []

        unsubscribeArray.push(
            dbAuth.onAuthStateChanged(function(user) {
                //Set language
                get(ref(db, "/users/"+user.uid+"/language")).then((snapshot) => {
                    if (snapshot.exists()) {
                        translation.changeLanguage(snapshot.val())
                    } else {
                        console.log("No language available");
                    }
                }).catch((error) => {
                    console.error(error);
                });

                //Set theme
                get(ref(db, "/users/"+user.uid+"/theme")).then((snapshot) => {
                    if (snapshot.exists()) {
                        theme.changeTheme(snapshot.val())
                    } else {
                        console.log("No theme available");
                    }
                }).catch((error) => {
                    console.error(error);
                });

                //Set user auth
                if (user == null) {
                    unsubscribeArray.forEach(unsubscribe => unsubscribe())
                    auth.logout()
                    navigate("/login")
                    return
                } else {
                    auth.login(user)
                }
            }))
        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [])

    useEffect(() => {
        document.querySelector(":root").style.setProperty("--bg-color", theme.currentTheme == "dark" ? "#212A33" : "#BCBCBC")
    }, [theme.currentTheme])

    useEffect(() => {
        setMenuText(auth.user ? getUserEmail() : translation.translate("login.menuName"))
    }, [auth.user])

    return (
        <OuterBody menuList={[
            {name:menuText},
            {name:translation.translate("timer.menuName"), link:"/timer"},
            {name:translation.translate("planning.menuName"), link:"/planning"},
            {name:translation.translate("prognosis.menuName"), link:"/prognosis"},
            {name:translation.translate("settings.menuName"), link:"/settings"}
        ]} isAvailable={(i) => {
            if (auth.user == null) {
                return i === 0;
            } else {
                return true
            }
        }} changeLink={link => navigate(link)} currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} footerName={"LS-Working-Times"}>
            <Routes>
                <Route path="/login" element={<Login setCurrentMenu={setCurrentMenu}/>}/>
                <Route
                    path="/timing"
                    element={
                        <AuthRequired userAuth={auth} notAuthenticated={() => navigate("/login")}>
                            <Timing setCurrentMenu={setCurrentMenu}/>
                        </AuthRequired>
                    }
                />
                <Route
                    path="/planning"
                    element={
                        <AuthRequired userAuth={auth} notAuthenticated={() => navigate("/login")}>
                            <Planning setCurrentMenu={setCurrentMenu}/>
                        </AuthRequired>
                    }
                />
                <Route
                    path="/prognosis"
                    element={
                        <AuthRequired userAuth={auth} notAuthenticated={() => navigate("/login")}>
                            <Prognosis setCurrentMenu={setCurrentMenu}/>
                        </AuthRequired>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <AuthRequired userAuth={auth} notAuthenticated={() => navigate("/login")}>
                            <Settings setCurrentMenu={setCurrentMenu}/>
                        </AuthRequired>
                    }
                />
                <Route
                    path="*"
                    element={
                        <AuthRequired userAuth={auth} notAuthenticated={() => navigate("/login")}>
                            <Navigate replace to="/timing" />
                        </AuthRequired>
                    }
                />
            </Routes>
        </OuterBody>
    );
}

export default Screens;