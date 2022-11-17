import Card from "../Card";
import ToggleContent from "./ToggleContent";

const ToggleCard = ({title, toggleList, currentState, setCurrentState}) => {
    return (
        <Card cardContent={
            <ToggleContent title={title} toggleList={toggleList} currentState={currentState} setCurrentState={setCurrentState}/>
        } isPointer={false}/>
    );
};

export default ToggleCard;