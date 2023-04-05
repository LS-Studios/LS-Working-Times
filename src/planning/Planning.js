import React, {useEffect, useState} from 'react';
import {get, getDatabase, onChildAdded, onChildChanged, onChildRemoved, push, ref, set} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import PlanningCard from "./card/PlanningCard";
import {Card, DateContent, ButtonCard, InputContent, Divider, useComponentTheme} from "@LS-Studios/components";
import ContentInWeekCard from "../cards/contentinweek/ContentInWeekCard";
import {useTranslation} from "@LS-Studios/use-translation";
import {formatDate} from "@LS-Studios/date-helper";

function Planning({setCurrentMenu}) {
    const translation = useTranslation()
    const theme = useComponentTheme()

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
                        translation.changeLanguage(snapshot.val())
                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });

                get(ref(db, "/users/" + user.uid + "/theme")).then((snapshot) => {
                    if (snapshot.exists()) {
                        theme.changeTheme(snapshot.val())
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
            <Card>
                <div>
                    <InputContent title={translation.translate("planning.description")} currentState={currentNewPlanInput}
                               setCurrentState={setCurrentNewPlanInput} inputType={3}
                               placeholder={translation.translate("planning.placeholder")}/>

                    <Divider />

                    <DateContent title={translation.translate("planning.dateOfPlan")} currentState={currentPlanDate} setCurrentState={setCurrentPlanDate} />
                </div>
            </Card>

            <div style={{marginTop:20}}>
                <ButtonCard title={translation.translate("planning.add")} clickAction={addNewPlan}/>

                <ContentInWeekCard dataArray={plannings} title={translation.translate("planning.plannings")} noItemMessage={translation.translate("planning.noSavedPlannings")} ItemCard={PlanningCard} selectedDate={selectedPlanningDate} setSelectedDate={setSelectedPlanningDate} isLoading={planningsIsLoading}/>
            </div>
        </div>
    );
}

export default Planning;