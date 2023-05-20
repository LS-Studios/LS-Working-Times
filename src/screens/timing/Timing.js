import React, {useEffect, useRef, useState} from 'react';
import "./Timing.css"

import {
    getDatabase,
    ref,
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    get
} from "firebase/database"
import {getAuth} from "firebase/auth";
import ContentInWeekCard from "../../cards/contentinweek/ContentInWeekCard";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../../firebase/config/LSWalletConfig";
import {LSWorkingTimesConfig} from "../../firebase/config/LSWorkingTimesConfig";
import Timer from "../timer/Timer";
import {useNavigate} from "react-router-dom";
import SavedCard from "../../cards/save/SavedCard";
import {useTranslation} from "@LS-Studios/use-translation";
import {useComponentTheme, useComponentUserAuth} from "@LS-Studios/components";

function Timing({setCurrentMenu}) {
    const translation = useTranslation()
    const theme = useComponentTheme()
    const navigate = useNavigate()
    const auth = useComponentUserAuth()

    useEffect(() => {
        setCurrentMenu(1)

        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const db = getDatabase(lsWorkingTimesApp)
        const dbAuth = getAuth(lsWalletApp)

        const unsubscribeArray = []

        unsubscribeArray.push(
            dbAuth.onAuthStateChanged(function(user) {
                auth.login(user)

                get(ref(db, "/users/"+user.uid+"/language")).then((snapshot) => {
                    if (snapshot.exists()) {
                        theme.changeTheme(snapshot.val())
                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });

                get(ref(db, "/users/"+user.uid+"/theme")).then((snapshot) => {
                    if (snapshot.exists()) {
                        theme.changeTheme(snapshot.val())
                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });

                if (user == null) {
                    unsubscribeArray.forEach(unsubscribe => unsubscribe())
                    navigate("/login")
                    return
                }

                unsubscribeArray.push(
                    onChildAdded(ref(db, "/users/" + user.uid + "/saved"), snapshot => {
                        const value = snapshot.val()
                        if (value != null) {
                            setSavesIsLoading(false)

                            setSaved(prevState => (
                                [value].concat(prevState)
                            ))
                        }
                }))
                unsubscribeArray.push(
                    onChildChanged(ref(db, "/users/" + user.uid + "/saved"), snapshot => {
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

                            setSaved(newState);
                        } else {
                            console.log("No data available");
                        }
                    }))
                unsubscribeArray.push(
                    onChildRemoved(ref(db, "/users/" + user.uid + "/saved"), snapshot => {
                        const value = snapshot.val()
                        if (value != null) {
                            setSaved((current) =>
                                current.filter((save) => save.id !== value.id)
                            );
                        }
                }))
        }))

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [])

    return (
        <div>
            <Timer saved={saved} selectedSaveDate={selectedSaveDate} setSavesIsLoading={setSavesIsLoading}/>
            <ContentInWeekCard dataArray={saved} title={translation.translate("timer.saved")} noItemMessage={translation.translate("timer.noSaves")} ItemCard={SavedCard} selectedDate={selectedSaveDate} setSelectedDate={setSelectedSaveDate} isLoading={savesIsLoading}/>
        </div>
    );
}

export default Timing;