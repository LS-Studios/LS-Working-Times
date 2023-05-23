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
import {ref, get} from "firebase/database";
import {AuthRequired, getUserFirebaseDB} from "@LS-Studios/use-user-auth";
import Planning from "./planning/Planning";
import Prognosis from "./prognosis/Prognosis";
import AdditionalSettings from "./settings/AdditionalSettings";
import Timer from "./timer/Timer";

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
        // console.log("1")
        //
        // get(ref(getFirebaseDB(), "/")).then((snapshot) => {
        //     console.log("2")
        // })

        if (auth.user != null) {
            const firebaseDB = getUserFirebaseDB()

            get(ref(firebaseDB, "/users/" + auth.user.id + "/theme")).then((snapshot) => {
                theme.changeTheme(snapshot.val())
                auth.updateCredentials(
                    null,
                    null,
                    null,
                    null,
                    snapshot.val(),
                    translation
                )
            })

            get(ref(firebaseDB, "/users/" + auth.user.id + "/language")).then((snapshot) => {
                translation.changeLanguage(snapshot.val())
                auth.updateCredentials(
                    null,
                    null,
                    null,
                    snapshot.val(),
                    null,
                    translation
                )
            })
        }

        setMenuText(auth.user ? auth.user.name : translation.translate("login.login"))
    }, [])

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
            {name:translation.translate("settings.menu-name"), link:"/settings"},
            {name:translation.translate("timer.menu-name"), link:"/timer"},
            {name:translation.translate("planning.menu-name"), link:"/planning"},
            {name:translation.translate("prognosis.menu-name"), link:"/prognosis"}
        ]} isAvailable={(menu, i) => {
            if (auth.user == null) {
                return i === 0;
            } else {
                return true
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
                            <Timer setCurrentMenu={setCurrentMenu}/>
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