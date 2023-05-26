import React, {useEffect, useState} from 'react';
import {
    ItemDialogContent,
    useContextDialog, useContextGlobalVariables,
    useContextTranslation, useContextUserAuth
} from "@LS-Studios/components";
import {get, remove, onChildAdded, onChildChanged, onChildRemoved, ref} from "firebase/database";
import {getFirebaseDB} from "../../firebase/FirebaseHelper";
import TimerCard from "../../cards/timer/TimerCard";
import {CreateEditTimerDialogType} from "../edittimer/CreateEditTimerDialog";

function ChangeTimerDialog({data}) {
    const translation = useContextTranslation()
    const dialog = useContextDialog()
    const auth = useContextUserAuth()
    const globalVariables = useContextGlobalVariables()

    const [timerList, setTimerList] = useState([])
    const [timersAreFetching, setTimersAreFetching] = useState(true)

    const [expandedTimerId, setExpandedTimerId] = useState("")

    const currentTimerId = globalVariables.getLSVar("currentTimerId")

    const sortListByItemName = (array, topCondition) => {
        return array.sort((a, b) => {
            const nameA = a.name.toLowerCase(); // Großschreibung beachten
            const nameB = b.name.toLowerCase();

            if (topCondition && topCondition(a, b)) {
                return 0;
            }

            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
    }

    useEffect(() => {
        const unsubscribeArray = []

        const firebaseDB = getFirebaseDB()

        const timerListRef = ref(firebaseDB, "/users/" + auth.user.id + "/timers/")

        get(timerListRef).then(() => {
            setTimersAreFetching(false)
        })

        unsubscribeArray.push(
            onChildAdded(timerListRef, (data) => {
                setTimerList((current) => {
                        const newTimers = [...current]
                        newTimers.push(data.val())
                        sortListByItemName(newTimers, (a, b) => {
                            return a.id == currentTimerId
                        })
                        return newTimers
                })
            }
        ))

        unsubscribeArray.push(
            onChildChanged(timerListRef, (data) => {
                setTimerList((current) => {
                        const timerChanges = data.val()
                        const newTimers = [...current]
                        const changedTimer = newTimers.find(timer => timer.id === data.val().id)
                        changedTimer.name = timerChanges.name
                        changedTimer.description = timerChanges.description
                        changedTimer.assingee = timerChanges.assingee
                        sortListByItemName(newTimers, (a, b) => {
                            return a.id == currentTimerId
                        })
                        return newTimers
                })
            }
        ))

        unsubscribeArray.push(
            onChildRemoved(timerListRef, (data) => {
                setTimerList((current) => {
                        return current.filter(timer => timer.id !== data.val().id)
                })
            }
        ))

        return () => {
            setTimerList([])
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [])

    const  close = () => {
        dialog.closeTopDialog()
    }

    const selectTimer = (timer) => {
        globalVariables.setLSVar("currentTimerId", timer.id)
        close()
    }

    const createTimer = () => {
        dialog.openDialog("CreateEditTimerDialog", {type: CreateEditTimerDialogType.CREATE})
    }

    const deleteTimer = (timer) => {
        remove(ref(getFirebaseDB(), "/users/" + auth.user.id + "/timers/" + timer.id))
    }

    return (
        <ItemDialogContent title={translation.translate("timer.change-timer")}
                           isLoading={timersAreFetching}
                           items={timerList}
                           placeholder={translation.translate("timer.search-for-timer")}
                           noItemsText={translation.translate("timer.no-timers")}
                           filterItemFunc={(user, current) => {
                               return user.name.toLowerCase().includes(current.toLowerCase())
                           }}
                           itemMapFunc={(timers) => {
                               return timers.map((timer) => {
                                   return <TimerCard key={timer.id}
                                                    timer={timer}
                                                    selectFunc={selectTimer}
                                                    deleteFunc={deleteTimer}
                                                    expandedTimerId={expandedTimerId}
                                                    setExpandedTimerId={setExpandedTimerId}/>
                               })
                           }}
                           options={[{
                               name: translation.translate("dialog.create"),
                               action:createTimer
                           }, {
                               name: translation.translate("dialog.close")
                           }]}
                           closeFunc={close}/>
    );
}

export default ChangeTimerDialog;