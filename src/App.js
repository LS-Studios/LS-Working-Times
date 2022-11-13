import './App.css';
import Login from "./login/Login";
import {
    BrowserRouter as Router,
    Route,
    Routes
} from "react-router-dom";
import Timing from "./timing/Timing";

function App() {
  return (
    <Router className="App">
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/timing" element={<Timing/>}/>
        </Routes>
    </Router>
  );
}

export default App;
