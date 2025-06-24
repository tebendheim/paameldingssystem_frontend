import { useParams } from "react-router-dom";
import { useEffect, useState} from "react";
import type { FormEvent } from "react";

type EventType = {
  id: number;
  name: string;
  event_date: string;
  created_at: string;
};

type EventField = {
  id: number;
  label: string;
  field_type: string;
  is_required: boolean;
};

export default function EventRegister() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventType | null>(null);
  const [fields, setFields] = useState<EventField[]>([]);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    // Hent event
    fetch(`http://localhost:3000/api/events/event/${id}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(err => console.error("Event-feil:", err));

    // Hent felter
    fetch(`http://localhost:3000/api/events/event/${id}/fields`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setFields(data))
      .catch(err => console.error("Felt-feil:", err));
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const response = await fetch(`http://localhost:3000/api/registration/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        fieldValues: fields.map(field => ({
          event_field_id: field.id,
          value: formData[field.id] || "",
        })),
      }),
    });

    if (response.ok) {
      setSuccessMessage("Du er registrert!");
      setFormData({});
      setEmail("");
    } else {
      console.error("Registrering feilet");
    }
  };

  if (!event) return <p>Laster...</p>;

  return (
    <div>
      <h1>Registrer deg til: {event.name}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          E-post:
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {fields.map((field) => (
          <div key={field.id}>
            <label>
              {field.label} {field.is_required && "*"}
              <input
                type={field.field_type === "number" ? "number" : "text"}
                required={field.is_required}
                value={formData[field.id] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field.id]: e.target.value })
                }
              />
            </label>
          </div>
        ))}

        <button type="submit">Registrer</button>
      </form>
      {successMessage && <p>{successMessage}</p>}
    </div>
  );
}


