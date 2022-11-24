import './App.css';
import Login from "./login/Login";
import {
    BrowserRouter as Router, Navigate,
    Route,
    Routes
} from "react-router-dom";
import Timing from "./timing/Timing";
import React, {useEffect, useState} from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Settings from "./settings/Settings";
import {DialogProvider} from "use-react-dialog";
import YesNoDialog from "./dialogs/choice/YesNoDialog";
import ChangeTimeDialog from "./dialogs/time/ChangeTimeDialog";
import EditSaveTimeDialog from "./dialogs/edit/EditSaveTimeDialog";
import {setDefaultLanguage, setLanguage, setLanguageCookie, setTranslations, translate} from "./helper/Translation/Transalation";
import en from "./helper/Translation/languages/en.json"
import de from "./helper/Translation/languages/de.json"
import {getThemeClass, setDefaultTheme, setThemeUp} from "./helper/Theme/Theme";

function App(props) {
    const [currentMenu, setCurrentMenu] = useState(0)
    const [menuIsOpened, setMenuIsOpen] = useState(false);

    const dialogs = {
        YesNoDialog,
        ChangeTimeDialog,
        EditSaveTimeDialog
    }

    useEffect(() => {
        setTranslations({en,de});
        setDefaultLanguage('en');

        setDefaultTheme("dark")
        document.body.classList.add("darkBody")
    }, [])

    return (
        <DialogProvider dialogs={dialogs}>
            <Router className="holder">
                <div className="spacer1"/>
                <div className={menuIsOpened ? "blur" : ""}>
                    <Routes>
                        <Route path="/login" element={<Login setCurrentMenu={setCurrentMenu}/>}/>
                        <Route
                            path="/timing"
                            element={<Timing setCurrentMenu={setCurrentMenu}/>}
                        />
                        <Route
                            path="/settings"
                            element={<Settings setCurrentMenu={setCurrentMenu} setLanguage={setLanguage}/>}
                        />
                        <Route
                            path="*"
                            element={<Navigate replace to="/timing" />}
                        />
                    </Routes>
                </div>
                <Header currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} menuIsOpened={menuIsOpened} setMenuIsOpen={setMenuIsOpen}/>
                <div className="spacer2"/>
                <Footer/>
            </Router>
        </DialogProvider>
    );
}

export default setThemeUp(translate(App));
