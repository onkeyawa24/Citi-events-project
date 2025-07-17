// src/Events.js
import React, { useEffect, useState } from 'react';
import { Modal, Alert, Spinner } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import './navbarPage.css';

const colors = {
  primaryBg: '#161F36',
  cardBg: '#1E2A4A',
  cardBorder: '#2A3A5F',
  textPrimary: '#E0E7FF',
  textSecondary: '#A5B4FC',
  accent: '#4A65B5',
  accent2: '#702963',
  accentLight: '#6381F5',
};

const Rsvp = () => {
  const [events, setEvents] = useState([]);
  const [rsvpCounts, setRsvpCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, rsvpRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/events`),
          axios.get(`${process.env.REACT_APP_API_URL}/rsvp-counts`)
        ]);

        const eventItems = itemsRes.data
          .filter(item => item.type === 'event' && item.requiresRsvp)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setEvents(eventItems);
        setRsvpCounts(rsvpRes.data);
      } catch (err) {
        setError(`Failed to load events: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRsvp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!rsvpName || !rsvpEmail) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/submit-rsvp`, {
        name: rsvpName,
        email: rsvpEmail,
        eventId: selectedEvent?.eventId
      });

      setSuccess('✅ RSVP submitted successfully!');
      setRsvpName('');
      setRsvpEmail('');

      const rsvpRes = await axios.get(`${process.env.REACT_APP_API_URL}/rsvp-counts`);
      setRsvpCounts(rsvpRes.data);

      setTimeout(() => {
        setShowModal(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit RSVP';
      setError(`❌ ${errorMsg}`);
    }
  };

  const renderItemCard = (event) => {
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
      <div key={event.eventId} style={{
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        background: colors.cardBg,
        boxShadow: '0 8px 24px rgba(0,10,30,0.4)',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ color: colors.textPrimary }}>
          {event.title}
          <span style={{
            fontSize: '0.8rem',
            background: colors.accent,
            color: 'white',
            padding: '0.2rem 0.8rem',
            marginLeft: '1rem',
            borderRadius: '12px',
            fontWeight: 'bold'
          }}>
            Event
          </span>
        </h3>

        {event.posterUrl && (
          <img
            src={event.posterUrl}
            alt={event.title}
            style={{
              width: '100%',
              borderRadius: '8px',
              marginBottom: '16px',
              aspectRatio: '16/9',
              objectFit: 'cover',
              border: `1px solid ${colors.cardBorder}`
            }}
          />
        )}

        <p style={{ color: colors.textSecondary }}>{event.description}</p>
        <p style={{ color: colors.textSecondary }}>
          <strong style={{ color: colors.accent }}>Event Date:</strong> {formattedDate}
        </p>

        <p style={{ color: colors.textSecondary }}>
          <strong style={{ color: colors.accent2 }}>
            {rsvpCounts[event.eventId] || 0}
          </strong> people attending
        </p>
        <button
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: `linear-gradient(135deg, ${colors.accent2} 0%, #8A3A78 100%)`,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            fontWeight: '600'
          }}
          onClick={() => {
            setSelectedEvent(event);
            setShowModal(true);
          }}
        >
          RSVP Now
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: colors.primaryBg,
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.primaryBg, minHeight: '100vh', padding: '80px 20px 20px' }}>
      <h2 style={{ color: colors.textPrimary, marginBottom: '2rem' }}>
        <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
        RSVP Events
      </h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {events.length === 0 ? (
        <Alert variant="info" style={{ background: '#1A2E3A', borderColor: colors.accent, color: colors.textPrimary }}>
          No RSVP events available. Check back later!
        </Alert>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {events.map(renderItemCard)}
        </div>
      )}

      {/* RSVP Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>RSVP for {selectedEvent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <form onSubmit={handleRsvp}>
            <input
              type="text"
              placeholder="Your name"
              value={rsvpName}
              onChange={(e) => setRsvpName(e.target.value)}
              required
              className="form-control mb-2"
            />
            <input
              type="email"
              placeholder="Your email"
              value={rsvpEmail}
              onChange={(e) => setRsvpEmail(e.target.value)}
              required
              className="form-control mb-3"
            />
            <div className="d-flex justify-content-between">
              <button className="btn btn-primary" type="submit">Submit</button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Rsvp;
