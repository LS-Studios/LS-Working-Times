import React, {useState} from 'react';
import "./ContentCard.scss"
import {
    ButtonCard,
    Divider,
    ItemCard,
    Layout,
    Title,
    useContextTranslation
} from "@LS-Studios/components";
import {Gone, GoneType} from "@LS-Studios/general";

const ContentCard = ({content, title, isExpanded, deleteAction, editAction}) => {
    const translation = useContextTranslation()

    const [expanded, setExpanded] = useState(isExpanded)

    const deleteData = (e) => {
        e.stopPropagation();

        deleteAction()
    }

    const editData = (e) => {
        e.stopPropagation()

        editAction()
    }

    const expand = () => {
        setExpanded(!expanded)
    }

    return (
        <ItemCard style={{width: 250}} onClick={expand}>
            <Title value={title} />

            <Gone isVisible={expanded} goneType={GoneType.HEIGHT}>
                <Divider marginBottom={2}/>

                { content }

                <Gone isVisible={editAction}>
                    { content != null ? <Divider marginTop={2}/> : null }

                    <div className="itemCardButtonBar">
                        <div onClick={deleteData}>{translation.translate("timer.delete")}</div>
                        <div onClick={editData}>{translation.translate("timer.edit")}</div>
                    </div>
                </Gone>
            </Gone>
        </ItemCard>
    );
};

export default ContentCard;