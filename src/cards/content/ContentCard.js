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
        <ItemCard onClick={expand}>
            <Title value={title} />

            <Gone isVisible={expanded} goneType={GoneType.HEIGHT}>
                <Divider marginBottom={2}/>

                { content }

                <Gone isVisible={editAction}>
                    { content != null ? <Divider marginTop={2}/> : null }

                    <Layout>
                        <ButtonCard title={translation.translate("timer.delete")} clickAction={deleteData} />
                        <ButtonCard title={translation.translate("timer.edit")} clickAction={editData} />
                    </Layout>
                </Gone>
            </Gone>
        </ItemCard>
    );
};

export default ContentCard;