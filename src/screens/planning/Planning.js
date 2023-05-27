import React, {useEffect, useState} from 'react';
import {get, onChildAdded, onChildChanged, onChildRemoved, push, ref, set} from "firebase/database";
import PlanningCard from "../../cards/planing/PlanningCard";
import {
    Card,
    DateContent,
    ButtonCard,
    InputContent,
    Divider,
    useContextTranslation,
    useContextUserAuth, useContextGlobalVariables
} from "@LS-Studios/components";
import ContentInWeekCard from "../../cards/contentinweek/ContentInWeekCard";
import {formatDate} from "@LS-Studios/date-helper";
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";

function Planning() {
    const translation = useContextTranslation()
    const auth = useContextUserAuth()
    const globalVariables = useContextGlobalVariables()

    const [currentNewPlanInput, setCurrentNewPlanInput] = useState("");
    const [currentPlanDate, setCurrentPlanDate] = useState(new Date());
    const [plannings, setPlannings] = useState([]);
    const [planningsIsLoading, setPlanningsIsLoading] = useState(true)
    const [selectedPlanningDate, setSelectedPlanningDate] = useState(new Date())

    const currentTimerId = globalVariables.getLSVar("currentTimerId")

    useEffect(() => {
        const unsubscribeArray = []

        const firebaseDB = getFirebaseDB()

        get(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "plannings")).then((snapshot) => {
            if (!snapshot.exists())
                setPlanningsIsLoading(false)
        }).catch((error) => {
            console.error(error);
        });
        unsubscribeArray.push(
            onChildAdded(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "plannings"), snapshot => {
                const value = snapshot.val()
                if (value != null) {
                    setPlanningsIsLoading(false)

                    setPlannings(prevState => (
                        [value].concat(prevState)
                    ))
                }
            }))
        unsubscribeArray.push(
            onChildChanged(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "plannings"), changedSnapshot => {
                const value = changedSnapshot.val()
                if (value != null) {
                    get(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "plannings")).then((snapshot) => {
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
            onChildRemoved(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "plannings"), snapshot => {
                const value = snapshot.val()
                if (value != null) {
                    setPlannings((current) =>
                        current.filter((planning) => planning.id !== value.id)
                    );
                }
            }))

        return () => {
            setPlannings([])
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [currentTimerId])

    const addNewPlan = () => {
        if (currentNewPlanInput.replace("\\s+", "") !== "") {
            const newPlanningRef = push(ref(getFirebaseDB(), getCurrentTimerPath(currentTimerId, auth.user) + "plannings"));

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