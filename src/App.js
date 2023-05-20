import './App.scss';
import React from "react";
import {BrowserRouter as Router} from "react-router-dom"
import Providers from "./old/providers/Providers";
import Screens from "./old/Screens";

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
