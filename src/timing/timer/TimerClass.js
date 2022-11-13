import {DateTime} from "./DateTime";

export class TimerClass {

    constructor(
        hours, setHours,
        minutes, setMinutes,
        seconds, setSeconds,
        currentInterval, setCurrentInterval,
        startTime, setStartTime,
        currentTime, setCurrentTime,
        isRunning, setIsRunning) {
        this.hours = hours
        this.setHours = setHours
        this.minutes = minutes
        this.setMinutes = setMinutes
        this.seconds = seconds
        this.setSeconds = setSeconds
        this.currentInterval = currentInterval
        this.setCurrentInterval = setCurrentInterval
        this.startTime = startTime
        this.setStartTime = setStartTime
        this.currentTime = currentTime
        this.setCurrentTime = setCurrentTime
        this.diff = 0
        this.isRunning = isRunning
        this.setIsRunning = setIsRunning

        this.getTime = this.getTime.bind(this)
        this.toggleTimer = this.toggleTimer.bind(this)
        this.startTimer = this.startTimer.bind(this)
        this.stopTimer = this.stopTimer.bind(this)
        this.resetTimer = this.resetTimer.bind(this)
    }

    getTime() {
        const dateTimeDiff = new DateTime().getDiffToDateTime(DateTime.dateTimeFromDate(this.startTime))

        this.setHours(dateTimeDiff.getHours)
        this.setMinutes(dateTimeDiff.getMinutes)
        this.setSeconds(dateTimeDiff.getSeconds)
    };

    toggleTimer() {
        if (this.isRunning)
            this.stopTimer()
        else
            this.startTimer()
    }

    startTimer() {
        this.diff = Date.now() - this.currentTime
        if (this.currentInterval == null) {
            this.setCurrentInterval(setInterval(() => {
                this.getTime()
            }, 1000))
        }
        this.setIsRunning(true)
    };

    stopTimer() {
        clearInterval(this.currentInterval)
        this.setCurrentInterval(null)
        this.setIsRunning(false)
        this.setCurrentTime(new Date())
    }

    resetTimer() {
        this.stopTimer()
        this.setHours(0)
        this.setMinutes(0)
        this.setSeconds(0)
        this.setStartTime(new Date())
        this.setCurrentTime(new Date())
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