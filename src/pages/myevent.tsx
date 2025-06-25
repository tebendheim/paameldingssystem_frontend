import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Field = {
  id: number;
  label: string;
  field_type: string;
};

type Summary = {
  totalRegistrations: number;
  fieldSummaries: Record<string, Record<string, number>>;
};

type Ticket = {
  name: string;
  price: number;
};

const MyEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [eventName, setEventName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    // Hent event
    fetch(`http://localhost:3000/api/events/event/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setEventName(data.name);
        setIsPaid(data.is_paid); // antar backend returnerer `is_paid`
        setTickets(data.tickets || []);
      })
      .catch((err) => setError("Klarte ikke å hente event"));

    // Hent felter
    fetch(`http://localhost:3000/api/fields/event/${id}/fields`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setFields(data));

    // Hent oppsummering
    fetch(`http://localhost:3000/api/events/${id}/registrations/summary`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch(() => setSummary(null));
  }, [id]);

  const handleEditFields = () => {
    navigate(`/myevent/${id}/edit-fields`);
  };

  const handleViewRegistrations = () => {
    navigate(`/myevent/${id}/registrations`);
  };

  const handleEditSettings = () => {
    navigate(`/myevent/${id}/settings`);
  };

  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>{eventName}</h1>

      {/* Oppsummering */}
      {summary && (
        <div>
          <p><strong>Antall registrerte:</strong> {summary.totalRegistrations}</p>

          {fields.map((field) => (
            <div key={field.id}>
              <h4>{field.label}</h4>
              <ul>
                {summary.fieldSummaries?.[field.label] &&
                  Object.entries(summary.fieldSummaries[field.label]).map(([value, count]) => (
                    <li key={value}>{value}: {count}</li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Knapper */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleViewRegistrations}>Se registrerte</button>
        <button onClick={handleEditFields} style={{ marginLeft: "1rem" }}>Rediger felter</button>
        <button onClick={handleEditSettings} style={{ marginLeft: "1rem" }}>Innstillinger</button>
      </div>

      {/* Innstillinger-visning */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Innstillinger</h3>
        <p><strong>Betalt event:</strong> {isPaid ? "Ja" : "Nei"}</p>

        {isPaid && (
          <div>
            <h4>Billettyper</h4>
            {tickets.length === 0 ? (
              <p>Ingen billettyper lagt til.</p>
            ) : (
              <ul>
                {tickets.map((ticket, idx) => (
                  <li key={idx}>
                    {ticket.name} – {ticket.price} kr
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvent;
