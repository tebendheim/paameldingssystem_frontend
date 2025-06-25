import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type Ticket = { name: string; price: number };

const EventSettings = () => {
  const { id } = useParams<{ id: string }>();

  const [isPaid, setIsPaid] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [message, setMessage] = useState('');

  // Hent eksisterende innstillinger
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3000/api/events/event/${id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setIsPaid(!!data.is_paid);
const sanitizedTickets = Array.isArray(data.tickets)
  ? data.tickets.map((t: any) => ({
      name: typeof t.name === 'string' ? t.name : '',
      price: typeof t.price === 'number' ? t.price : 0,
    }))
  : [];
        setTickets(sanitizedTickets);
      });
  }, [id]);

  const addTicket = () => {
    setTickets([...tickets, { name: '', price: 0 }]);
  };

  const updateTicketName = (index: number, name: string) => {
    setTickets((prev) =>
      prev.map((t, i) => (i === index ? { ...t, name } : t))
    );
  };

  const updateTicketPrice = (index: number, price: number) => {
    setTickets((prev) =>
      prev.map((t, i) => (i === index ? { ...t, price } : t))
    );
  };

  const removeTicket = (index: number) => {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  };

  const saveSettings = async () => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:3000/api/events/settings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          is_paid: isPaid,
          tickets: isPaid ? tickets.filter(t => t.name.trim()) : [],
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
            const paid:boolean = e.target.checked;
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
            <div key={idx} style={{ marginBottom: '0.5rem' }}>
                <input
                value={typeof ticket.name === 'string' ? ticket.name : ''}
                onChange={(e) => updateTicketName(idx, e.target.value)}
                placeholder="Navn på billett"
                />

                <input
  type="number"
  value={ticket.price ?? 0}
  onChange={(e) => {
    const parsed = Number(e.target.value);
    updateTicketPrice(idx, isNaN(parsed) ? 0 : parsed);
  }}
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