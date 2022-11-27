import {useDialog} from "use-react-dialog";
import "./EditSaveDialog.scss"
import ButtonCard from "../../cards/Button/ButtonCard";
import React, {useEffect, useRef, useState} from "react";
import {getDatabase, ref, set, get} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
import {LSWalletConfig} from "../../firebase/LSWalletConfig";
import {getAuth} from "firebase/auth";
import Dialog from "../Dialog";
import {formatDate, getDateFromString, padTo2Digits} from "../../helper/Helper";
import {DateTime} from "../../timing/timer/DateTime";
import DateTimeInput from "../../cards/timeinput/DateTimeInput";
import DatePicker from "react-multi-date-picker";
import {t} from "../../helper/LanguageTransaltion/Transalation";
import {getThemeClass} from "../../helper/Theme/Theme";

const EditSaveTimeDialog = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [startTimeState, setStartTimeState] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00"
    })

    const [workedTimeState, setWorkedTimeState] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00"
    })

    const [breakTimeState, setBreakTimeState] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00"
    })

    const { closeCurrentDialog, isOpen, openCurrentDialog, data } = useDialog('EditSaveTimeDialog', {save: null});

    const close = () => {
        document.body.style.overflow = "visible"
        closeCurrentDialog()
    }

    const updateSave = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        set(ref(db, "/users/"+auth.currentUser.uid+"/saved/"+data.save.id), {
            id:data.save.id,
            date:formatDate(selectedDate),
            startTime: new DateTime(startTimeState.hours, startTimeState.minutes, startTimeState.seconds).toTimeString(),
            worked: new DateTime(workedTimeState.hours, workedTimeState.minutes, workedTimeState.seconds).toTimeString(),
            break: new DateTime(breakTimeState.hours, breakTimeState.minutes, breakTimeState.seconds).toTimeString(),
        })

        close()
    }

    useEffect(() => {
        const saveDate = getDateFromString(data.save.date)
        setSelectedDate(saveDate)

        const startTimeDateTime = DateTime.dateTimeFromString(data.save.startTime)
        setStartTimeState({...startTimeState, hours: padTo2Digits(startTimeDateTime.getHours),
            minutes: padTo2Digits(startTimeDateTime.getMinutes),
            seconds: padTo2Digits(startTimeDateTime.getSeconds)})

        const workedTimeDateTime = DateTime.dateTimeFromString(data.save.worked)
        setWorkedTimeState({...workedTimeState, hours: padTo2Digits(workedTimeDateTime.getHours),
            minutes: padTo2Digits(workedTimeDateTime.getMinutes),
            seconds: padTo2Digits(workedTimeDateTime.getSeconds)})

        const breakTimeDateTime = DateTime.dateTimeFromString(data.save.break)
        setBreakTimeState({...breakTimeState, hours: padTo2Digits(breakTimeDateTime.getHours),
            minutes: padTo2Digits(breakTimeDateTime.getMinutes),
            seconds: padTo2Digits(breakTimeDateTime.getSeconds)})
    }, [])

    const DatePickerLayout = (props) => {
        const open = () => {
            props.openCalendar()
        }
        return (
            <div style={{width: 250}} onClick={open}>
                {props.value}
            </div>
        )
    }

    return (
        <Dialog title={t("dialog.changeTime")} dialogContent={
            <div className="editSaveTimeDialog">
                <div className={getThemeClass("editSaveTimeDialogDivider")}></div>

                <h4>{t("timer.date")}</h4>
                <div className={getThemeClass("editSaveTimeDialogDatePicker")}>
                    <DatePicker
                        portal
                        inputMode="none"
                        editable={false}
                        value={selectedDate}
                        onChange={(dateObj) => {
                            const date = new Date(dateObj.year, dateObj.month.number-1, dateObj.day)
                            setSelectedDate(date)
                        }}
                        render={<DatePickerLayout/>}
                        format="DD.MM.YYYY"
                        calendarPosition={"bottom-center"}
                        className={getThemeClass("customPicker")}
                    />
                </div>

                <h4>{t("timer.startTime")}</h4>
                <DateTimeInput currentTimeState={startTimeState} setCurrentTimeState={setStartTimeState}/>

                <h4>{t("timer.workedTime")}</h4>
                <DateTimeInput currentTimeState={workedTimeState} setCurrentTimeState={setWorkedTimeState}/>

                <h4>{t("timer.breakTime")}</h4>
                <DateTimeInput currentTimeState={breakTimeState} setCurrentTimeState={setBreakTimeState}/>

                <div className={getThemeClass("editSaveTimeDialogDivider")}></div>

                <div className="editSaveTimeDialogActionButtons">
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.cancel")} action={close}/>
                    <ButtonCard className={getThemeClass("horizontalButtonCard")} title={t("dialog.confirm")} action={updateSave}/>
                </div>
            </div>
        } />
    );
}

export default EditSaveTimeDialog