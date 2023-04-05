import './App.scss';
import React, {useEffect} from "react";
import {BrowserRouter as Router} from "react-router-dom"
import Providers from "./providers/Providers";
import Screens from "./Screens";

function App() {
    return (
        <Providers>
            <Router className="holder">
                <Screens />
            </Router>
        </Providers>
    );
}

export default App
