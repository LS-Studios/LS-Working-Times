import React from 'react';
import {
    Divider,
    ItemCard,
    Title,
    useContextGlobalVariables,
    useContextTranslation
} from "@LS-Studios/components";
import {Gone, GoneType} from "@LS-Studios/general";
import {MdCheck, MdDelete} from "react-icons/md";

function TimerCard({selectFunc, deleteFunc, timer, expandedTimerId, setExpandedTimerId}) {
    const translation = useContextTranslation()
    const globalVariables = useContextGlobalVariables()

    const toggleExpansion = (e) => {
        globalVariables.getLSVar("currentTimerId") != timer.id && setExpandedTimerId(expandedTimerId == timer.id ? null : timer.id)
    }

    const selectTimer = () => {
        selectFunc(timer)
    }

    const deleteTimer = () => {
        deleteFunc(timer)
    }

    return (
        <ItemCard onClick={toggleExpansion} style={{width: "250px", cursor: globalVariables.getLSVar("currentTimerId") == timer.id ? "default" : "pointer"}}>
            <div>
                <Title value={timer.name + (globalVariables.getLSVar("currentTimerId") == timer.id ? translation.translate("timer.current") : "")} />

                <Gone isVisible={expandedTimerId == timer.id} goneType={GoneType.HEIGHT}>
                    <Divider marginTop={2}/>

                    <div className="itemCardButtonBar">
                        <MdCheck onClick={selectTimer} />
                        <MdDelete onClick={deleteTimer} />
                    </div>
                </Gone>
            </div>
        </ItemCard>
    );
}

export default TimerCard;