import './App.css';
import Login from "./login/Login";
import {
    BrowserRouter as Router,
    Route,
    Routes
} from "react-router-dom";
import Timer from "./timer/Timer";

function App() {
  return (
    <Router className="App">
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/timer" element={<Timer/>}/>
        </Routes>
    </Router>
  );
}

export default App;
