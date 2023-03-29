import React, {useState} from 'react';
import "./PrognosisCard.scss"
import ContentCard from "../../cards/contentinweek/content/ContentCard";
import {t} from "../../helper/LanguageTransaltion/Transalation";

function PrognosisCard({data, isExpanded}) {
    return (
        <ContentCard title={t("prognosis.weekDay"+data[0])} content={
            data[1] ? <div>
                <div className="prognosisCardRowTitle">
                    <div>{t("prognosis.timeToWork")}</div>
                    <div>{t("prognosis.breakTime")}</div>
                </div>

                <div className="prognosisCardRowValue">
                    <div>{data[3]}</div>
                    <div>{data[4]}</div>
                </div>

                {
                    data[2].map((workingDayRange, i) => {
                        return <div key={i}>
                            <div className="prognosisCardRowTitle">
                                <div>{i === 0 ? t("prognosis.startAt") : t("prognosis.continueAt")}</div>
                                <div>{i === data[2].length-1 ? t("prognosis.endAt") : t("prognosis.stopAt")}</div>
                            </div>

                            <div className="prognosisCardRowValue">
                                <div>{workingDayRange[0]}</div>
                                <div>{workingDayRange[1]}</div>
                            </div>
                        </div>
                    })
                }
            </div> : <div>
                <div className="prognosisCardRowTitle">
                    <div>{t("prognosis.timeToWork")}</div>
                    <div>{t("prognosis.breakTime")}</div>
                </div>

                <div className="prognosisCardRowValue">
                    <div>{data[2]}</div>
                    <div>{data[3]}</div>
                </div>

                <div className="prognosisCardRowTitle">
                    <div>{t("prognosis.startAt")}</div>
                    <div>{t("prognosis.endAt")}</div>
                </div>

                <div className="prognosisCardRowValue">
                    <div>{data[4]}</div>
                    <div>{data[5]}</div>
                </div>
            </div>
        } isExpanded={isExpanded}/>
    );
}

export default PrognosisCard;