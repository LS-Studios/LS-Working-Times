import React, {useEffect, useState} from 'react';
import "./Header.scss"
import { TfiMenu } from "react-icons/tfi";
import {Link} from "react-router-dom";
import {getAuth} from "firebase/auth";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../firebase/LSWalletConfig";

const Header = ({ currentMenu, setCurrentMenu, menuIsOpened, setMenuIsOpen}) => {
    const getCurrentMenuName = () => {
        switch (currentMenu) {
            case 0:
                return "Login"
            case 1:
                return "Timer"
            case 2:
                return "Settings"
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

    return (
        <div className="header">
            <div className="headerTop" onClick={openMenu}>
                <h1 className="headerText">{getCurrentMenuName()}</h1>
                <TfiMenu/>
            </div>
            <ul className={menuIsOpened ? "headerMenu" : "gone"}>
                <li className={!getUserIsLoggedIn() ? (currentMenu === 0 ? "headerMenuActiveItem" : "headerMenuNotActiveItem") : "gone"} value={0} onClick={setNewActiveMenu}><Link to="/login">Login</Link></li>
                <li className={getUserIsLoggedIn() ? (currentMenu === 1 ? "headerMenuActiveItem" : "headerMenuNotActiveItem") : "menuNotAvailable"} value={1} onClick={setNewActiveMenu}><Link to="/timer">Timer</Link></li>
                <li className={getUserIsLoggedIn() ? (currentMenu === 2 ? "headerMenuActiveItem" : "headerMenuNotActiveItem") : "menuNotAvailable"} value={2} onClick={setNewActiveMenu}><Link to="/settings">Settings</Link></li>
            </ul>
        </div>
    );
};

export default Header;