import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import MyEventsPage from "./pages/myevents";
import AllEvents from "./pages/allevents"
import EventRegister from "./pages/eventregister";
import EventRegistrations from "./pages/eventregistrations";
import ProtectedRoute from "./functions/protectedRoute";

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element = {<AllEvents />} />

        <Route path="/login" element = {<Login />} />
        <Route path="/event/:id" element={<EventRegister />} />
        <Route element = {<ProtectedRoute />}>
          <Route path="/myevents" element = {<MyEventsPage />} />
          <Route path="/myevents/:id/registrations" element={<EventRegistrations />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
