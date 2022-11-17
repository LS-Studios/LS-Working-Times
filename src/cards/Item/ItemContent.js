import React, {forwardRef, useImperativeHandle} from 'react';
import "./ItemContent.scss"
import Transaction from "../../Transaction/Transaction";
import {useNavigate} from "react-router-dom";

const ItemContent = ({title, canExpand, list, noItemText, link, setExpandedTransaction}) => {
    const navigate = useNavigate()

    const onClick = () => {
        if (link != null)
            navigate(link)
    }

    return (
        <div className="itemContainer" onClick={onClick}>
            <div><b>{title}</b></div>
            <div className="verticalItemDivider"/>
            <div className="itemHolder">
                {
                    list.length > 0 ? list.map(transaction => {
                        return (
                            <Transaction key={transaction.id} link={link} canExpand={canExpand} transaction={transaction} value={0.0} setExpandedTransaction={setExpandedTransaction}/>
                        )
                    }) : <div style={{marginBottom: 8}}>{noItemText}</div>
                }
            </div>
        </div>
    );
}

export default ItemContent;