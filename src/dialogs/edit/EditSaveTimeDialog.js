import {useDialog} from "use-react-dialog";
import "./EditSaveDialog.css"
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
import DateTimeInput from "../time/TimeInput/DateTimeInput";
import DateTimeContent from "../../cards/DateTime/DateTimeContent";
import DatePicker from "react-multi-date-picker";
import {t} from "../../helper/LanguageTransaltion/Transalation";

const EditSaveTimeDialog = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [startTimeHourState, setStartTimeHourState] = useState("00")
    const [startTimeMinuteState, setStartTimeMinuteState] = useState("00")
    const [startTimeSecondState, setStartTimeSecondState] = useState("00")

    const [workedTimeHourState, setWorkedTimeHourState] = useState("00")
    const [workedTimeMinuteState, setWorkedTimeMinuteState] = useState("00")
    const [workedTimeSecondState, setWorkedTimeSecondState] = useState("00")

    const [breakTimeHourState, setBreakTimeHourState] = useState("00")
    const [breakTimeMinuteState, setBreakTimeMinuteState] = useState("00")
    const [breakTimeSecondState, setBreakTimeSecondState] = useState("00")

    const { closeCurrentDialog, isOpen, openCurrentDialog, data } = useDialog('EditSaveTimeDialog', {save: null});

    const updateSave = () => {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const db = getDatabase(lsWorkingTimesApp)
        const app = initializeApp(LSWalletConfig, "LS-Wallet")
        const auth = getAuth(app)

        set(ref(db, "/users/"+auth.currentUser.uid+"/saved/"+data.save.id), {
            id:data.save.id,
            date:formatDate(selectedDate),
            startTime: new DateTime(startTimeHourState, startTimeMinuteState, startTimeSecondState).toTimeString(),
            worked: new DateTime(workedTimeHourState, workedTimeMinuteState, workedTimeSecondState).toTimeString(),
            break: new DateTime(breakTimeHourState, breakTimeMinuteState, breakTimeSecondState).toTimeString(),
        })

        closeCurrentDialog()
    }

    useEffect(() => {
        const saveDate = getDateFromString(data.save.date)
        setSelectedDate(saveDate)

        const startTimeDateTime = DateTime.dateTimeFromString(data.save.startTime)
        setStartTimeHourState(padTo2Digits(startTimeDateTime.getHours))
        setStartTimeMinuteState(padTo2Digits(startTimeDateTime.getMinutes))
        setStartTimeSecondState(padTo2Digits(startTimeDateTime.getSeconds))

        const workedTimeDateTime = DateTime.dateTimeFromString(data.save.worked)
        setWorkedTimeHourState(padTo2Digits(workedTimeDateTime.getHours))
        setWorkedTimeMinuteState(padTo2Digits(workedTimeDateTime.getMinutes))
        setWorkedTimeSecondState(padTo2Digits(workedTimeDateTime.getSeconds))

        const breakTimeDateTime = DateTime.dateTimeFromString(data.save.break)
        setBreakTimeHourState(padTo2Digits(breakTimeDateTime.getHours))
        setBreakTimeMinuteState(padTo2Digits(breakTimeDateTime.getMinutes))
        setBreakTimeSecondState(padTo2Digits(breakTimeDateTime.getSeconds))
    }, [])

    const DatePickerLayout = (props) => {
        const open = () => {
            props.openCalendar()
        }
        return (
            <div onClick={open}>
                {props.value}
            </div>
        )
    }

    return (
        <Dialog title={t("dialog.changeTime")} dialogContent={
            <div className="editSaveTimeDialog">
                <div className="editSaveTimeDialogDivider"></div>

                <h4>{t("timer.date")}</h4>
                <div className="editSaveTimeDialogDatePicker">
                    <DatePicker
                        portal
                        inputMode="none"
                        editable={false}
                        hideOnScroll
                        value={selectedDate}
                        onChange={(dateObj) => {
                            const date = new Date(dateObj.year, dateObj.month.number-1, dateObj.day)
                            setSelectedDate(date)
                        }}
                        render={<DatePickerLayout/>}
                        format="DD.MM.YYYY"
                        calendarPosition={"bottom-center"}
                        className="custom-picker"
                    />
                </div>

                <h4>{t("timer.startTime")}</h4>
                <DateTimeInput currentHourState={startTimeHourState} setCurrentHourState={setStartTimeHourState}
                               currentMinuteState={startTimeMinuteState} setCurrentMinuteState={setStartTimeMinuteState}
                               currentSecondState={startTimeSecondState} setCurrentSecondState={setStartTimeSecondState}/>

                <h4>{t("timer.workedTime")}</h4>
                <DateTimeInput currentHourState={workedTimeHourState} setCurrentHourState={setWorkedTimeHourState}
                               currentMinuteState={workedTimeMinuteState} setCurrentMinuteState={setWorkedTimeMinuteState}
                               currentSecondState={workedTimeSecondState} setCurrentSecondState={setWorkedTimeSecondState}/>

                <h4>{t("timer.breakTime")}</h4>
                <DateTimeInput currentHourState={breakTimeHourState} setCurrentHourState={setBreakTimeHourState}
                               currentMinuteState={breakTimeMinuteState} setCurrentMinuteState={setBreakTimeMinuteState}
                               currentSecondState={breakTimeSecondState} setCurrentSecondState={setBreakTimeSecondState}/>

                <div className="editSaveTimeDialogDivider"></div>

                <div className="editSaveTimeDialogActionButtons">
                    <ButtonCard className="horizontalButtonCard" title={t("dialog.cancel")} action={closeCurrentDialog}/>
                    <ButtonCard className="horizontalButtonCard" title={t("dialog.confirm")} action={updateSave}/>
                </div>
            </div>
        } />
    );
}

export default EditSaveTimeDialog