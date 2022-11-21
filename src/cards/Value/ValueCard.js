import React from 'react';
import "./ValueCard.scss"
import {useNavigate} from "react-router-dom";

const ValueCard = ({className, title, value, clickable, onClick=null}) => {
    const navigate = useNavigate()

    return (
        <div className={className == null ? (clickable ? "clickableValueCard" : "notClickableValueCard") : className} onClick={onClick}>
            <div className="valueContainer">
                <div><b>{title}</b></div>
                <div className="valueDivider"/>
                <div>{value}</div>
            </div>
        </div>
    );
};

export default ValueCard;