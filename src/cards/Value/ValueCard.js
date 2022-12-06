import React from 'react';
import "./ValueCard.scss"
import {useNavigate} from "react-router-dom";
import {getThemeClass} from "../../helper/Theme/Theme";

const ValueCard = ({className, title, value, clickable, onClick=null}) => {
    return (
        <div className={className == null ? (clickable ? getThemeClass("clickableValueCard") : getThemeClass("notClickableValueCard")) : className} onClick={onClick}>
            <div className="valueContainer">
                <div><b>{title}</b></div>
                <div className={getThemeClass("divider")}/>
                <div className="valueCardText">{value}</div>
            </div>
        </div>
    );
};

export default ValueCard;