import {useDialog} from "use-react-dialog";
import "./Dialog.scss"
import React from "react";
import {getThemeClass} from "../helper/Theme/Theme";

const Dialog = ({title, dialogContent}) => {
    return (
        <div id="popup" className="overlay">
            <div className={getThemeClass("popup")}>
                <div className="title"><b>{title}</b></div>
                <div className="content">
                    {dialogContent}
                </div>
            </div>
        </div>
    );
}

export default Dialog