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
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";
import {
    Spinner,
    SpinnerType,
    useContextGlobalVariables,
    useContextTranslation,
    useContextUserAuth,
    ValueCard
} from "@LS-Studios/components";
import {getDateFromString, getDateWithoutTime, getEndOfWeek, getStartOfWeek} from "@LS-Studios/date-helper";
import {DateTime} from "../../classes/DateTime";
import {breakTimerContext, workTimerContext} from "../../providers/Providers";

function Saves({ saves, setSaves }) {
    const translation = useContextTranslation()
    const auth = useContextUserAuth()
    const globalVariables = useContextGlobalVariables()

    const [savesAreFetching, setSavesAreFetching] = useState(true)
    const [selectedSavesDate, setSelectedSavesDate] = useState(new Date())

    const workTimer = useContext(workTimerContext)
    const breakTimer = useContext(breakTimerContext)

    const currentTimerId = globalVariables.getLSVar("currentTimerId")

    useEffect(() => {
        const unsubscribeArray = []

        if (!auth.userIsFetching && auth.user) {
            const firebaseDB = getFirebaseDB()

            get(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved")).then(() => {
                setSavesAreFetching(false)
            })

            unsubscribeArray.push(
                onChildAdded(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved"), snapshot => {
                    const value = snapshot.val()

                    if (value != null) {
                        setSaves(prevState => (
                            [value].concat(prevState)
                        ))
                    }
                }))
            unsubscribeArray.push(
                onChildChanged(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved"), snapshot => {
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
                onChildRemoved(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved"), snapshot => {
                    const value = snapshot.val()
                    if (value != null) {
                        setSaves((current) =>
                            current.filter((save) => save.id !== value.id)
                        );
                    }
                }))
        }

        return () => {
            setSaves([])
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [auth.userIsFetching, currentTimerId])

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
            workedThisWeek = workedThisWeek.addDateTime(workTimer.currentTime)
        }

        return workedThisWeek.toTimeString()
    }

    return <div>
        <ValueCard title={translation.translate("timer.workedTimeThisWeek")} value={(workTimer.timeIsFetching || breakTimer.timeIsFetching) ? <Spinner type={SpinnerType.dots}/> : getWorkedTimeInCurrentWeek()}/>
        <ContentInWeekCard dataArray={saves} title={translation.translate("timer.saved")} noItemMessage={translation.translate("timer.noSaves")} ItemCard={SavedCard} selectedDate={selectedSavesDate} setSelectedDate={setSelectedSavesDate} isLoading={savesAreFetching}/>
    </div>
}

export default Saves;