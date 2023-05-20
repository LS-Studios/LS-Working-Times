export class DateTime {
    constructor(hours, minutes, seconds) {
        this.hours = hours != null ? parseInt(hours) : DateTime.dateTimeFromDate(new Date()).getHours
        this.minutes = minutes != null ? parseInt(minutes) : DateTime.dateTimeFromDate(new Date()).getMinutes
        this.seconds = seconds != null ? parseInt(seconds) : DateTime.dateTimeFromDate(new Date()).getSeconds

        this.getDateDiffToDateTime = this.getDateDiffToDateTime.bind(this)
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
            let newHours =  this.hours
            let newMinutes =  this.minutes
            let newSeconds =  this.seconds

            const subtractMinutes = (value) => {
                if (value%60===0) {
                    newHours -= value/60
                } else {
                    while(value-60>0) {
                        value -= 60
                        newHours++
                    }
                    if (newMinutes - value < 0) {
                        newMinutes = 60 - (value - newMinutes)
                        newHours--
                    } else {
                        newMinutes -= value
                    }
                }
            }

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

            const subtractSeconds = (value) => {
                if (value%60===0) {
                    newMinutes -= value/60
                } else {
                    while(value-60>0) {
                        value -= 60
                        addMinutes(1)
                    }
                    if (newSeconds - value < 0) {
                        newSeconds = 60 - (value - newSeconds)
                        subtractMinutes(1)
                    } else {
                        newSeconds -= value
                    }
                }
            }

            //Use date to auto increase hours
            newHours = newHours - dateTime.getHours

            subtractMinutes(dateTime.getMinutes)
            subtractSeconds(dateTime.getSeconds)

            return new DateTime(
                newHours,
                newMinutes,
                newSeconds
            )
        } else {
            return this
        }
    }

    divideDateTime(dateTime) {
        if (dateTime != null) {
            let newHours = this.hours
            let newMinutes = this.minutes
            let newSeconds = (this.seconds === 0 || dateTime.getSeconds === 0) ? 0 : this.seconds / dateTime.getSeconds

            if (newMinutes !== 0 && dateTime.getMinutes !== 0 && newMinutes % dateTime.getMinutes !== 0) {
                const minuteDiv = (newMinutes / dateTime.getSeconds).toFixed(2)
                const minuteDivSplit = minuteDiv.split(".")
                newMinutes = parseInt( minuteDivSplit[0])
                let calcDateTime = new DateTime(newHours, newMinutes, newSeconds)
                calcDateTime = calcDateTime.addDateTime(new DateTime(0,0, 60 * (minuteDivSplit[1]/100)))
                newHours = calcDateTime.hours
                newMinutes = calcDateTime.minutes
                newSeconds = calcDateTime.seconds
            } else {
                newMinutes = (newMinutes === 0 || dateTime.getMinutes === 0) ? 0 : newMinutes / dateTime.getMinutes
            }

            if (newHours !== 0 && dateTime.getHours !== 0 && newHours % dateTime.getHours !== 0) {
                const hourDiv = (newHours / dateTime.getHours).toFixed(2)
                const hourDivSplit = hourDiv.split(".")
                newHours = parseInt(hourDivSplit[0])
                let calcDateTime = new DateTime(newHours, newMinutes, newSeconds)

                const hourMinuteDiv = (60 * (hourDivSplit[1]/100)).toFixed(2)
                const hourMinuteDivSplit = hourMinuteDiv.split(".")

                calcDateTime = calcDateTime.addDateTime(new DateTime(0,hourMinuteDivSplit[0],60 * (hourMinuteDivSplit[1]/100)))

                newHours = calcDateTime.hours
                newMinutes = calcDateTime.minutes
                newSeconds = calcDateTime.seconds
            } else {
                newHours = (newHours === 0 || dateTime.getHours === 0) ? 0 : newHours / dateTime.getHours
            }

            return new DateTime(
                newHours,
                newMinutes,
                newSeconds,
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
}