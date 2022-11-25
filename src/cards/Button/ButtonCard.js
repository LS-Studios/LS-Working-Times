import "./ButtonContent.scss"
import {getThemeClass} from "../../helper/Theme/Theme";

const ButtonCard = ({ className, title, action}) => {
    return (
        <div className={className != null ? className : getThemeClass("buttonCard")} onClick={(e) => action(e)}>
            <div className="buttonContainer">
                <div><b>{title}</b></div>
            </div>
        </div>
    );
};

export default ButtonCard;