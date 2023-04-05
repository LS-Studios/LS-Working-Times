import React, {useState} from 'react';
import "./ContentCard.scss"
import {useTranslation} from "@LS-Studios/use-translation";
import {Divider, Title, useComponentTheme} from "@LS-Studios/components";

const ContentCard = ({content, title, isExpanded, deleteAction, editAction}) => {
    const translation = useTranslation()
    const theme = useComponentTheme()

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
        <div className={theme.getThemeClass("contentCardBg")} onClick={expand}>
            <div className={expanded ? "contentCardTitleExpanded" : ""}>
                <Title value={title} />
            </div>
            <div className={expanded ? "" : "gone"}>
                <Divider marginBottom={2}/>

                { content }

                {
                    editAction != null ? <div>
                        { content != null ? <Divider marginTop={2}/> : null }
                        <div className="contentCardActionBar">
                            <button className={theme.getThemeClass("contentCardActionButton")} onClick={deleteData}>{translation.translate("timer.delete")}</button>
                            <button className={theme.getThemeClass("contentCardActionButton")} onClick={editData}>{translation.translate("timer.edit")}</button>
                        </div>
                    </div> : null
                }
            </div>
        </div>
    );
};

export default ContentCard;