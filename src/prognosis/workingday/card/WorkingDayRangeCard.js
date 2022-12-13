import React from 'react';
import {useDialog} from "use-react-dialog";
import {t} from "../../../helper/LanguageTransaltion/Transalation";
import ContentCard from "../../../cards/ContentInWeek/content/ContentCard";
import {padTo2Digits} from "../../../helper/Helper";

const WorkingDayRangeCard = ({workingDayIndex, rangeIndex, workingDays,  setWorkingDays, isExpanded=false}) => {
    const { dialogs, openDialog } = useDialog();

    const deleteRange = (e) => {
        openDialog("YesNoDialog", {message:t("dialog.doYouRelayWantToDeleteThisTimeRange"), yesAction:() => {
                setWorkingDays(current => {
                    let newWorkingDays = current
                    console.log(newWorkingDays[0][2])
                    newWorkingDays[workingDayIndex][2] = newWorkingDays[workingDayIndex][2].splice(rangeIndex, 1)
                    console.log(newWorkingDays[0][2])
                    return newWorkingDays
                });
            }})
    }

    const editRange = (e) => {
        openDialog("PrognosisDialog", {
            workingDayIndex: workingDayIndex,
            rangeIndex: rangeIndex,
            workingDays: workingDays,
            setWorkingDays: setWorkingDays
        })
    }

    return (
        <ContentCard title={
            padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][0].getHours) + ":" +
            padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][0].getMinutes) + ":" +
            padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][0].getSeconds) + " - " +
            padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][1].getHours) + ":" +
            padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][1].getMinutes) + ":" +
            padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][1].getSeconds)}
            editAction={editRange} deleteAction={deleteRange} isExpanded={isExpanded} />
    );
};

export default WorkingDayRangeCard;