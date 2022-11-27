import React from 'react';
import "./Card.scss"
import {getThemeClass} from "../helper/Theme/Theme";

const Card = ({cardContent}) => {
    return (
        <div className={getThemeClass("card")}>
            {
                cardContent
            }
        </div>
    );
};

export default Card;