export class DateTime {
    constructor(hours, minutes, seconds) {
        this.hours = hours != null ? hours : DateTime.dateTimeFromDate(new Date()).getHours
        this.minutes = minutes != null ? minutes : DateTime.dateTimeFromDate(new Date()).getMinutes
        this.seconds = seconds != null ? seconds : DateTime.dateTimeFromDate(new Date()).getSeconds

        this.getDiffToDateTime = this.getDiffToDateTime.bind(this)
    }

    getDiffToDateTime(dateTime) {
        let hourDiff = dateTime.getHours - this.hours
        let minuteDiff
        let secondDiff

        if (dateTime.getMinutes - this.minutes < 0) {
            hourDiff -= 1
            minuteDiff = 60 - dateTime.getMinutes
        } else {
            minuteDiff = dateTime.getMinutes - this.minutes
        }

        if (dateTime.getSeconds - this.seconds < 0) {
            if (minuteDiff - 1 < 0) {
                hourDiff -= 1
                minuteDiff = 59
            } else {
                minuteDiff -= 1
            }

            secondDiff = 60 - dateTime.getSeconds
        } else {
            secondDiff = dateTime.getSeconds - this.seconds
        }

        return new DateTime(
            hourDiff,
            minuteDiff,
            secondDiff
        )
    }

    toTimeString() {
        const hourStr = this.hours.toString().length == 1 ? "0" + this.hours : this.hours.toString()
        const minuteStr = this.minutes.toString().length == 1 ? "0" + this.minutes : this.minutes.toString()
        const secondStr = this.seconds.toString().length == 1 ? "0" + this.seconds : this.seconds.toString()
        return hourStr + ":" + minuteStr + ":" + secondStr
    }

    static dateTimeFromDate(date) {
        const time = date.getTime()

        const hours = (Math.floor((time / (1000 * 60 * 60)) % 24))
        const minutes = (Math.floor((time / 1000 / 60) % 60))
        const seconds = (Math.floor((time / 1000) % 60))

        return new DateTime(
            hours,
            minutes,
            seconds
        )
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
}