import {initializeApp} from "firebase/app";
import {getDatabase} from "firebase/database";
import {LSWorkingTimesConfig} from "./config/LSWorkingTimesConfig";

export const getFirebaseDB = () => {
    const firebaseApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
    const firebaseDB = getDatabase(firebaseApp)

    return firebaseDB
}