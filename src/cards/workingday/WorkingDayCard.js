import React from 'react';
import ContentCard from "../content/ContentCard";
import {useContextDialog, useContextTranslation} from "@LS-Studios/components";
import {padTo2Digits} from "@LS-Studios/date-helper";
import {ref, remove} from "firebase/database";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";

const WorkingDayCard = ({workingDayIndex, rangeIndex, workingDays,  setWorkingDays, isExpanded=false}) => {
    const translation = useContextTranslation()
    const dialog = useContextDialog()

    const deleteRange = (e) => {
        dialog.openDialog("OptionDialog", {
            title: translation.translate("dialog.deleteTimeRange"),
            message: translation.translate("dialog.doYouRelayWantToDeleteThisTimeRange"),
            options: [{
                name: translation.translate("dialog.yes"),
                action: () => {
                    setWorkingDays(current => {
                        let newWorkingDays = JSON.parse(JSON.stringify(current));
                        newWorkingDays[workingDayIndex][2].splice(rangeIndex, 1)
                        return newWorkingDays
                    });
                }
            }, {
                name: translation.translate("dialog.no")
            }]
        })
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

export default WorkingDayCard;