import {initializeApp} from "firebase/app";
import {getDatabase} from "firebase/database";
import {getAuth} from "firebase/auth";
import {LSWorkingTimesConfig} from "@LS-Studios/use-user-auth";

export const getFirebaseDB = () => {
    const firebaseApp = initializeApp(LSWorkingTimesConfig.config, LSWorkingTimesConfig.name)
    const firebaseDB = getDatabase(firebaseApp)

    return firebaseDB
}

export const getFirebaseAuth = () => {
    const firebaseApp = initializeApp(LSWorkingTimesConfig.config, LSWorkingTimesConfig.name)
    return getAuth(firebaseApp)
}

export const getCurrentTimerPath = (currentTimerId, user) => {
    return "/users/" + user.id + "/timers/" + currentTimerId + "/";
};