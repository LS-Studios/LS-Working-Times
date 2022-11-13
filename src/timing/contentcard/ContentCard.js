import React from 'react';
import "./ContentCard.css"

function ContentCard({name, content}) {
    return (
        <div className="contentCard">
            <div>{name}</div>
            <div className="contentCardContent"><b>
                {content}
            </b></div>
        </div>
    );
}

export default ContentCard;