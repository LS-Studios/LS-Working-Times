import React, {useEffect, useState} from 'react';
import {Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {
    CreateAccountScreen, LoginAsGuestScreen,
    LoginScreen,
    OuterBody, SettingsScreen,
    useContextTheme, useContextTranslation,
    useContextUserAuth
} from "@LS-Studios/components";
import useLocalStorage from "@LS-Studios/use-local-storage";
import { onAuthStateChanged } from "firebase/auth";
import {ref, get} from "firebase/database";
import {AuthRequired, getUserFirebaseAuth, getUserFirebaseDB} from "@LS-Studios/use-user-auth";
import Timing from "./timing/Timing";
import Planning from "./planning/Planning";
import Prognosis from "./prognosis/Prognosis";
import AdditionalSettings from "./settings/AdditionalSettings";

function Screens() {
    const translation = useContextTranslation()
    const auth = useContextUserAuth()
    const theme = useContextTheme()
    const navigate = useNavigate()
    const location = useLocation()

    const [currentMenu, setCurrentMenu] = useLocalStorage("currentMenu", 0)
    const [menuText, setMenuText] = useState("")
    const [jumpInLink, setJumpInLink] = useState("/lists")

    useEffect(() => {
        const unsubscribeArray = []

        if (auth.user != null && !auth.user.isGuest) {
            auth.syncStateWithFirebaseUser().then((syncUser) => {
                translation.changeLanguage(syncUser.language)
                theme.changeTheme(syncUser.theme)
            })

            unsubscribeArray.push(
                onAuthStateChanged(getUserFirebaseAuth(), (user) => {
                    if (user == null) {
                        unsubscribeArray.forEach(unsubscribe => unsubscribe())
                        auth.logout()
                        return
                    }
                }))
        }

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [])

    useEffect(() => {
        if (auth.user == null) {
            navigate("/login")
        } else {
            const firebaseDB = getUserFirebaseDB()

            get(ref(firebaseDB, "/users/" + auth.user.id + "/theme")).then((snapshot) => {
                theme.changeTheme(snapshot.val())
            })

            get(ref(firebaseDB, "/users/" + auth.user.id + "/language")).then((snapshot) => {
                translation.changeLanguage(snapshot.val())
            })
        }

        setMenuText(auth.user ? auth.user.name : translation.translate("login.login"))
    }, [auth.user])

    useEffect(() => {
        document.querySelector(":root").style.setProperty("--bg-color", theme.getThemeColor("screen-bg-color"))
    }, [theme.currentTheme])

    const needToAuthenticate = () => {
        setJumpInLink(location.pathname)
        navigate("/login")
    }

    const navigateToJumpInLink = () => {
        navigate(jumpInLink)
    }

    return (
        <OuterBody menuList={[
            {name:menuText},
            {name:translation.translate("timer.menuName"), link:"/timer"},
            {name:translation.translate("planning.menuName"), link:"/planning"},
            {name:translation.translate("prognosis.menuName"), link:"/prognosis"},
            {name:translation.translate("settings.menuName"), link:"/settings"}
        ]} isAvailable={(menu, i) => {
            if (auth.user == null) {
                return i === 0;
            }
        }} changeLink={link => navigate(link)} currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} footerName={"LS-Working-Times"}>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <LoginScreen successfullyLoggedInAction={navigateToJumpInLink} navigate={navigate} setCurrentMenu={setCurrentMenu} setMenuText={setMenuText}/>
                    }
                />
                <Route
                    path="/login-as-guest"
                    element={
                        <LoginAsGuestScreen successfullyLoggedInAsGuestAction={navigateToJumpInLink} navigate={navigate} setCurrentMenu={setCurrentMenu} setMenuText={setMenuText}/>
                    }
                />
                <Route
                    path="/create-account"
                    element={
                        <CreateAccountScreen successfullyCreatedAccountAction={navigateToJumpInLink} navigate={navigate} setCurrentMenu={setCurrentMenu} setMenuText={setMenuText}/>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <AuthRequired userAuth={auth} notAuthenticated={needToAuthenticate}>
                            <SettingsScreen setCurrentMenu={setCurrentMenu} additionalSettings={<AdditionalSettings />}/>
                        </AuthRequired>
                    }
                />
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