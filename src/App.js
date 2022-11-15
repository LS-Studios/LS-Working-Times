import './App.css';
import Login from "./login/Login";
import {
    BrowserRouter as Router, Navigate,
    Route,
    Routes
} from "react-router-dom";
import Timing from "./timing/Timing";
import {initializeApp} from "firebase/app";
import firebaseConfig from "./firebase/config";
import React from "react";

function App() {
    initializeApp(firebaseConfig)

    return (
      <Router className="App">
          <Routes>
              <Route path="/login" element={<Login/>}/>
              <Route
                  path="/timing"
                  element={<Timing/>}
              />
              <Route
                  path="*"
                  element={<Navigate replace to="/timing" />}
              />
          </Routes>
          <div className="footer"><b>LS-Working-Times</b></div>
      </Router>
    );
}

export default App;
