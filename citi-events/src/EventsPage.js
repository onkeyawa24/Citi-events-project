import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getEvents } from './api';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpCounts, setRsvpCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEvents();
        const eventItems = res.data.filter(item => item.type === 'event');
        setEvents(eventItems);

        const rsvpRes = await axios.get(`${process.env.REACT_APP_API_URL}/rsvp-counts`);
        setRsvpCounts(rsvpRes.data);
      } catch (err) {
        console.error("Error loading events or counts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRsvp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/submit-rsvp`, {
        name: rsvpName,
        email: rsvpEmail,
        eventId: selectedEvent.eventId
      });
      alert("✅ RSVP submitted!");
      setRsvpName('');
      setRsvpEmail('');
      setSelectedEvent(null);
    } catch (err) {
      console.error("RSVP failed:", err);
      alert("❌ Failed to submit RSVP");
    }
  };

  if (loading) return <p>Loading events...</p>;

  return (
    <div style={pageStyle}>
      <h2 style={headerStyle}>🎉 Upcoming Events</h2>
      <div style={gridStyle}>
        {events.length === 0 ? (
          <p>No events available yet.</p>
        ) : (
          events.map((event) => (
            <div key={event.eventId} style={cardStyle}>
              <h3>{event.title}</h3>
              {event.posterUrl && (
                <img
                  src={event.posterUrl}
                  alt={event.title}
                  style={imageStyle}
                />
              )}
              <p>{event.description}</p>
              <p><strong>Date:</strong> {event.date}</p>
              {event.requiresRsvp && (
                <>
                  <p style={{ margin: '8px 0' }}>
                    {rsvpCounts[event.eventId] || 0} people have RSVPed
                  </p>
                  <button style={buttonStyle} onClick={() => setSelectedEvent(event)}>
                    RSVP
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {selectedEvent && (
        <div style={modalStyle}>
          <h3>RSVP for {selectedEvent.title}</h3>
          <form onSubmit={handleRsvp}>
            <input
              type="text"
              placeholder="Your name"
              value={rsvpName}
              onChange={e => setRsvpName(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Your email"
              value={rsvpEmail}
              onChange={e => setRsvpEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>Submit RSVP</button>
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              style={{ ...buttonStyle, backgroundColor: '#ccc', marginLeft: '10px' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Styles
const pageStyle = { padding: '2rem', fontFamily: 'Arial, sans-serif' };
const headerStyle = { fontSize: '2rem', marginBottom: '1rem' };
const gridStyle = { display: 'flex', flexWrap: 'wrap', gap: '1.5rem' };
const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '1rem',
  background: '#f9f9f9',
  width: '300px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
};
const imageStyle = { maxWidth: '100%', borderRadius: '6px', marginBottom: '10px' };
const modalStyle = {
  marginTop: '2rem',
  padding: '1.5rem',
  background: '#eef7ff',
  border: '1px solid #007bff',
  borderRadius: '8px',
  maxWidth: '400px'
};
const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  marginBottom: '0.75rem',
  borderRadius: '4px',
  border: '1px solid #ccc'
};
const buttonStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '5px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  cursor: 'pointer'
};

export default EventsPage;
