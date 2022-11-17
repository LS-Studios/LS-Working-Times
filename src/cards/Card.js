import React from 'react';
import "./Card.scss"

const ValueCard = ({cardContent, isPointer}) => {
    return (
        <div className={isPointer ? "pointerCard" : "noPointerCard"}>
            {
                cardContent
            }
        </div>
    );
};

export default ValueCard;