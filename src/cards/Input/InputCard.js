import Card from "../Card";
import InputContent from "./InputContent";

const InputCard = ({title, placeholder, type="text", charType=0, currentState, setCurrentState}) => {
    return (
        <Card cardContent={
            <InputContent title={title} placeholder={placeholder} type={type} charType={charType} currentState={currentState} setCurrentState={setCurrentState}/>
        } isPointer={true}/>
    );
};

export default InputCard;