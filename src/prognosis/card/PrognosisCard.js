import React, {useState} from 'react';
import "./PrognosisCard.scss"
import ContentCard from "../../cards/ContentInWeek/content/ContentCard";
import {t} from "../../helper/LanguageTransaltion/Transalation";

function PrognosisCard({data, isExpanded}) {
    return (
        <ContentCard title={data[0]} content={
            <div>
                <div className="prognosisCardRowTitle">
                    <div>{t("prognosis.timeToWork")}</div>
                    <div>{t("prognosis.breakTime")}</div>
                </div>

                <div className="prognosisCardRowValue">
                    <div>{data[1]}</div>
                    <div>{data[2]}</div>
                </div>

                <div className="prognosisCardRowTitle">
                    <div>{t("prognosis.startAt")}</div>
                    <div>{t("prognosis.endAt")}</div>
                </div>

                <div className="prognosisCardRowValue">
                    <div>{data[3]}</div>
                    <div>{data[4]}</div>
                </div>
            </div>
        } isExpanded={isExpanded}/>
    );
}

export default PrognosisCard;