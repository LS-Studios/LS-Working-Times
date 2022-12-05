import Card from "../Card";
import CheckboxContent from "./CheckboxContent";

const CheckboxCard = ({title, checkboxList, currentState, setCurrentState}) => {
    return (
        <Card cardContent={
            <CheckboxContent title={title} checkboxList={checkboxList} currentState={currentState} setCurrentState={setCurrentState}/>
        } isPointer={false}/>
    );
};

export default CheckboxCard;