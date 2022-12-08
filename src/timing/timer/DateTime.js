export class DateTime {
    constructor(hours, minutes, seconds) {
        this.hours = hours != null ? parseInt(hours) : DateTime.dateTimeFromDate(new Date()).getHours
        this.minutes = minutes != null ? parseInt(minutes) : DateTime.dateTimeFromDate(new Date()).getMinutes
        this.seconds = seconds != null ? parseInt(seconds) : DateTime.dateTimeFromDate(new Date()).getSeconds

        this.getDateDiffToDateTime = this.getDateDiffToDateTime.bind(this)
    }

    static dateTimeFromString(stringTime) {
        const splitTimeString = stringTime.split(":")

        return new DateTime(
            parseInt(splitTimeString[0]),
            parseInt(splitTimeString[1]),
            parseInt(splitTimeString[2])
        )
    }

    getDateDiffToDateTime(dateTime, takenStop) {
        if (dateTime != null) {
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
    }

    getAbsoluteDiffToDateTime(dateTime) {
        if (dateTime != null) {
            return new DateTime(
                this.hours - dateTime.getHours,
                this.minutes - dateTime.getMinutes,
                this.seconds - dateTime.getSeconds
            )
        }
    }

    addDateTime(dateTime) {
        if (dateTime != null) {
            let newHours =  this.hours
            let newMinutes =  this.minutes
            let newSeconds =  this.seconds

            const addMinutes = (value) => {
                if (value%60===0) {
                    newHours += value/60
                } else {
                    while(value-60>0) {
                        value -= 60
                        newHours++
                    }
                    if (newMinutes + value - 60 >= 0) {
                        newMinutes += value - 60
                        newHours++
                    } else {
                        newMinutes += value
                    }
                }
            }

            const addSeconds = (value) => {
                if (value%60===0) {
                    addMinutes(value/60)
                } else {
                    while(value-60>0) {
                        value -= 60
                        addMinutes(1)
                    }
                    if (newSeconds + value - 60 >= 0) {
                        newSeconds += value - 60
                        addMinutes(1)
                    } else {
                        newSeconds += value
                    }
                }
            }

            //Use date to auto increase hours
            newHours = newHours + dateTime.getHours

            addMinutes(dateTime.getMinutes)
            addSeconds(dateTime.getSeconds)

            return new DateTime(
                newHours,
                newMinutes,
                newSeconds
            )
        } else {
            return this
        }
    }

    subtractDateTime(dateTime) {
        if (dateTime != null) {
            const subtractMinutes = (value) => {
                if (value%60===0) {
                    this.hours -= value/60
                } else {
                    while(value-60>0) {
                        value -= 60
                        this.hours++
                    }
                    if (this.minutes - value < 0) {
                        this.minutes = 60 - (value - this.minutes)
                        this.hours--
                    } else {
                        this.minutes -= value
                    }
                }
            }

            const addMinutes = (value) => {
                if (value%60===0) {
                    this.hours += value/60
                } else {
                    while(value-60>0) {
                        value -= 60
                        this.hours++
                    }
                    if (this.minutes + value - 60 >= 0) {
                        this.minutes += value - 60
                        this.hours++
                    } else {
                        this.minutes += value
                    }
                }
            }

            const subtractSeconds = (value) => {
                if (value%60===0) {
                    this.minutes -= value/60
                } else {
                    while(value-60>0) {
                        value -= 60
                        addMinutes(1)
                    }
                    if (this.seconds - value < 0) {
                        this.seconds = 60 - (value - this.seconds)
                        subtractMinutes(1)
                    } else {
                        this.seconds -= value
                    }
                }
            }

            //Use date to auto increase hours
            this.hours = this.hours - dateTime.getHours

            subtractMinutes(dateTime.getMinutes)
            subtractSeconds(dateTime.getSeconds)

            return new DateTime(
                this.hours,
                this.minutes,
                this.seconds
            )
        } else {
            return this
        }
    }

    divideDateTime(dateTime) {
        if (dateTime != null) {
            return new DateTime(
                parseInt(parseInt( this.hours / dateTime.getHours).toFixed(0)),
                parseInt(parseInt(this.minutes / dateTime.getMinutes).toFixed(0)),
                parseInt(parseInt(this.seconds / dateTime.getSeconds).toFixed(0)),
            )
        } else {
            return this
        }
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

    isLarger(dateTime) {
        const thisHours = parseInt(this.hours)
        const thisMinutes = parseInt(this.minutes)
        const thisSeconds = parseInt(this.seconds)

        const dateHours = parseInt(dateTime.getHours)
        const dateMinutes = parseInt(dateTime.getMinutes)
        const dateSeconds = parseInt(dateTime.getSeconds)

        if (thisHours > dateHours)
            return true

        if (thisHours === dateHours) {
            if (thisMinutes > dateMinutes)
                return true

            if (thisMinutes === dateMinutes) {
                if (thisSeconds > dateSeconds)
                    return true
            }
        }

        return false
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