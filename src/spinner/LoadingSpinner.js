import {getCurrentTheme} from "../helper/Theme/Theme";
import ClipLoader from "react-spinners/ClipLoader";
import React from "react";

const getThemeSpinnerColor = () => {
    switch (getCurrentTheme()) {
        case "dark":
            return "#CCCCCC";
        case "bright":
            return "#353535";
    }
}

export const loadingSpinner = <ClipLoader
    color={getThemeSpinnerColor()}
    size={15}
    speedMultiplier={0.8}
/>