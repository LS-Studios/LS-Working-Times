import {initializeApp} from "firebase/app";
import {getDatabase} from "firebase/database";
import {LSWorkingTimesConfig} from "./config/LSWorkingTimesConfig";
import {getAuth} from "firebase/auth";

export const getFirebaseDB = () => {
    const firebaseApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
    const firebaseDB = getDatabase(firebaseApp)

    return firebaseDB
}

export const getFirebaseAuth = () => {
    const firebaseApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
    return getAuth(firebaseApp)
}

export const getCurrentTimerPath = (currentTimerId, user) => {
    return "/users/" + user.id + "/timers/" + currentTimerId + "/";
};