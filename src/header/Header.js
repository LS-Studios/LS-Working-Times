import React, {useEffect, useState} from 'react';
import "./Header.scss"
import { TfiMenu } from "react-icons/tfi";
import {Link} from "react-router-dom";
import {getAuth} from "firebase/auth";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {t} from "react-switch-lang";

const Header = ({ currentMenu, setCurrentMenu, menuIsOpened, setMenuIsOpen}) => {
    const getCurrentMenuName = () => {
        switch (currentMenu) {
            case 0:
                return t("login.menuName")
            case 1:
                return t("timer.menuName")
            case 2:
                return t("settings.menuName")
        }
    }

    const setNewActiveMenu = (e) => {
        setCurrentMenu(e.currentTarget.value)
        setMenuIsOpen(false)
    }

    const openMenu = (e) => {
        setMenuIsOpen(!menuIsOpened)
    }

    const getUserIsLoggedIn = () => {
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        return auth.currentUser != null
    }

    const getUserEmail = () => {
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        if (auth.currentUser != null)
            return auth.currentUser.email
        else
            return ""
    }

    return (
        <div className="header">
            <div className="headerTop" onClick={openMenu}>
                <h1 className="headerText">{getCurrentMenuName()}</h1>
                <TfiMenu/>
            </div>
            <ul className={menuIsOpened ? "headerMenu" : "gone"}>
                <li className={!getUserIsLoggedIn() ? (currentMenu === 0 ? "headerMenuActiveItem" : "headerMenuNotActiveItem") : "gone"} value={0} onClick={setNewActiveMenu}><Link to="/login">{t("login.menuName")}</Link></li>
                <li className={getUserIsLoggedIn() ? "headerMenuValueItem" : "gone"}><Link to="/timer">{getUserEmail()}</Link></li>
                <li className={getUserIsLoggedIn() ? (currentMenu === 1 ? "headerMenuActiveItem" : "headerMenuNotActiveItem") : "menuNotAvailable"} value={1} onClick={setNewActiveMenu}><Link to="/timer">{t("timer.menuName")}</Link></li>
                <li className={getUserIsLoggedIn() ? (currentMenu === 2 ? "headerMenuActiveItem" : "headerMenuNotActiveItem") : "menuNotAvailable"} value={2} onClick={setNewActiveMenu}><Link to="/settings">{t("settings.menuName")}</Link></li>
            </ul>
        </div>
    );
};

export default Header;