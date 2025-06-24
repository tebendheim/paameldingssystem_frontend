import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EventRegistrations() {
  const { id } = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/events/event/${id}/registrations`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Kun eier av arrangementet har tilgang");
        }

        const data = await res.json();
        setEventData(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchRegistrations();
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!eventData) return <div>Laster...</div>;

  return (
    <div>
      <h1>{eventData.event.name}</h1>
      <p>Dato: {new Date(eventData.event.event_date).toLocaleString()}</p>
      <p>Totalt antall påmeldte: {eventData.totalRegistrations}</p>

      <ul>
        {eventData.registrations.map((reg: any, idx: number) => (
          <li key={idx} style={{ marginBottom: "1rem", padding: "0.5rem", border: "1px solid #ccc" }}>
            <p><strong>Email:</strong> {reg.email}</p>
            <p><strong>Registrert:</strong> {new Date(reg.registration_date).toLocaleString()}</p>
            {reg.payment_date && <p><strong>Betalt:</strong> {new Date(reg.payment_date).toLocaleString()}</p>}
            {reg.fields.length > 0 && (
              <ul>
                {reg.fields.map((f: any, i: number) => (
                  <li key={i}>
                    <strong>{f.label}:</strong> {f.value}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

