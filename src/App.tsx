import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import MyEventsPage from "./pages/myevents";
import Events from "./pages/events"

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element = {<Events></Events>} />
        <Route path="/myevents" element = {<MyEventsPage />} />
        <Route path="/login" element = {<Login />} />
      </Routes>
    </Router>
  )
}

export default App
