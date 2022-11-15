import {DateTime} from "./DateTime";
import {getDatabase, ref, set} from "firebase/database";
import {getAuth} from "firebase/auth";

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
        const dateTimeDiff = (takeCurrent ? new DateTime() : this.stopTime).getDiffToDateTime(DateTime.dateTimeFromDate(this.startTime), this.takenStop)

        this.setHours(dateTimeDiff.getHours)
        this.setMinutes(dateTimeDiff.getMinutes)
        this.setSeconds(dateTimeDiff.getSeconds)
    };

    startTimer() {
        const setStartTime = () => {
            const newDate = new Date()
            this.startTime = newDate
            set(ref(getDatabase(), "/users/" + this.userId + "/start-time"), newDate.toLocaleTimeString("de"))
        }

        const setStopTime = () => {
            const newDateTime = new DateTime()
            this.stopTime = newDateTime

            if (this.startTime == null)
                set(ref(getDatabase(), "/users/" + this.userId + "/" + this.timerType + "-stop-time"), newDateTime.toTimeString())
            else
                set(ref(getDatabase(), "/users/" + this.userId + "/" + this.timerType + "-stop-time"), this.startTime.toLocaleTimeString("de"))
        }

        if (this.startTime == null) {
            setStartTime()
            setStopTime()
        } else if (this.stopTime == null) {
            setStopTime()
        }

        set(ref(getDatabase(), "/users/" + this.userId + "/" + this.timerType + "-is-running"), true)
        const newStopTime = this.takenStop.addDateTime(new DateTime().getDiffToDateTime(this.stopTime))
        set(ref(getDatabase(), "/users/" + this.userId + "/" + this.timerType + "-taken-stop"), newStopTime.toTimeString())
    };

    stopTimer() {
        set(ref(getDatabase(), "/users/" + this.userId + "/" + this.timerType + "-is-running"), false)
        set(ref(getDatabase(), "/users/" + this.userId + "/" + this.timerType + "-stop-time"), new DateTime().toTimeString())
    }

    resetTimer() {
        this.stopTimer()
        this.setHours(0)
        this.setMinutes(0)
        this.setSeconds(0)
        set(ref(getDatabase(), "/users/" + this.userId + "/" + this.timerType + "-is-running"), false)
        set(ref(getDatabase(), "/users/" + this.userId + "/" + this.timerType + "-stop-time"), "")
        set(ref(getDatabase(), "/users/" + this.userId + "/" + this.timerType + "-taken-stop"), "00:00:00")
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