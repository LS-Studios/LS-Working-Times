import {DateTime} from "./DateTime";
import {getDatabase, ref, set} from "firebase/database";
import {initializeApp} from "firebase/app";
import {LSWorkingTimesConfig} from "../../firebase/LSWorkingTimesConfig";
export class TimerClass {

    constructor(
        currentUser, timerType,
        hours, setHours,
        minutes, setMinutes,
        seconds, setSeconds,
        startTime, stopTime,
        takenStop, isRunning) {
        this.timerType = timerType
        this.hours = hours
        this.setHours = setHours
        this.minutes = minutes
        this.setMinutes = setMinutes
        this.seconds = seconds
        this.setSeconds = setSeconds
        this.startTime = startTime
        this.stopTime = stopTime
        this.takenStop = takenStop
        this.isRunning = isRunning
        this.userId = currentUser != null ? currentUser.uid : ""

        this.setByTimeDiff = this.setByTimeDiff.bind(this)
        this.startTimer = this.startTimer.bind(this)
        this.stopTimer = this.stopTimer.bind(this)
        this.resetTimer = this.resetTimer.bind(this)
    }

    setByTimeDiff(takeCurrent = true) {
        const dateTimeDiff = (takeCurrent ? new DateTime() : this.stopTime).getDateDiffToDateTime(DateTime.dateTimeFromDate(this.startTime), this.takenStop)

        this.setHours(dateTimeDiff.getHours)
        this.setMinutes(dateTimeDiff.getMinutes)
        this.setSeconds(dateTimeDiff.getSeconds)
    };

    startTimer() {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        set(ref(getDatabase(lsWorkingTimesApp), "/users/" + this.userId + "/" + this.timerType + "-is-running"), true)
        const newStopTime = this.takenStop.addDateTime(new DateTime().getDateDiffToDateTime(this.stopTime))
        set(ref(getDatabase(lsWorkingTimesApp), "/users/" + this.userId + "/" + this.timerType + "-taken-stop"), newStopTime.toTimeString())
    };

    stopTimer() {
        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        set(ref(getDatabase(lsWorkingTimesApp), "/users/" + this.userId + "/" + this.timerType + "-is-running"), false)
        set(ref(getDatabase(lsWorkingTimesApp), "/users/" + this.userId + "/" + this.timerType + "-stop-time"), new DateTime().toTimeString())
    }

    resetTimer() {
        this.stopTimer()
        this.setHours(0)
        this.setMinutes(0)
        this.setSeconds(0)

        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")

        set(ref(getDatabase(lsWorkingTimesApp), "/users/" + this.userId + "/" + this.timerType + "-is-running"), false)
        set(ref(getDatabase(lsWorkingTimesApp), "/users/" + this.userId + "/" + this.timerType + "-stop-time"), "")
        set(ref(getDatabase(lsWorkingTimesApp), "/users/" + this.userId + "/" + this.timerType + "-taken-stop"), "00:00:00")
    }

    get getHours() {
        return this.hours
    }

    get getMinutes() {
        return this.minutes
    }

    get getSeconds() {
        return this.seconds
    }

    get getIsRunning() {
        return this.isRunning
    }
}