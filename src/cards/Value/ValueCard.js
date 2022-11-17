import React from 'react';
import "./ValueCard.scss"
import {useNavigate} from "react-router-dom";

const ValueCard = ({title, value, dir, link}) => {
    const navigate = useNavigate()

    const gotTo = () => {
        navigate(link)
    }

    return (
        <div className={dir == "vertical" ? "verticalValueCard" : "horizontalValueCard"} onClick={link != null ? gotTo : null}>
            <div className="valueContainer">
                <div><b>{title}</b></div>
                <div className={dir == "vertical" ? "verticalValueDivider" : "horizontalValueDivider"}/>
                <div>{value}</div>
            </div>
        </div>
    );
};

export default ValueCard;