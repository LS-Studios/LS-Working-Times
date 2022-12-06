import Card from "../Card";
import InputContent from "./InputContent";

const InputCard = ({title, placeholder, type="text", focusOnClick, inputType=0, submitFunc, blurFunction, currentState, setCurrentState}) => {
    return (
        <Card cardContent={
            <InputContent title={title} placeholder={placeholder} type={type} focusOnClick={focusOnClick} inputType={inputType} submitFunc={submitFunc} blurFunction={blurFunction} currentState={currentState} setCurrentState={setCurrentState}/>
        } isPointer={true}/>
    );
};

export default InputCard;