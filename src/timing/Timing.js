import React, {useEffect, useRef, useState} from 'react';
import "./Timing.css"

import {
    getDatabase,
    ref,
    onValue,
    set,
    push,
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    get
} from "firebase/database"
import {getAuth} from "firebase/auth";
import Save from "./save/Save";
import {initializeApp} from "firebase/app";
import {LSWalletConfig} from "../firebase/LSWalletConfig";
import {LSWorkingTimesConfig} from "../firebase/LSWorkingTimesConfig";
import TimingMenu from "./TimingMenu";
import {useNavigate} from "react-router-dom";
import {setLanguage} from "../helper/LanguageTransaltion/Transalation";
import {getThemeClass, setTheme} from "../helper/Theme/Theme";

function Timing({setCurrentMenu}) {
    const navigate = useNavigate()

    const [savesIsLoading, setSavesIsLoading] = useState(true)

    const [saved, setSaved] = useState([]);

    const [selectedSaveDate, setSelectedSaveDate] = useState(new Date())

    useEffect(() => {
        setCurrentMenu(1)

        const lsWorkingTimesApp = initializeApp(LSWorkingTimesConfig, "LS-Working-Times")
        const lsWalletApp = initializeApp(LSWalletConfig, "LS-Wallet")
        const db = getDatabase(lsWorkingTimesApp)
        const auth = getAuth(lsWalletApp)

        const unsubscribeArray = []

        unsubscribeArray.push(
            auth.onAuthStateChanged(function(user) {
                get(ref(db, "/users/"+user.uid+"/language")).then((snapshot) => {
                    if (snapshot.exists()) {
                        setLanguage(snapshot.val())
                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });

                get(ref(db, "/users/"+user.uid+"/theme")).then((snapshot) => {
                    if (snapshot.exists()) {
                        setTheme(snapshot.val())
                        document.body.classList.forEach((v, k, p) => {
                            document.body.classList.remove(v)
                        })
                        document.body.classList.add(getThemeClass("body"))
                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });

                if (user == null) {
                    unsubscribeArray.forEach(unsubscribe => unsubscribe())
                    navigate("/login")
                    return
                }

                get(ref(db, "/users/" + user.uid + "/saved")).then((snapshot) => {
                    if (!snapshot.exists())
                        setSavesIsLoading(false)
                }).catch((error) => {
                    console.error(error);
                });
                unsubscribeArray.push(
                    onChildAdded(ref(db, "/users/" + user.uid + "/saved"), snapshot => {
                        const value = snapshot.val()
                        if (value != null) {
                            setSavesIsLoading(false)

                            setSaved(prevState => (
                                [value].concat(prevState)
                            ))
                        }
                }))
                unsubscribeArray.push(
                    onChildChanged(ref(db, "/users/" + user.uid + "/saved"), changedSnapshot => {
                        const value = changedSnapshot.val()
                        if (value != null) {
                            get(ref(db, "/users/" + user.uid + "/saved")).then((snapshot) => {
                                if (snapshot.exists()) {
                                    const saves = []
                                    snapshot.forEach(childSnapshot => {
                                        saves.push(childSnapshot.val())
                                    })

                                    const newState = saves.map(obj => {
                                        if (obj.id === value.id) {
                                            return value;
                                        }

                                        return obj;
                                    });

                                    setSaved(newState);
                                } else {
                                    console.log("No data available");
                                }
                            }).catch((error) => {
                                console.error(error);
                            });
                        }
                    }))
                unsubscribeArray.push(
                    onChildRemoved(ref(db, "/users/" + user.uid + "/saved"), snapshot => {
                        const value = snapshot.val()
                        if (value != null) {
                            setSaved((current) =>
                                current.filter((save) => save.id !== value.id)
                            );
                        }
                }))
        }))

        return () => {
            unsubscribeArray.forEach(unsub => unsub())
        }
    }, [])

    return (
        <div>
            <TimingMenu saved={saved} selectedSaveDate={selectedSaveDate} setSavesIsLoading={setSavesIsLoading}/>
            <Save saved={saved} selectedSaveDate={selectedSaveDate} setSelectedSaveDate={setSelectedSaveDate} isLoading={savesIsLoading}/>
        </div>
    );
}

export default Timing;