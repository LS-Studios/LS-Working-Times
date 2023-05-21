import React, {useEffect, useState} from 'react';
import {get, getDatabase, onChildAdded, onChildChanged, onChildRemoved, push, ref, set} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/config/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/config/LSWalletConfig";
import {getAuth} from "firebase/auth";
import PlanningCard from "../../cards/planing/PlanningCard";
import {
    Card,
    DateContent,
    ButtonCard,
    InputContent,
    Divider,
    useContextTranslation,
    useContextTheme, useContextUserAuth
} from "@LS-Studios/components";
import ContentInWeekCard from "../../cards/contentinweek/ContentInWeekCard";
import {formatDate} from "@LS-Studios/date-helper";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";

function Planning({setCurrentMenu}) {
    const translation = useContextTranslation()
    const auth = useContextUserAuth()

    const [currentNewPlanInput, setCurrentNewPlanInput] = useState("");
    const [currentPlanDate, setCurrentPlanDate] = useState(new Date());
    const [plannings, setPlannings] = useState([]);
    const [planningsIsLoading, setPlanningsIsLoading] = useState(true)
    const [selectedPlanningDate, setSelectedPlanningDate] = useState(new Date())

    useEffect(() => {
        setCurrentMenu(2)

        const unsubscribeArray = []

        const firebaseDB = getFirebaseDB()

        get(ref(firebaseDB, "/users/" + auth.user.id + "/plannings")).then((snapshot) => {
            if (!snapshot.exists())
                setPlanningsIsLoading(false)
        }).catch((error) => {
            console.error(error);
        });
        unsubscribeArray.push(
            onChildAdded(ref(firebaseDB, "/users/" + auth.user.id + "/plannings"), snapshot => {
                const value = snapshot.val()
                if (value != null) {
                    setPlanningsIsLoading(false)

                    setPlannings(prevState => (
                        [value].concat(prevState)
                    ))
                }
            }))
        unsubscribeArray.push(
            onChildChanged(ref(firebaseDB, "/users/" + auth.user.id + "/plannings"), changedSnapshot => {
                const value = changedSnapshot.val()
                if (value != null) {
                    get(ref(firebaseDB, "/users/" + auth.user.id + "/plannings")).then((snapshot) => {
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
            onChildRemoved(ref(firebaseDB, "/users/" + auth.user.id + "/plannings"), snapshot => {
                const value = snapshot.val()
                if (value != null) {
                    setPlannings((current) =>
                        current.filter((planning) => planning.id !== value.id)
                    );
                }
            }))

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [])

    const addNewPlan = () => {
        if (currentNewPlanInput.replace("\\s+", "") !== "") {
            const newPlanningRef = push(ref(getFirebaseDB(), "/users/" + auth.user.id + "/plannings"));

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
                <InputContent title={translation.translate("planning.description")} currentState={currentNewPlanInput}
                              setCurrentState={setCurrentNewPlanInput} inputType={3}
                              placeholder={translation.translate("planning.placeholder")}/>

                <Divider />

                <DateContent title={translation.translate("planning.dateOfPlan")} currentState={currentPlanDate} setCurrentState={setCurrentPlanDate} />
            </Card>

            <ButtonCard title={translation.translate("planning.add")} clickAction={addNewPlan}/>

            <div style={{marginTop:10}}>
                <ContentInWeekCard dataArray={plannings} title={translation.translate("planning.plannings")} noItemMessage={translation.translate("planning.noSavedPlannings")} ItemCard={PlanningCard} selectedDate={selectedPlanningDate} setSelectedDate={setSelectedPlanningDate} isLoading={planningsIsLoading}/>
            </div>
        </div>
    );
}

export default Planning;