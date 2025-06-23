import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../functions/auth";

type Event = {
  id: number;
  name: string;
  event_date: string;
  created_at: string;
  owner_id: number;
};

const MyEventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
        navigate("/");
    }else{
        console.error("utlogging feilet");
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch("http://localhost:3000/api/events/my-events", {
        credentials: "include", // viktig for session-cookie!
      });

      if (res.status === 401) {
        // Ikke logget inn -> redirect
        navigate("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      } else {
        console.error("Feil ved henting av eventer");
      }

      setLoading(false);
    };

    fetchEvents();
  }, [navigate]);

  if (loading) return <p>Laster inn...</p>;

  return (
    <div>
      <h1>Dine arrangementer</h1>
      {events.length === 0 ? (
        <p>Du har ikke opprettet noen arrangementer.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <strong>{event.name}</strong> – {new Date(event.event_date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleLogout}>Logg ut</button>
    </div>
  );
};

export default MyEventsPage;
