import React, {useEffect, useState} from 'react';
import {getCurrentTheme, getThemeClass, setTheme} from "../helper/Theme/Theme";
import {getLanguage, setLanguage, t} from "../helper/LanguageTransaltion/Transalation";
import {get, getDatabase, onChildAdded, onChildChanged, onChildRemoved, push, ref, set} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import InputContent from "../cards/Input/InputContent";
import ButtonCard from "../cards/Button/ButtonCard";
import {formatDate, getDateFromString, getDateNameByString} from "../helper/Helper";
import {loadingSpinner} from "../spinner/LoadingSpinner";
import Card from "../cards/Card";
import DateTimeContent from "../cards/DateTime/DateTimeContent";
import PlanningCard from "./card/PlanningCard";
import SavedCard from "../timing/save/card/SavedCard";
import ContentInWeekCard from "../cards/ContentInWeek/ContentInWeekCard";

function Planning({setCurrentMenu}) {
    const [currentNewPlanInput, setCurrentNewPlanInput] = useState("");
    const [currentPlanDate, setCurrentPlanDate] = useState(new Date());
    const [plannings, setPlannings] = useState([]);
    const [planningsIsLoading, setPlanningsIsLoading] = useState(true)
    const [selectedPlanningDate, setSelectedPlanningDate] = useState(new Date())

    useEffect(() => {
        setCurrentMenu(2)

        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const db = getDatabase(lsWorkingTimesApp)
        const auth = getAuth(lsWalletApp)

        const unsubscribeArray = []

        unsubscribeArray.push(
            auth.onAuthStateChanged(function(user) {
                get(ref(db, "/users/" + user.uid + "/language")).then((snapshot) => {
                    if (snapshot.exists()) {
                        setLanguage(snapshot.val())
                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });

                get(ref(db, "/users/" + user.uid + "/theme")).then((snapshot) => {
                    if (snapshot.exists()) {
                        setTheme(snapshot.val())
                        document.body.classList.forEach((v, k, p) => {
                            document.body.classList.remove(v)
                        })
                        document.body.classList.add(getThemeClass("body"))
                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });

                get(ref(db, "/users/" + user.uid + "/plannings")).then((snapshot) => {
                    if (!snapshot.exists())
                        setPlanningsIsLoading(false)
                }).catch((error) => {
                    console.error(error);
                });
                unsubscribeArray.push(
                    onChildAdded(ref(db, "/users/" + user.uid + "/plannings"), snapshot => {
                        const value = snapshot.val()
                        if (value != null) {
                            setPlanningsIsLoading(false)

                            setPlannings(prevState => (
                                [value].concat(prevState)
                            ))
                        }
                    }))
                unsubscribeArray.push(
                    onChildChanged(ref(db, "/users/" + user.uid + "/plannings"), changedSnapshot => {
                        const value = changedSnapshot.val()
                        if (value != null) {
                            get(ref(db, "/users/" + user.uid + "/plannings")).then((snapshot) => {
                                if (snapshot.exists()) {
                                    const plannings = []
                                    snapshot.forEach(childSnapshot => {
                                        plannings.push(childSnapshot.val())
                                    })

                                    const newState = plannings.map(obj => {
                                        if (obj.id === value.id) {
                                            return value;
                                        }

                                        return obj;
                                    });

                                    setPlannings(newState);
                                } else {
                                    console.log("No data available");
                                }
                            }).catch((error) => {
                                console.error(error);
                            });
                        }
                    }))
                unsubscribeArray.push(
                    onChildRemoved(ref(db, "/users/" + user.uid + "/plannings"), snapshot => {
                        const value = snapshot.val()
                        if (value != null) {
                            setPlannings((current) =>
                                current.filter((planning) => planning.id !== value.id)
                            );
                        }
                    }))
            })
        )
    }, [])

    const addNewPlan = () => {
        if (currentNewPlanInput.replace("\\s+", "") !== "") {
            const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
            const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
            const db = getDatabase(lsWorkingTimesApp)
            const auth = getAuth(lsWalletApp)

            const newPlanningRef = push(ref(db, "/users/" + auth.currentUser.uid + "/plannings"));

            set(newPlanningRef, {
                id: newPlanningRef.key,
                date: formatDate(currentPlanDate),
                content: currentNewPlanInput
            });

            setCurrentNewPlanInput("")
        }
    }

    return (
        <div>
            <Card cardContent={
                <div>
                    <InputContent title={t("planning.description")} currentState={currentNewPlanInput}
                               setCurrentState={setCurrentNewPlanInput} inputType={3}
                               placeholder={t("planning.placeholder")}/>

                    <div className={getThemeClass("divider")}/>

                    <DateTimeContent title={t("planning.dateOfPlan")} currentState={currentPlanDate} setCurrentState={setCurrentPlanDate} type="date"/>
                </div>
            } />

            <div>
                <ButtonCard title={t("planning.add")} action={addNewPlan}/>

                <ContentInWeekCard dataArray={plannings} title={t("planning.plannings")} noItemMessage={t("planning.noSavedPlannings")} ItemCard={PlanningCard} selectedDate={selectedPlanningDate} setSelectedDate={setSelectedPlanningDate} isLoading={planningsIsLoading}/>
            </div>
        </div>
    );
}

export default Planning;