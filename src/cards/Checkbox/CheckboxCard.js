import Card from "../Card";
import CheckboxContent from "./CheckboxContent";

const CheckboxCard = ({title, currentState, setCurrentState}) => {
    return (
        <Card cardContent={
            <CheckboxContent title={title} currentState={currentState} setCurrentState={setCurrentState}/>
        } isPointer={false}/>
    );
};

export default CheckboxCard;