import React, {useEffect, useState} from 'react';
import {
    ButtonCard,
    Divider,
    InputContent,
    Layout,
    Title,
    useContextDialog, useContextGlobalVariables,
    useContextTranslation, useContextUserAuth
} from "@LS-Studios/components";
import {get, push, ref, set} from "firebase/database";
import {getCurrentTimerPath, getFirebaseDB} from "../../firebase/FirebaseHelper";

export const CreateEditTimerDialogType = {
    CREATE: "create",
    EDIT: "edit"
}

function CreateEditTimerDialog({data}) {
    const translation = useContextTranslation()
    const dialog = useContextDialog()
    const globalVariables = useContextGlobalVariables()
    const auth = useContextUserAuth()

    const [currentTimerName, setCurrentTimerName] = useState("")
    const [timerNameIsFetching, setTimerNameIsFetching] = useState(true)

    useEffect(() => {
        if (data.type == CreateEditTimerDialogType.EDIT) {
            get(ref(getFirebaseDB(), getCurrentTimerPath(globalVariables.getLSVar("currentTimerId"), auth.user) + "name")).then((snapshot) => {
                setCurrentTimerName(snapshot.val() || "")
                setTimerNameIsFetching(false)
            })
        }

        setTimerNameIsFetching(false)
    }, [])

    const close = () => {
        dialog.closeTopDialog()
    }

    const createTimer = () => {
        setTimerNameIsFetching(true)

        const newTimerRef = push(ref(getFirebaseDB(), "/users/" + auth.user.id + "/timers/"))

        set(ref(getFirebaseDB(), "/users/" + auth.user.id + "/timers/" + newTimerRef.key), {
            id: newTimerRef.key,
            name: currentTimerName
        }).then(() => {
            close()
        })
    }

    const editTimer = () => {
        setTimerNameIsFetching(true)
        set(ref(getFirebaseDB(), getCurrentTimerPath(globalVariables.getLSVar("currentTimerId"), auth.user) + "name"), currentTimerName).then(() => {
            close()
        })
    }

    const confirm = () => {
        switch (data.type) {
            case CreateEditTimerDialogType.CREATE:
                createTimer()
                break;
            case CreateEditTimerDialogType.EDIT:
                editTimer()
                break;
        }
    }

    const getTitelByType = () => {
        switch (data.type) {
            case CreateEditTimerDialogType.CREATE:
                return translation.translate("timer.createTimer")
            case CreateEditTimerDialogType.EDIT:
                return translation.translate("timer.editTimer")
        }
    }

    return (
        <>
            <Title value={getTitelByType()} style={{fontSize:20}}/>
            <Divider marginBottom={5}/>

            <Title value={translation.translate("timer.name")} />
            <InputContent isLoading={timerNameIsFetching} currentState={currentTimerName} setCurrentState={setCurrentTimerName}/>

            <Layout>
                <ButtonCard justButton buttonStyle={{width:"100%"}} title={translation.translate("dialog.cancel")} clickAction={close}/>
                <ButtonCard justButton buttonStyle={{width:"100%"}} title={translation.translate("dialog.confirm")} clickAction={confirm}/>
            </Layout>
        </>
    );
}

export default CreateEditTimerDialog;