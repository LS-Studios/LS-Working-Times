import React, {useState} from 'react';
import "./ContentCard.scss"
import {getThemeClass} from "../../../helper/Theme/Theme";
import {t} from "../../../helper/LanguageTransaltion/Transalation";

const ContentCard = ({content, title, isExpanded, deleteAction, editAction}) => {
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
        <div className={getThemeClass("contentCardBg")} onClick={expand}>
            <div className={expanded ? "contentCardTitleExpanded" : ""}>
                <div><b>{title}</b></div>
            </div>
            <div className={expanded ? "" : "gone"}>
                <div className={getThemeClass("contentCardDividerTop")}></div>

                { content }

                {
                    editAction != null ? <div>
                        <div className={getThemeClass("contentCardDividerBottom")}></div>
                        <div className="contentCardActionBar">
                            <button className={getThemeClass("contentCardActionButton")} onClick={deleteData}>{t("timer.delete")}</button>
                            <button className={getThemeClass("contentCardActionButton")} onClick={editData}>{t("timer.edit")}</button>
                        </div>
                    </div> : null
                }
            </div>
        </div>
    );
};

export default ContentCard;