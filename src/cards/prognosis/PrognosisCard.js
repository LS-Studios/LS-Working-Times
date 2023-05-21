import React from 'react';
import "./PrognosisCard.scss"
import ContentCard from "../content/ContentCard";
import {useContextTranslation} from "@LS-Studios/components";

function PrognosisCard({data, isExpanded}) {
    const translation = useContextTranslation()

    return (
        <ContentCard title={translation.translate("prognosis.weekDay"+data[0])} content={
            data[1] ? <div>
                <div className="prognosisCardRowTitle">
                    <div>{translation.translate("prognosis.timeToWork")}</div>
                    <div>{translation.translate("prognosis.breakTime")}</div>
                </div>

                <div className="prognosisCardRowValue">
                    <div>{data[3]}</div>
                    <div>{data[4]}</div>
                </div>

                {
                    data[2].map((workingDayRange, i) => {
                        return <div key={i}>
                            <div className="prognosisCardRowTitle">
                                <div>{i === 0 ? translation.translate("prognosis.startAt") : translation.translate("prognosis.continueAt")}</div>
                                <div>{i === data[2].length-1 ? translation.translate("prognosis.endAt") : translation.translate("prognosis.stopAt")}</div>
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
                    <div>{translation.translate("prognosis.timeToWork")}</div>
                    <div>{translation.translate("prognosis.breakTime")}</div>
                </div>

                <div className="prognosisCardRowValue">
                    <div>{data[2]}</div>
                    <div>{data[3]}</div>
                </div>

                <div className="prognosisCardRowTitle">
                    <div>{translation.translate("prognosis.startAt")}</div>
                    <div>{translation.translate("prognosis.endAt")}</div>
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