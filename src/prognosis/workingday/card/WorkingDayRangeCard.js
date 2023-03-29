import React from 'react';
import {useDialog} from "use-react-dialog";
import {t} from "../../../helper/LanguageTransaltion/Transalation";
import ContentCard from "../../../cards/contentinweek/content/ContentCard";
import {padTo2Digits} from "../../../helper/Helper";

const WorkingDayRangeCard = ({workingDayIndex, rangeIndex, workingDays,  setWorkingDays, isExpanded=false}) => {
    const { dialogs, openDialog } = useDialog();

    const deleteRange = (e) => {
        openDialog("YesNoDialog", {message:t("dialog.doYouRelayWantToDeleteThisTimeRange"), yesAction:() => {
                setWorkingDays(current => {
                    let newWorkingDays = JSON.parse(JSON.stringify(current));
                    newWorkingDays[workingDayIndex][2].splice(rangeIndex, 1)
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

    const getTitle = () => {
        return padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][0].hours) + ":" +
        padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][0].minutes) + ":" +
        padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][0].seconds) + " - " +
        padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][1].hours) + ":" +
        padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][1].minutes) + ":" +
        padTo2Digits(workingDays[workingDayIndex][2][rangeIndex][1].seconds)
    }

    return (
        <ContentCard title={getTitle()} editAction={editRange} deleteAction={deleteRange} isExpanded={isExpanded} />
    );
};

export default WorkingDayRangeCard;