export function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

export function formatDate(date) {
    return [
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getMonth() + 1),
        date.getFullYear(),
    ].join('.');
}

export const getDateFromString = (stringDate) => {
    const splitList = stringDate.split(".")
    return new Date(splitList[2], splitList[1]-1, splitList[0])
}

export const getStartOfWeekDayValue = (date) => {
    date = new Date(date)
    const day = date.getDay()
    const firstDay = date.getDate() - day + (day == 0 ? -6:1) // adjust when day is sunday cause it starts with 0 on sunday
    return firstDay
}

export const getDateWithoutTime = (date) => {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    )
}

export const getStartOfWeek = (date) => {
    const startDate = new Date(date.setDate(getStartOfWeekDayValue(date)))
    return getDateWithoutTime(startDate)
}

export const getEndOfWeek = (date) => {
    const endDate = new Date(date.setDate(getStartOfWeekDayValue(date)+6))
    return getDateWithoutTime(endDate)
}