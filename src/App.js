import './App.scss';
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
import {setTranslations, translate} from "./helper/LanguageTransaltion/Transalation";
import en from "./helper/LanguageTransaltion/languages/en.json"
import de from "./helper/LanguageTransaltion/languages/de.json"
import {setDefaultTheme, setThemeUp} from "./helper/Theme/Theme";
import ChangeCredentialsDialog from "./dialogs/credentials/ChangeCredentialsDialog";
import Prognosis from "./prognosis/Prognosis";

function App(props) {
    const [currentMenu, setCurrentMenu] = useState(0)
    const [menuIsOpened, setMenuIsOpen] = useState(false);

    const dialogs = {
        YesNoDialog,
        ChangeTimeDialog,
        EditSaveTimeDialog,
        ChangeCredentialsDialog
    }

    useEffect(() => {
        setTranslations({en,de});

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
                </div>
                <Header currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} menuIsOpened={menuIsOpened} setMenuIsOpen={setMenuIsOpen}/>
                <div className="spacer2"/>
                <Footer/>
            </Router>
        </DialogProvider>
    );
}

export default setThemeUp(translate(App));
