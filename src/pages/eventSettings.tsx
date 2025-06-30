import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type Ticket = { name: string; price: string | null, id?:number };

const EventSettings = () => {
  const { id } = useParams<{ id: string }>();

  const [isPaid, setIsPaid] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [message, setMessage] = useState('');

  // Hent eksisterende innstillinger
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3000/api/events/tickets/${id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
  setIsPaid(true); // Sett manuelt eller hent fra en annen kilde
  const sanitizedTickets = Array.isArray(data)
  ? data.map((t: any) => ({
      id: typeof t.id === 'number' ? t.id : undefined,
      name: typeof t.name === 'string' ? t.name : '',
      price: typeof t.price === 'string' ? t.price : "0.00",
    }))
  : [];
  setTickets(sanitizedTickets);
      });
  }, [id]);

  const updateTicketPrice = (index: number, price: string) => {
  setTickets(prev =>
    prev.map((t, i) => (i === index ? { ...t, price } : t))
  );
};
// On blur (when user leaves input), format to 2 decimals:
const formatPrice = (price: string) => {
  const num = parseFloat(price);
  if (isNaN(num) || num < 0) return "0.00";
  return num.toFixed(2);
};

  const addTicket = () => {
    setTickets([...tickets, { name: '', price: "0" }]);
  };

  const updateTicketName = (index: number, name: string) => {
    setTickets((prev) =>
      prev.map((t, i) => (i === index ? { ...t, name } : t))
    );
  };

//   const updateTicketPrice = (index: number, price: number) => {
//     setTickets((prev) =>
//       prev.map((t, i) => (i === index ? { ...t, price } : t))
//     );
//   };

  const removeTicket = (index: number) => {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  };

const saveSettings = async () => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:3000/api/events/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          is_paid: isPaid,
          tickets: isPaid
            ? tickets
                .filter(t => 
                    t.name.trim() && 
                    t.price !== null && 
                    !isNaN(parseFloat(t.price!)) &&  // non-null assertion since you checked above
                    parseFloat(t.price!) >= 0
                )
                .map(t => ({
                    id: t.id,
                    name: t.name.trim(),
                    price: parseFloat(t.price!),  // ! tells TypeScript it's definitely a string here
                }))
            : [],
        }),
      });
            setMessage(res.ok ? 'Innstillinger lagret!' : 'Feil ved lagring.');
    } catch (err) {
      console.error(err);
      setMessage('Noe gikk galt...');
    }
  };


  return (
    <div>
      <h2>Eventinnstillinger</h2>

      <label>
        <input
          type="checkbox"
          checked={isPaid}
          onChange={(e) => {
            const paid = e.target.checked;
            setIsPaid(paid);
            if (!paid) setTickets([]);
          }}
        />
        Dette eventet koster penger
      </label>

      {isPaid && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Billettyper</h4>
          {tickets.map((ticket, idx) => (
            <div key={ticket.id ?? `new-${idx}`} style={{ marginBottom: '0.5rem' }}>
              <input
                value={ticket.name}
                onChange={(e) => updateTicketName(idx, e.target.value)}
                placeholder="Navn på billett"
              />
            <input
            type="number"
            step="0.01"
            inputMode="decimal"
            value={ticket.price !== null ? ticket.price : ''}
            onChange={(e) => updateTicketPrice(idx, e.target.value)}
            onBlur={(e) => updateTicketPrice(idx, formatPrice(e.target.value))}
            placeholder="Pris"
            min="0"
            />
              <button onClick={() => removeTicket(idx)}>🗑</button>
            </div>
          ))}
          <button type="button" onClick={addTicket}>
            + Legg til billettype
          </button>
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={saveSettings}>Lagre innstillinger</button>
      </div>

      {message && <p style={{ marginTop: '0.5rem' }}>{message}</p>}
    </div>
  );
};

export default EventSettings;