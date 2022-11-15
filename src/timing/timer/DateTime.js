export class DateTime {
    constructor(hours, minutes, seconds) {
        this.hours = hours != null ? hours : DateTime.dateTimeFromDate(new Date()).getHours
        this.minutes = minutes != null ? minutes : DateTime.dateTimeFromDate(new Date()).getMinutes
        this.seconds = seconds != null ? seconds : DateTime.dateTimeFromDate(new Date()).getSeconds

        this.getDiffToDateTime = this.getDiffToDateTime.bind(this)
    }

    static dateTimeFromString(stringTime) {
        const splitTimeString = stringTime.split(":")

        return new DateTime(
            parseInt(splitTimeString[0]),
            parseInt(splitTimeString[1]),
            parseInt(splitTimeString[2])
        )
    }

    getDiffToDateTime(dateTime, takenStop) {
        const date = this.getDate()

        date.setHours(date.getHours() - dateTime.getHours - (takenStop != null ? takenStop.getHours : 0))
        date.setMinutes(date.getMinutes() - dateTime.getMinutes - (takenStop != null ? takenStop.getMinutes : 0))
        date.setSeconds(date.getSeconds() - dateTime.getSeconds - (takenStop != null ? takenStop.getSeconds : 0))

        return new DateTime(
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
        )
    }

    addDateTime(dateTime) {
        let dateTimeDate = this.getDate()
        dateTimeDate.setHours(dateTimeDate.getHours() +dateTime.getHours)
        dateTimeDate.setMinutes(dateTimeDate.getMinutes() +dateTime.getMinutes)
        dateTimeDate.setSeconds(dateTimeDate.getSeconds() +dateTime.getSeconds)

        this.hours = dateTimeDate.getHours()
        this.minutes = dateTimeDate.getMinutes()
        this.seconds = dateTimeDate.getSeconds()

        return new DateTime(
            this.hours,
            this.minutes,
            this.seconds
        )
    }

    getDate() {
        const newDate = new Date()
        newDate.setHours(this.hours)
        newDate.setMinutes(this.minutes)
        newDate.setSeconds(this.seconds)
        return newDate
    }

    toTimeString() {
        const hourStr = this.hours.toString().length == 1 ? "0" + this.hours : this.hours.toString()
        const minuteStr = this.minutes.toString().length == 1 ? "0" + this.minutes : this.minutes.toString()
        const secondStr = this.seconds.toString().length == 1 ? "0" + this.seconds : this.seconds.toString()
        return hourStr + ":" + minuteStr + ":" + secondStr
    }

    static dateTimeFromDate(date) {
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const seconds = date.getSeconds()

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