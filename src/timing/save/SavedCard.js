import React, {useState} from 'react';
import "./SaveCard.css"
import {DateTime} from "../timer/DateTime";
import {getDatabase, ref, remove} from "firebase/database"
import {getAuth} from "firebase/auth";

function SavedCard({save, isExpanded}) {
    const [expanded, setExpanded] = useState(isExpanded)

    const getDateNameByString = (string) => {
        const splitList = string.split(".")
        const date = new Date(splitList[2]+"/"+splitList[1]+"/"+splitList[0])
        return date.toLocaleDateString("en", {weekday: 'long'})
    }

    const getEndTimeString = () => {
        const startDateTime = DateTime.dateTimeFromString(save.startTime)
        const workedDateTime = DateTime.dateTimeFromString(save.worked)
        const breakDateTime = DateTime.dateTimeFromString(save.break)
        const endDateTime = startDateTime.addDateTime(workedDateTime).addDateTime(breakDateTime)

        return endDateTime.toTimeString()
    }

    const expand = () => {
        setExpanded(!expanded)
    }

    const deleteSave = () => {
        const auth = getAuth()
        remove(ref(getDatabase(), "/users/" + auth.currentUser.uid + "/saved/"+save.id))
    }

    return (
        <div className="saveCardBg" onClick={expand}>
            <div className={expanded ? "saveCardTitleExpanded" : ""}>
                <div><b>{getDateNameByString(save.date)} the {save.date}</b></div>
            </div>
            <div className={expanded ? "" : "gone"}>
                <div className="saveCardRowTitle">
                    <div>Started at</div>
                    <div>Ended at</div>
                </div>
                <div className="saveCardRowValue">
                    <div>{save.startTime}</div>
                    <div>{getEndTimeString()}</div>
                </div>
                <div className="saveCardRowTitle">
                    <div>Worked time</div>
                    <div>Break time</div>
                </div>
                <div className="saveCardRowValue">
                    <div>{save.worked}</div>
                    <div>{save.break}</div>
                </div>
                <button className="saveCardDeleteButton" onClick={deleteSave}>Delete</button>
            </div>
        </div>
    );
}

export default SavedCard;