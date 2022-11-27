import Card from "../Card";
import InputContent from "./InputContent";

const InputCard = ({title, placeholder, type="text", focusOnClick, charType=0, submitFunc, blurFunction, currentState, setCurrentState}) => {
    return (
        <Card cardContent={
            <InputContent title={title} placeholder={placeholder} type={type} focusOnClick={focusOnClick} charType={charType} submitFunc={submitFunc} blurFunction={blurFunction} currentState={currentState} setCurrentState={setCurrentState}/>
        } isPointer={true}/>
    );
};

export default InputCard;