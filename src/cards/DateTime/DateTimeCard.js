import React, {useEffect, useRef, useState} from 'react';
import "./DateTimeContent.scss"
import "./DateTimePicker.scss"
import DateTimeContent from "./DateTimeContent";
import Card from "../Card";

const DateTimeCard = ({title, value, type}) => {
    return (
        <Card cardContent={
            <DateTimeContent title={title} value={value} type={type} />
        } isPointer={true}/>
    );
};

export default DateTimeCard;