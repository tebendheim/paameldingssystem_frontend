import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../functions/auth";

type EventType = {
  id: number;
  name: string;
  event_date: string;
  created_at: string;
  owner_id: number;
};

const AllEvents = () => {
  const [events, setEvents] = useState<EventType[]>([]);
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
      const res = await fetch("http://localhost:3000/api/events/events", {
        credentials: "include", // viktig for session-cookie!
      });

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
      <button
        onClick={() => navigate(`/event/${event.id}`)}
        style={{
          background: "none",
          border: "none",
          color: "blue",
          textDecoration: "underline",
          cursor: "pointer",
          fontSize: "1em"
        }}
      >
        {event.name}
      </button>
      {" – "}
      {new Date(event.event_date).toLocaleDateString()}
    </li>
  ))}
        </ul>
      )}
    </div>
  );
};

export default AllEvents;