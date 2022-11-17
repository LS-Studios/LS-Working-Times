import "./ButtonContent.scss"

const ButtonCard = ({ className, title, action}) => {
    return (
        <div className={className != null ? className : "buttonCard"} onClick={(e) => action(e)}>
            <div className="buttonContainer">
                <div><b>{title}</b></div>
            </div>
        </div>
    );
};

export default ButtonCard;