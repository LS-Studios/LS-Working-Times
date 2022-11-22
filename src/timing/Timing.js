import React, {useEffect, useRef, useState} from 'react';
import "./Timing.css"
import Timer from "./timer/Timer";
import {TimerClass} from "./timer/TimerClass";
import ClipLoader from "react-spinners/ClipLoader";
import {DateTime} from "./timer/DateTime";

import {
    getDatabase,
    ref,
    onValue,
    set,
    push,
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    get
} from "firebase/database"
import {getAuth, signOut} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import Save from "./save/Save";
import {formatDate, getDateFromString, getDateWithoutTime, getEndOfWeek, getStartOfWeek} from "../helper/Helper";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import ValueCard from "../cards/Value/ValueCard";
import ButtonCard from "../cards/Button/ButtonCard";
import {useDialog} from "use-react-dialog";

function Timing({setCurrentMenu}) {
    const { dialogs, openDialog } = useDialog();

    const navigate = useNavigate()

    const [currentUser, setCurrentUser] = useState(null)

    const [startTimeIsLoading, setStartTimeIsLoading] = useState(true)
    const [savesIsLoading, setSavesIsLoading] = useState(true)

    const [startTime, setStartTime] = useState(null);
    const [saved, setSaved] = useState([]);

    const [selectedSaveDate, setSelectedSaveDate] = useState(new Date())

    const [overallHours, setOverallHours] = useState(0);
    const [overallMinutes, setOverallMinutes] = useState(0);
    const [workSeconds, setWorkSeconds] = useState(0);
    const [workIsRunning, setWorkIsRunning] = useState(false);
    const [workStopTime, setWorkStopTime] = useState(null);
    const [workTakenStop, setWorkTakenStop] = useState(new DateTime(0, 0, 0));

    const workTimer = new TimerClass(
        currentUser, "work",
        overallHours, setOverallHours,
        overallMinutes, setOverallMinutes,
        workSeconds, setWorkSeconds,
        startTime, workStopTime,
        workTakenStop, workIsRunning)

    const [breakHours, setBreakHours] = useState(0);
    const [breakMinutes, setBreakMinutes] = useState(0);
    const [breakSeconds, setBreakSeconds] = useState(0);
    const [breakIsRunning, setBreakIsRunning] = useState(false);
    const [breakStopTime, setBreakStopTime] = useState(new DateTime());
    const [breakTakenStop, setBreakTakenStop] = useState(new DateTime(0, 0, 0));

    const breakTimer = new TimerClass(
        currentUser,"break",
        breakHours, setBreakHours,
        breakMinutes, setBreakMinutes,
        breakSeconds, setBreakSeconds,
        startTime, breakStopTime,
        breakTakenStop, breakIsRunning)

    const resetTimers = () => {
        workTimer.resetTimer()
        breakTimer.resetTimer()

        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        set(ref(db, "/users/" + currentUser.uid + "/start-time"), "")

        const newSaveRef = push(ref(db, "/users/" + currentUser.uid + "/saved"));

        set(newSaveRef, {
            id:newSaveRef.key,
            date:formatDate(startTime),
            startTime: startTime.toLocaleTimeString("de"),
            worked: new DateTime(overallHours, overallMinutes, workSeconds).toTimeString(),
            break: new DateTime(breakHours, breakMinutes, breakSeconds).toTimeString()
        });
    }

    const setTimerOnStartUp = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const setStartTime = () => {
            const newDate = new Date()
            set(ref(db, "/users/" + currentUser.uid + "/start-time"), newDate.toLocaleTimeString("de"))
        }

        const setStopTime = (type) => {
            const newDateTime = new DateTime()

            if (startTime == null)
                set(ref(db, "/users/" + currentUser.uid + "/" + type + "-stop-time"), newDateTime.toTimeString())
            else
                set(ref(db, "/users/" + currentUser.uid + "/" + type + "-stop-time"), startTime.toLocaleTimeString("de"))
        }

        if (startTime == null) {
            setStartTime()
        }

        if (workStopTime == null) {
            setStopTime("work")
        }

        if (breakStopTime == null) {
            setStopTime("break")
        }
    }

    const toggleOverallTimer = () => {
        setTimerOnStartUp()

        if (workIsRunning) {
            workTimer.stopTimer()
        } else {
            workTimer.startTimer()

            if (breakIsRunning)
                breakTimer.stopTimer()
        }
    }

    const toggleBreakTimer = () => {
        setTimerOnStartUp()

        if (breakIsRunning) {
            breakTimer.stopTimer()
        } else {
            breakTimer.startTimer()

            if (workIsRunning)
                workTimer.stopTimer()
        }
    }

    const getWorkedTimeInCurrentWeek = () => {
        const savesThisWeek = saved.filter(save => {
            const saveDate = getDateFromString(save.date)
            return saveDate >= getStartOfWeek(selectedSaveDate) && saveDate <= getEndOfWeek(selectedSaveDate)
        })

        const workedThisWeek = new DateTime(0, 0, 0)

        savesThisWeek.forEach(save => {
            workedThisWeek.addDateTime(DateTime.dateTimeFromString(save.worked))
        })

        if (getDateWithoutTime(selectedSaveDate) >= getStartOfWeek(new Date()) && getDateWithoutTime(selectedSaveDate) <= getEndOfWeek(new Date())) {
            workedThisWeek.addDateTime(new DateTime(workTimer.getHours, workTimer.getMinutes, workTimer.getSeconds))
        }

        return workedThisWeek.toTimeString()
    }

    function useInterval(callback, delay) {
        const intervalRef = React.useRef();
        const callbackRef = React.useRef(callback);

        // Remember the latest callback:
        //
        // Without this, if you change the callback, when setInterval ticks again, it
        // will still call your old callback.
        //
        // If you add `callback` to useEffect's deps, it will work fine but the
        // interval will be reset.

        React.useEffect(() => {
            callbackRef.current = callback;
        }, [callback]);

        // Set up the interval:

        React.useEffect(() => {
            if (typeof delay === 'number') {
                intervalRef.current = setInterval(() => callbackRef.current(), delay);

                // Clear interval if the components is unmounted or the delay changes:
                return () => clearInterval(intervalRef.current);
            }
        }, [delay]);

        // Returns a ref to the interval ID in case you want to clear it manually:
        return intervalRef;
    }

    useInterval(() => {
        if (startTime != null) {
            workTimer.setByTimeDiff(false)
            breakTimer.setByTimeDiff(false)
        }

        if (workIsRunning) {
            workTimer.setByTimeDiff()
        }
        if (breakIsRunning) {
            breakTimer.setByTimeDiff()
        }
    }, 1000);

    useEffect(() => {
        setCurrentMenu(1)

        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const db = getDatabase(lsWorkingTimesApp)
        const auth = getAuth(lsWalletApp)

        const unsubscribeArray = []

        unsubscribeArray.push(
            auth.onAuthStateChanged(function(user) {
                if (user == null) {
                    unsubscribeArray.forEach(unsubscribe => unsubscribe())
                    navigate("/login")
                    return
                }

                setCurrentUser(user)

                set(ref(db, "/users/"+user.uid+"/email"), user.email)

                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/start-time"), snapshot => {
                        const data = snapshot.val()

                        setStartTimeIsLoading(false)

                        if (data == null || data === "") {
                            setStartTime(null)
                            workTimer.resetTimer()
                            breakTimer.resetTimer()
                        }
                        else
                            setStartTime(DateTime.dateTimeFromString(data).getDate())
                }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/work-stop-time"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setWorkStopTime(null)
                        else
                            setWorkStopTime(DateTime.dateTimeFromString(data))
                }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/work-taken-stop"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setWorkTakenStop(new DateTime(0,0,0))
                        else
                            setWorkTakenStop(DateTime.dateTimeFromString(data))
                }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/break-stop-time"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setBreakStopTime(null)
                        else
                            setBreakStopTime(DateTime.dateTimeFromString(data))
                }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/break-taken-stop"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setBreakTakenStop(new DateTime(0,0,0))
                        else
                            setBreakTakenStop(DateTime.dateTimeFromString(data))
                }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/work-is-running"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setWorkIsRunning(false)
                        else
                            setWorkIsRunning(data)
                }))
                unsubscribeArray.push(
                    onValue(ref(db, "/users/" + user.uid + "/break-is-running"), snapshot => {
                        const data = snapshot.val()

                        if (data == null || data === "")
                            setBreakIsRunning(false)
                        else
                            setBreakIsRunning(data)
                }))
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
                    onChildChanged(ref(db, "/users/" + user.uid + "/saved"), changedSnapshot => {
                        const value = changedSnapshot.val()
                        if (value != null) {
                            get(ref(db, "/users/" + user.uid + "/saved")).then((snapshot) => {
                                if (snapshot.exists()) {
                                    const saves = []
                                    snapshot.forEach(childSnapshot => {
                                        saves.push(childSnapshot.val())
                                    })

                                    const newState = saves.map(obj => {
                                        if (obj.id === value.id) {
                                            return value;
                                        }

                                        return obj;
                                    });

                                    setSaved(newState);
                                } else {
                                    console.log("No data available");
                                }
                            }).catch((error) => {
                                console.error(error);
                            });
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
    }, [])

    const loadingSpinner = <ClipLoader
        color="#CCCCCC"
        size={15}
        speedMultiplier={0.8}
    />

    return (
        <div className="timing">
            <div className="timingTimers">
                <ValueCard title="Date" value={startTimeIsLoading ? loadingSpinner : (startTime != null ? formatDate(startTime) : "Not started")}/>
                <ValueCard title="Start time" value={startTimeIsLoading ? loadingSpinner : (startTime != null ? startTime.toLocaleTimeString("de") : "Not started")} onClick={() => {
                    if (startTime != null) {
                        openDialog("ChangeTimeDialog", {
                            value: DateTime.dateTimeFromDate(startTime).toTimeString(),
                            type: "start-time"
                        })
                    }
                }} clickable={startTime != null}/>
            </div>

            <div className="timingTimers">
                <Timer name="Worked" timer={workTimer} isLoading={startTimeIsLoading}/>
                <Timer name="Break" timer={breakTimer} clickable={startTime != null} isLoading={startTimeIsLoading} onClick={() => {
                    if (startTime != null) {
                        openDialog("ChangeTimeDialog", {
                            value: new DateTime(breakHours, breakMinutes, breakSeconds).toTimeString(),
                            type: "break-time"
                        })
                    }
                }}/>
            </div>

            <div className="timingButtons">
                <ButtonCard className={startTimeIsLoading ? "disabled" : null} title={workTimer.getIsRunning ? "Stop working" : "Start working"} action={toggleOverallTimer}/>
                <ButtonCard className={startTimeIsLoading ? "disabled" : null} title={breakTimer.getIsRunning ? "Stop break" : "Start break"} action={toggleBreakTimer}/>
                <ButtonCard className={startTimeIsLoading ? "disabled" : (startTime != null ? "buttonCard" : "disabled")} title="Reset and save" action={startTime != null ? resetTimers : function (){}}/>
                <ValueCard className={startTimeIsLoading ? "disabled" : "singleLineValueCard"} title="Worked time this week" value={startTimeIsLoading ? loadingSpinner : getWorkedTimeInCurrentWeek()}/>
            </div>

            <Save saved={saved} selectedSaveDate={selectedSaveDate} setSelectedSaveDate={setSelectedSaveDate} isLoading={savesIsLoading}/>
        </div>
    );
}

export default Timing;