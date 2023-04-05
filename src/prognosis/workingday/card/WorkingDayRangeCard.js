import React from 'react';
import ContentCard from "../../../cards/contentinweek/content/ContentCard";
import {useComponentDialog} from "@LS-Studios/components";
import {padTo2Digits} from "@LS-Studios/date-helper";
import {useTranslation} from "@LS-Studios/use-translation";

const WorkingDayRangeCard = ({workingDayIndex, rangeIndex, workingDays,  setWorkingDays, isExpanded=false}) => {
    const translation = useTranslation()
    const dialog = useComponentDialog()

    const deleteRange = (e) => {
        dialog.openDialog("YesNoDialog", {message:translation.translate("dialog.doYouRelayWantToDeleteThisTimeRange"), yesAction:() => {
                setWorkingDays(current => {
                    let newWorkingDays = JSON.parse(JSON.stringify(current));
                    newWorkingDays[workingDayIndex][2].splice(rangeIndex, 1)
                    return newWorkingDays
                });
            }})
    }

    const editRange = (e) => {
        dialog.openDialog("PrognosisDialog", {
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