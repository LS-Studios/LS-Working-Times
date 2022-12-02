import React, {useEffect, useState} from 'react';
import "./Prognosis.css"
import InputCard from "../cards/Input/InputCard";
import Card from "../cards/Card";
import ToggleContent from "../cards/ToggleInput/ToggleContent";
import DateTimeInput from "../cards/timeinput/DateTimeInput";
import {getThemeClass, setTheme} from "../helper/Theme/Theme";
import CheckboxCard from "../cards/Checkbox/CheckboxCard";
import {getLanguage, setLanguage, t} from "../helper/LanguageTransaltion/Transalation";
import WorkingDayCard from "./workingday/WorkingDayCard";
import {get, getDatabase, ref} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";

function Prognosis({setCurrentMenu}) {
    const [hoursPerWeekInput, setHoursPerWeekInput] = useState("40")
    const [alreadyWorkedState, setAlreadyWorkedState] = useState(0)
    const [alreadyWorkedTime, setAlreadyWorkedTime] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00"
    })

    const [earliestStartTime, setEarliestStartTime] = useState({
        hours: "08",
        minutes: "00",
        seconds: "00"
    })
    const [latestEndTime, setLatestEndTime] = useState({
        hours: "18",
        minutes: "00",
        seconds: "00"
    })

    const [workingDays, setWorkingDays] = useState([
        {day: t("prognosis.monday"), selected: true},
        {day: t("prognosis.tuesday"), selected: true},
        {day: t("prognosis.wednesday"), selected: true},
        {day: t("prognosis.thursday"), selected: true},
        {day: t("prognosis.friday"), selected: true},
        {day: t("prognosis.saturday"), selected: false},
        {day: t("prognosis.sunday"), selected: false},
    ])

    const fillEmptyTimeField = (currentState, setCurrentState) => {
        if (currentState == "") {
            setCurrentState("0")
        }
    }

    useEffect(() => {
        setCurrentMenu(2)

        // const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        // const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        // const db = getDatabase(lsWorkingTimesApp)
        // const auth = getAuth(lsWalletApp)
        //
        // const unsubscribeArray = []
        //
        // unsubscribeArray.push(
        //     auth.onAuthStateChanged(function(user) {
        //         get(ref(db, "/users/" + user.uid + "/language")).then((snapshot) => {
        //             if (snapshot.exists()) {
        //                 setLanguage(snapshot.val())
        //             } else {
        //                 console.log("No data available");
        //             }
        //         }).catch((error) => {
        //             console.error(error);
        //         });
        //
        //         get(ref(db, "/users/" + user.uid + "/theme")).then((snapshot) => {
        //             if (snapshot.exists()) {
        //                 setTheme(snapshot.val())
        //                 document.body.classList.forEach((v, k, p) => {
        //                     document.body.classList.remove(v)
        //                 })
        //                 document.body.classList.add(getThemeClass("body"))
        //             } else {
        //                 console.log("No data available");
        //             }
        //         }).catch((error) => {
        //             console.error(error);
        //         });
        //     })
        // )
    }, [])

    return (
        <div className="prognosis">
            <InputCard title={t("prognosis.hoursPerWeek")} charType={1}  focusOnClick={true} blurFunction={() => fillEmptyTimeField(hoursPerWeekInput, setHoursPerWeekInput)} currentState={hoursPerWeekInput} setCurrentState={setHoursPerWeekInput}/>
            <Card cardContent={
                <div>
                    <ToggleContent title={t("prognosis.alreadyWorked")} currentState={alreadyWorkedState} setCurrentState={setAlreadyWorkedState} toggleList={[t("prognosis.current"), t("prognosis.custom")]}/>
                    <div className={getThemeClass("divider")}/>
                    <div className="prognosisAlreadyWorkedToggle">
                        {
                            alreadyWorkedState == 0 ? <div>16:02:22</div> : <DateTimeInput currentTimeState={alreadyWorkedTime} setCurrentTimeState={setAlreadyWorkedTime}/>
                        }
                    </div>
                </div>
            }/>
            <CheckboxCard title={t("prognosis.workingDays")} currentState={workingDays} setCurrentState={setWorkingDays}/>
            <div>
                {
                    workingDays.map((workingDay, i) => {
                        if (i) {
                            switch (i) {
                                case 0:
                                    return <WorkingDayCard day={{name: t("prognosis.monday")}}/>
                                case 1:
                                    return <WorkingDayCard day={{name: t("prognosis.tuesday")}}/>
                                case 2:
                                    return <WorkingDayCard day={{name: t("prognosis.wednesday")}}/>
                                case 3:
                                    return <WorkingDayCard day={{name: t("prognosis.thursday")}}/>
                                case 4:
                                    return <WorkingDayCard day={{name: t("prognosis.friday")}}/>
                                case 5:
                                    return <WorkingDayCard day={{name: t("prognosis.saturday")}}/>
                                case 6:
                                    return <WorkingDayCard day={{name: t("prognosis.sunday")}}/>
                            }
                        }
                    })
                }
            </div>
        </div>
    );
}

export default Prognosis;