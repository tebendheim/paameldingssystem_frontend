import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Field = {
  id: number;
  label: string;
  field_type: string;
};

type Summary = {
  totalRegistrations: number;
  fieldSummaries: Record<string, Record<string, number>>; // f.eks. { "Skostørrelse": { "38": 3, "39": 5 } }
};

const MyEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [eventName, setEventName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    // Hent event-navn
    fetch(`http://localhost:3000/api/events/event/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setEventName(data.name))
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

  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>{eventName}</h1>

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

      <button onClick={handleEditFields}>Rediger felter</button>
      <button onClick={handleViewRegistrations} style={{ marginLeft: "1rem" }}>
        Se registrerte
      </button>
    </div>
  );
};

export default MyEvent;
