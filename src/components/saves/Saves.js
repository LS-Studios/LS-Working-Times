import React, {useContext, useEffect, useRef, useState} from 'react';
import "./Saves.css"

import {
    ref,
    onChildAdded,
    onChildChanged,
    onChildRemoved, get
} from "firebase/database"
import ContentInWeekCard from "../../cards/contentinweek/ContentInWeekCard";
import SavedCard from "../../cards/save/SavedCard";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";
import {Spinner, useContextTranslation, useContextUserAuth, ValueCard} from "@LS-Studios/components";
import {getDateFromString, getDateWithoutTime, getEndOfWeek, getStartOfWeek} from "@LS-Studios/date-helper";
import {DateTime} from "../../classes/DateTime";
import {breakTimerContext, workTimerContext} from "../../providers/Providers";

function Saves({ saves, setSaves }) {
    const translation = useContextTranslation()
    const auth = useContextUserAuth()

    const [savesAreFetching, setSavesAreFetching] = useState(true)
    const [selectedSavesDate, setSelectedSavesDate] = useState(new Date())

    const workTimer = useContext(workTimerContext)
    const breakTimer = useContext(breakTimerContext)

    useEffect(() => {
        const unsubscribeArray = []

        const firebaseDB = getFirebaseDB()

        unsubscribeArray.push(
            onChildAdded(ref(firebaseDB, "/users/" + auth.user.id + "/saved"), snapshot => {
                const value = snapshot.val()
                if (value != null) {
                    setSavesAreFetching(false)

                    setSaves(prevState => (
                        [value].concat(prevState)
                    ))
                }
            }))
        unsubscribeArray.push(
            onChildChanged(ref(firebaseDB, "/users/" + auth.user.id + "/saved"), snapshot => {
                if (snapshot.exists()) {
                    const saves = []
                    snapshot.forEach(childSnapshot => {
                        saves.push(childSnapshot.val())
                    })

                    const newState = saves.map(obj => {
                        if (obj.id === snapshot.val().id) {
                            return snapshot.val();
                        }

                        return obj;
                    });

                    setSaves(newState);
                } else {
                    console.log("No data available");
                }
            }))
        unsubscribeArray.push(
            onChildRemoved(ref(firebaseDB, "/users/" + auth.user.id + "/saved"), snapshot => {
                const value = snapshot.val()
                if (value != null) {
                    setSaves((current) =>
                        current.filter((save) => save.id !== value.id)
                    );
                }
            }))

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [])

    const getWorkedTimeInCurrentWeek = () => {
        const savesThisWeek = saves.filter(save => {
            const saveDate = getDateFromString(save.date)
            return saveDate >= getStartOfWeek(selectedSavesDate) && saveDate <= getEndOfWeek(selectedSavesDate)
        })

        let workedThisWeek = new DateTime(0, 0, 0)

        savesThisWeek.forEach(save => {
            workedThisWeek = workedThisWeek.addDateTime(DateTime.dateTimeFromString(save.worked))
        })

        if (getDateWithoutTime(selectedSavesDate) >= getStartOfWeek(new Date()) && getDateWithoutTime(selectedSavesDate) <= getEndOfWeek(new Date())) {
            workedThisWeek = workedThisWeek.addDateTime(new DateTime(workTimer.getHours, workTimer.getMinutes, workTimer.getSeconds))
        }

        return workedThisWeek.toTimeString()
    }

    return <div>
        <ValueCard title={translation.translate("timer.workedTimeThisWeek")} value={(workTimer.timeIsFetching || breakTimer.timeIsFetching) ? <Spinner type="dots"/> : getWorkedTimeInCurrentWeek()}/>
        <ContentInWeekCard dataArray={saves} title={translation.translate("timer.saved")} noItemMessage={translation.translate("timer.noSaves")} ItemCard={SavedCard} selectedDate={selectedSavesDate} setSelectedDate={setSelectedSavesDate} isLoading={savesAreFetching}/>
    </div>
}

export default Saves;