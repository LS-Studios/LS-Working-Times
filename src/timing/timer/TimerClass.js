import {DateTime} from "./DateTime";

export class TimerClass {

    constructor(
        hours, setHours,
        minutes, setMinutes,
        seconds, setSeconds,
        startTime, setStartTime,
        breakTime, setBreakTime,
        takenBreak, setTakenBreak,
        isRunning, setIsRunning) {
        this.hours = hours
        this.setHours = setHours
        this.minutes = minutes
        this.setMinutes = setMinutes
        this.seconds = seconds
        this.setSeconds = setSeconds
        this.startTime = startTime
        this.setStartTime = setStartTime
        this.breakTime = breakTime
        this.setBreakTime = setBreakTime
        this.takenBreak = takenBreak
        this.setTakenBreak = setTakenBreak
        this.isRunning = isRunning
        this.setIsRunning = setIsRunning

        this.getTime = this.getTime.bind(this)
        this.startTimer = this.startTimer.bind(this)
        this.stopTimer = this.stopTimer.bind(this)
        this.resetTimer = this.resetTimer.bind(this)
    }

    getTime() {
        const dateTimeDiff = new DateTime().getDiffToDateTime(DateTime.dateTimeFromDate(this.startTime), this.takenBreak)

        this.setHours(dateTimeDiff.getHours)
        this.setMinutes(dateTimeDiff.getMinutes)
        this.setSeconds(dateTimeDiff.getSeconds)
    };

    startTimer() {
        if (this.startTime == null) {
            const newDate = new Date()
            this.setStartTime(newDate)
            this.startTime = newDate
        }

        if (this.breakTime == null) {
            const newDateTime = new DateTime()
            this.setBreakTime(newDateTime)
            this.breakTime = newDateTime
        }

        this.setTakenBreak(this.takenBreak.addDateTime(new DateTime().getDiffToDateTime(this.breakTime)))

        this.setIsRunning(true)
    };

    stopTimer() {
        this.setIsRunning(false)
        this.setBreakTime(new DateTime())
    }

    resetTimer() {
        this.stopTimer()
        this.setHours(0)
        this.setMinutes(0)
        this.setSeconds(0)
        this.setIsRunning(false)
        this.setStartTime(null)
        this.setBreakTime(null)
        this.setTakenBreak(new DateTime(0, 0, 0))
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