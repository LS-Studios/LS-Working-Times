import React, {useState} from 'react';
import "./Footer.scss"
import {getThemeClass} from "../helper/Theme/Theme";

const Footer = () => {

    return (
        <div className={getThemeClass("footer")}>
            <h1>LS-Working-Times</h1>
        </div>
    );
};

export default Footer;