import {useDialog} from "use-react-dialog";
import "./Dialog.scss"
import React from "react";

const Dialog = ({title, dialogContent}) => {
    return (
        <div id="popup1" className="overlay">
            <div className="popup">
                <div className="title"><b>{title}</b></div>
                <div className="content">
                    {dialogContent}
                </div>
            </div>
        </div>
    );
}

export default Dialog