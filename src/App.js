import './App.scss';
import React from "react";
import Providers from "./providers/Providers";
import ScreensContent from "./screens/ScreensContent";

function App() {
    return (
        <Providers>
            <ScreensContent />
        </Providers>
    );
}

export default App
