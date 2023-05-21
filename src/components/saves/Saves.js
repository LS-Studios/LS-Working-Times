import React, {useEffect, useRef, useState} from 'react';
import "./Saves.css"

import {
    ref,
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    get
} from "firebase/database"
import ContentInWeekCard from "../../cards/contentinweek/ContentInWeekCard";
import SavedCard from "../../cards/save/SavedCard";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";
import {useContextTranslation, useContextUserAuth} from "@LS-Studios/components";

function Saves() {
    const translation = useContextTranslation()
    const auth = useContextUserAuth()

    const [saves, setSaves] = useState([])
    const [savesAreFetching, setSavesAreFetching] = useState(true)
    const [selectedSavesDate, setSelectedSavesDate] = useState(new Date())

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

    return (
        <ContentInWeekCard dataArray={saves} title={translation.translate("timer.saved")} noItemMessage={translation.translate("timer.noSaves")} ItemCard={SavedCard} selectedDate={selectedSavesDate} setSelectedDate={setSelectedSavesDate} isLoading={savesAreFetching}/>
    );
}

export default Saves;