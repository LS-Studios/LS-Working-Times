import {
    Screen, Screens,
    useContextGlobalVariables,
    useContextTheme,
    useContextTranslation,
    useContextUserAuth
} from "@LS-Studios/components";
import React, {useEffect, useState} from "react";
import Timer from "./timer/Timer";
import Planning from "./planning/Planning";
import Prognosis from "./prognosis/Prognosis";
import {getCurrentTimerPath, getFirebaseAuth, getFirebaseDB} from "../firebase/FirebaseHelper";
import {signInWithEmailAndPassword} from "firebase/auth";
import {get, onValue, push, ref, remove, set} from "firebase/database";
import {changeCssProperty} from "@LS-Studios/use-theme";
import AdditionalSettings from "./settings/AdditionalSettings";

function ScreensContent() {
    const translation = useContextTranslation()
    const globalVariables = useContextGlobalVariables()
    const auth = useContextUserAuth()
    const theme = useContextTheme()

    const [currentTimerIsFetching, setCurrentTimerIsFetching] = useState(true)
    const [authIsFetching, setAuthIsFetching] = useState(true)

    const [currentTimerName, setCurrentTimerName] = useState("")

    const currentTimerId = globalVariables.getLSVar("currentTimerId")

    const screenList = [
        new Screen(
            translation.translate("timer.menu-name") + (currentTimerName && currentTimerName !== "" && " - " + currentTimerName),
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
        const firebaseAuth = getFirebaseAuth()

        if (!auth.userIsFetching && auth.user && auth.authFirebaseUser) {
            signInWithEmailAndPassword(firebaseAuth, auth.user.email, auth.user.password).then(() => {
                setAuthIsFetching(false)
            })
        } else {
            setAuthIsFetching(true)
        }
    }, [auth.userIsFetching, authIsFetching, auth.authFirebaseUser])

    useEffect(() => {
        if (!auth.userIsFetching && auth.user && !authIsFetching) {
            const firebaseDB = getFirebaseDB()
            const firebaseAuth = getFirebaseAuth()

            set(ref(firebaseDB, "/users/" + auth.user.id + "/authId"), firebaseAuth.currentUser.uid).then(() => {
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
            }).catch((error) => {
                console.log(error)
            })
        }
    }, [auth.userIsFetching, authIsFetching])

    useEffect(() => {
        const unsubscribeArray = []

        if (!currentTimerIsFetching) {
            const firebaseDB = getFirebaseDB()

            unsubscribeArray.push(
                onValue(ref(firebaseDB, getCurrentTimerPath(currentTimerId, auth.user) + "name"), (snapshot) => {
                    setCurrentTimerName(snapshot.val() || "")
                })
            )
        }

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [currentTimerIsFetching, currentTimerId])

    useEffect(() => {
        changeCssProperty(document, "--item-card-bg-color", theme.getThemeColor("item-card.bg-color"))
        changeCssProperty(document, "--item-card-button-color", theme.getThemeColor("item-card.button-color"))
    }, [theme.currentTheme])

    const authSetUp = async (user) => {
        await get(ref(getFirebaseDB(), "/users/" + user.id + "/timers/")).then(async (snapshot) => {
            if (!snapshot.exists()) {
                const newTimerRef = push(ref(getFirebaseDB(), "/users/" + user.id + "/timers/"))

                await set(ref(getFirebaseDB(), "/users/" + user.id + "/timers/" + newTimerRef.key), {
                    id: newTimerRef.key,
                    name: translation.translate("timer.new-timer")
                }).then(() => {
                    return true
                }).catch(() => {
                    return false
                })
            }
        }).catch(() => {
            return false
        })
    }

    const deleteAccountCleanup = (user) => {
        remove(ref(getFirebaseDB(), "/users/" + user.id))
    }

    return (
        <Screens defaultLink="/timer"
                 screenList={screenList}
                 canLoginAsGuest={false}
                 authSetUp={authSetUp}
                 deleteAccountCleanup={deleteAccountCleanup}
                 isFetching={currentTimerIsFetching}
                 additionalSettings={<AdditionalSettings />}/>
    );
}

export default ScreensContent