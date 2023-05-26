import './App.scss';
import React, {useEffect, useState} from "react";
import Providers from "./providers/Providers";
import {
    Screen, Screens,
    useContextGlobalVariables,
    useContextTranslation,
    useContextUserAuth
} from "@LS-Studios/components";
import Timer from "./screens/timer/Timer";
import Planning from "./screens/planning/Planning";
import Prognosis from "./screens/prognosis/Prognosis";
import AdditionalSettings from "./screens/settings/AdditionalSettings";
import {get, onValue, ref} from "firebase/database";
import {getCurrentTimerPath, getFirebaseDB} from "./firebase/FirebaseHelper";

function ScreensContent() {
    const translation = useContextTranslation()
    const globalVariables = useContextGlobalVariables()
    const auth = useContextUserAuth()

    const [currentTimerIsFetching, setCurrentTimerIsFetching] = useState(true)

    const [currentTimerName, setCurrentTimerName] = useState("")

    const currentTimerId = globalVariables.getLSVar("currentTimerId")

    const screenList = [
        new Screen(
            translation.translate("timer.menu-name") + " - " + currentTimerName,
            "/timer",
            <Timer />,
            true
        ),
        new Screen(
            translation.translate("planning.menu-name"),
            "/planning",
            <Planning />,
            true
        ),
        new Screen(
            translation.translate("prognosis.menu-name"),
            "/prognosis",
            <Prognosis />,
            true
        )
    ]

    useEffect(() => {
        if (!auth.userIsFetching && auth.user) {
            const firebaseDB = getFirebaseDB()

            get(ref(firebaseDB, "/users/" + auth.user.id + "/timers/" + currentTimerId)).then((snapshot) => {
                if (!snapshot.exists()) {
                    get(ref(firebaseDB, "/users/" + auth.user.id + "/timers/")).then((snapshot) => {
                        const timerId = Object.keys(snapshot.val())[0]
                        globalVariables.setLSVar("currentTimerId", timerId)
                        setCurrentTimerIsFetching(false)
                    })
                } else {
                    setCurrentTimerName(snapshot.val()["name"])

                    setCurrentTimerIsFetching(false)
                }
            })
        }
    }, [auth.userIsFetching])

    useEffect(() => {
        const unsubscribeArray = []

        if (!currentTimerIsFetching) {
            unsubscribeArray.push(
                onValue(ref(getFirebaseDB(), getCurrentTimerPath(globalVariables.getLSVar("currentTimerId"), auth.user) + "name"), (snapshot) => {
                    setCurrentTimerName(snapshot.val() || "")
                })
            )
        }

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [currentTimerIsFetching, currentTimerId])

    return (
        <Screens defaultLink="/timer" screenList={screenList} isFetching={currentTimerIsFetching} additionalSettings={<AdditionalSettings />}/>
    );
}

function App() {
    return (
        <Providers>
            <ScreensContent />
        </Providers>
    );
}

export default App
