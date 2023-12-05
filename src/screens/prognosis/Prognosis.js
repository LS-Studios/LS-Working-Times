import React, {useEffect, useState} from 'react';
import {get, onChildAdded, onChildChanged, onChildRemoved, onValue, ref} from "firebase/database";
import {DateTime} from "../../classes/DateTime";
import {useInterval} from "../../customhook/UseInterval";
import PrognosisCard from "../../cards/prognosis/PrognosisCard";
import {
    Spinner,
    Card,
    InputCard,
    TimeInputContent,
    TimeInputCard,
    CheckboxListCard,
    Divider,
    DropdownContent,
    useContextTranslation,
    useContextUserAuth,
    SpinnerType, ListCard, useContextGlobalVariables, DateContent
} from "@LS-Studios/components"
import {
    getDateFromString,
    getDateWithoutTime,
    getEndOfWeek,
    getStartOfWeek,
    getStartOfWeekDayValue
} from "@LS-Studios/date-helper"
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";
import {Gone} from "@LS-Studios/general";
import useLocalStorage from "@LS-Studios/use-local-storage";
import WorkingDay from "../../components/workingday/WorkingDay";
import {TimerType} from "../../components/timer/TimerProvider";
import useTimerStates from "../../customhook/useTimerStates";
import {IoCaretBack, IoCaretForward} from "react-icons/io5";
import WeekSelectComponent from "../../components/weekselect/WeekSelectComponent";

function Prognosis() {
    const translation = useContextTranslation()
    const auth = useContextUserAuth()
    const globalVariables = useContextGlobalVariables()

    const [saved, setSaved] = useState([]);

    const { startTime, setStartTime } = useTimerStates()
    const { timeIsRunning, setTimeIsRunning } = useTimerStates()
    const { timeStopTime, setTimeStopTime } = useTimerStates()
    const { timeTakenStop, setTimeTakenStop } = useTimerStates()

    const [selectedDate, setSelectedDate] = useState(new Date())

    const [hoursPerWeekInput, setHoursPerWeekInput] = useLocalStorage("hoursPerWeekInput", "40")
    const [alreadyWorkedState, setAlreadyWorkedState] = useLocalStorage("alreadyWorkedState", null)
    const [alreadyWorkedTimerTime, setAlreadyWorkedTimerTime] = useState(new DateTime())
    const [alreadyWorkedTimeInput, setAlreadyWorkedTimeInput] = useLocalStorage("alreadyWorkedTimeInput", {
        hours: "00",
        minutes: "00",
        seconds: "00"
    })
    const [alreadyWorkedTimeIsLoading, setAlreadyWorkedTimeIsLoading] = useState([true, false])
    const [calculatedState, setCalculatedState] = useState([]);

    const [averageStartTime, setAverageStartTime] = useLocalStorage("averageStartTime", {
        hours: "08",
        minutes: "00",
        seconds: "00"
    })

    const [averageBreakTime, setAverageBreakTime] = useLocalStorage("averageBreakTime", {
        hours: "00",
        minutes: "30",
        seconds: "00"
    })

    const [workingDays, setWorkingDays] = useLocalStorage("workingDays", [
        //Monday
        [true, 0, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
        //Tuesday
        [true, 1, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
        //Wednesday
        [true, 2, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
        //Thursday
        [true, 3, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
        //Friday
        [true, 4, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
        //Saturday
        [false, 5, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
        //Sunday
        [false, 6, [[new DateTime(8,0,0), new DateTime(18,0,0)]], 0],
    ])

    const currentTimerId = globalVariables.getLSVar("currentTimerId")

    useEffect(() => {
        const unsubscribeArray = []

        const firebaseDB = getFirebaseDB()

        unsubscribeArray.push(
            onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + TimerType.Work + "-start-time"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "") {
                    setStartTime(null)
                }
                else
                    setStartTime(DateTime.dateTimeFromString(data))
            }))
        unsubscribeArray.push(
            onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + TimerType.Work + "-is-running"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "") {
                    setTimeIsRunning(false)
                }
                else
                    setTimeIsRunning(data)
            }))
        unsubscribeArray.push(
            onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + TimerType.Work + "-stop-time"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setTimeStopTime(null)
                else
                    setTimeStopTime(DateTime.dateTimeFromString(data))
            }))
        unsubscribeArray.push(
            onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + TimerType.Work + "-taken-stop"), snapshot => {
                const data = snapshot.val()

                if (data == null || data === "")
                    setTimeTakenStop(new DateTime(0,0,0))
                else
                    setTimeTakenStop(DateTime.dateTimeFromString(data))
            }))

        get(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved")).then(() => {
            setAlreadyWorkedTimeIsLoading([true, true])
        })

        unsubscribeArray.push(
            onChildAdded(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved"), snapshot => {
                const value = snapshot.val()

                if (value != null) {
                    setSaved(prevState => (
                        [value].concat(prevState)
                    ))
                }
            }))
        unsubscribeArray.push(
            onChildChanged(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved"), snapshot => {
                const changedPrognosis = snapshot.val()

                setSaved((current) => {
                    return current.map(obj => {
                        if (obj.id === changedPrognosis.id) {
                            return changedPrognosis;
                        }

                        return obj;
                    })
                });
            }))
        unsubscribeArray.push(
            onChildRemoved(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "saved"), snapshot => {
                const value = snapshot.val()
                if (value != null) {
                    setSaved((current) =>
                        current.filter((save) => save.id !== value.id)
                    );
                }
            }))

        return () => {
            setSaved([])
            setCalculatedState([])
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [currentTimerId])

    useInterval(() => {
        if (alreadyWorkedTimeIsLoading[1])
            setAlreadyWorkedTimeIsLoading([false, false])

        getWorkedTimeInCurrentWeek()

        calculatePrognosis()
    }, 1000);

    const isSelectedDateInThisWeek = () => {
        const thisWeekEnd = getEndOfWeek(new Date())
        return selectedDate.toDateString() === thisWeekEnd.toDateString()
    }

    const getWorkedTimeInCurrentWeek = () => {
        const savesThisWeek = saved.filter(save => {
            const saveDate = getDateFromString(save.date)
            return saveDate >= getStartOfWeek(new Date()) && saveDate <= getEndOfWeek(new Date())
        })

        let workedThisWeek = new DateTime()

        savesThisWeek.forEach(save => {
            workedThisWeek = workedThisWeek.addDateTime(DateTime.dateTimeFromString(save.worked))
        })

        if (timeStopTime != null) {
            const workedToday = (timeIsRunning ? DateTime.currentTime() : timeStopTime).getDateDiffToDateTime(startTime, timeTakenStop)

            workedThisWeek = workedThisWeek.addDateTime(workedToday)
        }

        setAlreadyWorkedTimerTime(isSelectedDateInThisWeek() ? workedThisWeek : new DateTime())
    }

    const checkIfIsStillInWeek = (dayIndex) => {
        if (isSelectedDateInThisWeek()) {
            const currentDay = new Date().getDay()

            const startTimeDateTime = new DateTime(averageStartTime.hours, averageStartTime.minutes, averageStartTime.seconds)
            const startTimeDiff = startTimeDateTime.subtractDateTime(new DateTime())
            const alreadyAfterStartTime = (startTimeDiff.hours < 0 || startTimeDiff.minutes < 0 || startTimeDiff.seconds < 0)

            const isCurrentDay = !alreadyAfterStartTime || (alreadyAfterStartTime && startTime != null)

            return (dayIndex > currentDay - 1 || (dayIndex === currentDay - 1 && isCurrentDay))
        } else {
            return true
        }
    }

    const calculatePrognosis = () => {
        const calculation = []

        const workedToday = startTime ? (timeIsRunning ? DateTime.currentTime() : timeStopTime).getDateDiffToDateTime(startTime, timeTakenStop) : new DateTime()

        const alreadyWorked = isSelectedDateInThisWeek() ? alreadyWorkedState.pos === 1 ? new DateTime(
            parseInt(alreadyWorkedTimeInput.hours),
            parseInt(alreadyWorkedTimeInput.minutes),
            parseInt(alreadyWorkedTimeInput.seconds)
        ) : (alreadyWorkedTimerTime.subtractDateTime(workedToday)) : new DateTime()

        let timeLeftToWork = new DateTime(parseInt(hoursPerWeekInput),0,0).subtractDateTime(alreadyWorked)

        if (timeLeftToWork.hours < 0 || timeLeftToWork.minutes < 0 || timeLeftToWork.seconds < 0) {
            setCalculatedState([])
            return
        }

        workingDays.forEach((workingDay, i) => {
            if (workingDay[0] && checkIfIsStillInWeek(i) && workingDay[3] === 1) {
                const rangeWorkingCalculation = []

                let workingTimeInRanges = new DateTime(0,0,0)

                workingDay[2].forEach(workingDayRange => {
                    const rangeStartTime = new DateTime(workingDayRange[0].hours, workingDayRange[0].minutes, workingDayRange[0].seconds)
                    const rangeEndTime = new DateTime(workingDayRange[1].hours, workingDayRange[1].minutes, workingDayRange[1].seconds)
                    const rangeWorkingTime = rangeEndTime.subtractDateTime(rangeStartTime)
                    timeLeftToWork = timeLeftToWork.subtractDateTime(rangeWorkingTime)
                    workingTimeInRanges = workingTimeInRanges.addDateTime(rangeWorkingTime)

                    rangeWorkingCalculation.push([rangeStartTime.toTimeString(), rangeEndTime.toTimeString()])
                })

                const breakTime = new DateTime(averageBreakTime.hours, averageBreakTime.minutes, averageBreakTime.seconds)

                if (workingTimeInRanges.hours >= 0 && workingTimeInRanges.minutes >= 0 && workingTimeInRanges.seconds >= 0) {
                    calculation.push([i, true, rangeWorkingCalculation, workingTimeInRanges.toTimeString(), breakTime.toTimeString()])
                }
            }
        })

        let undefinedDays = 0;

        workingDays.forEach((workingDay, i) => {
            if (workingDay[0] && checkIfIsStillInWeek(i) && workingDay[3] === 0) undefinedDays++
        })

        const timeToWorkOnUndefinedDays = timeLeftToWork.divideDateTime(new DateTime(undefinedDays, undefinedDays, undefinedDays))

        workingDays.forEach((workingDay, i) => {
            if (workingDay[0] && checkIfIsStillInWeek(i) && workingDay[3] === 0) {
                const startTime = new DateTime(averageStartTime.hours, averageStartTime.minutes, averageStartTime.seconds)
                const breakTime = new DateTime(averageBreakTime.hours, averageBreakTime.minutes, averageBreakTime.seconds)
                const workTime = timeToWorkOnUndefinedDays
                const endTime = startTime.addDateTime(workTime).addDateTime(breakTime)

                if (workTime.hours < 0 || workTime.minutes < 0 || workTime.seconds < 0) {
                    calculation.push([i, false, "00:00:00",
                        "00:00:00", "No more work", "No more work"])
                } else {
                    calculation.push([i, false, workTime.toTimeString(),
                        breakTime.toTimeString(), startTime.toTimeString(), endTime.toTimeString()])
                }
            }
        })

        setCalculatedState(calculation)
    }

    return (
        <div>
            <Card title="Week">
                <WeekSelectComponent justFuture={true} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </Card>

            <ListCard title={translation.translate("prognosis.menu-name")}
                         isLoading={alreadyWorkedTimeIsLoading[0]}
                         items={calculatedState}
                         noItemsText={translation.translate("prognosis.noMoreWorkThisWeek")}
                         itemMapFunc={calculatedState.sort((a,b) => {
                             return a[0]-b[0] }
                         ).map((calculated, i) => {
                             return <PrognosisCard key={i} data={calculated} isExpanded={false} />
                         })}/>

            <InputCard title={translation.translate("prognosis.hoursPerWeek")} inputType={1} focusOnClick={true} currentState={hoursPerWeekInput} setCurrentState={setHoursPerWeekInput}/>

            <Card title={translation.translate("prognosis.alreadyWorked")}>
                <DropdownContent style={{padding:5, width: 251}} items={[translation.translate("prognosis.current"), translation.translate("prognosis.custom")]} currentState={alreadyWorkedState} setCurrentState={setAlreadyWorkedState}/>

                <Divider />

                <Gone isVisible={alreadyWorkedState && alreadyWorkedState.pos === 0}>
                    {
                        alreadyWorkedTimeIsLoading[0] ?
                            <div style={{display: "flex", justifyContent:"center"}}>
                                <Spinner type={SpinnerType.dots} />
                            </div> : <div style={{margin: 5}}>
                                {alreadyWorkedTimerTime.toTimeString()}
                            </div>
                    }
                </Gone>

                <Gone isGone={alreadyWorkedState && alreadyWorkedState.pos === 0}>
                    <TimeInputContent
                        currentTimeState={alreadyWorkedTimeInput}
                        setCurrentTimeState={setAlreadyWorkedTimeInput}
                        maxHourValue={null}/>
                </Gone>
            </Card>

            <TimeInputCard title={translation.translate("prognosis.averageStartTime")} currentTimeState={averageStartTime} setCurrentTimeState={setAverageStartTime} />
            <TimeInputCard title={translation.translate("prognosis.averageBreakTime")} currentTimeState={averageBreakTime} setCurrentTimeState={setAverageBreakTime} />

            <CheckboxListCard title={translation.translate("prognosis.workingDays")} checkboxList={workingDays.map((_, i) => translation.translate("prognosis.weekDay"+i))}
                currentState={workingDays.map(workingDay => workingDay[0])}
                setCurrentState={
                      (newStateArray) => {
                          setWorkingDays(current => {
                              const newWorkingDays = JSON.parse(JSON.stringify(current))
                              newWorkingDays.map((newWorkingDay, i) => {
                                  newStateArray.forEach((newState, s) => {
                                      if (i === s) {
                                          newWorkingDays[i][0] = newState
                                      }
                                  })
                              })

                              return newWorkingDays
                           })
                      }
                }
            />
            {
                workingDays.map((workingDay, i) => {
                    if (workingDay[0] && checkIfIsStillInWeek(i)) {
                        return <WorkingDay key={i} day={workingDay} workingDays={workingDays} setWorkingDays={setWorkingDays}/>
                    }
                })
            }
        </div>
    );
}

export default Prognosis;