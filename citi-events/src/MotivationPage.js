import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MotivationPage() {
  const [motivations, setMotivations] = useState([]);
  const [todayMotivation, setTodayMotivation] = useState('');
  const [loading, setLoading] = useState(true);

  const getToday = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchMotivations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/motivation`);
        const data = res.data;
        setMotivations(data);
        showTodayMotivation(data);
      } catch (err) {
        console.error("Error fetching motivations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMotivations();
  }, []);

  const showTodayMotivation = (data) => {
    const today = getToday();
    const stored = JSON.parse(localStorage.getItem('motivationData')) || {};

    if (stored.date === today && stored.motivation) {
      setTodayMotivation(stored.motivation);
      return;
    }

    const shownIds = stored.shown || [];
    const unseen = data.filter(m => !shownIds.includes(m.id));
    let chosen;

    if (unseen.length === 0) {
      chosen = data[Math.floor(Math.random() * data.length)];
      localStorage.setItem('motivationData', JSON.stringify({
        date: today,
        motivation: chosen.motivation,
        shown: [chosen.id]
      }));
    } else {
      chosen = unseen[Math.floor(Math.random() * unseen.length)];
      localStorage.setItem('motivationData', JSON.stringify({
        date: today,
        motivation: chosen.motivation,
        shown: [...shownIds, chosen.id]
      }));
    }

    setTodayMotivation(chosen.motivation);
  };

  const handleRefresh = () => {
    if (motivations.length === 0) return;
    const random = motivations[Math.floor(Math.random() * motivations.length)];
    setTodayMotivation(random.motivation);
  };

  if (loading) return <p>Loading motivation...</p>;

  return (
    <div style={pageStyle}>
      <h2 style={headerStyle}>💡 Daily Motivation</h2>
      <div style={cardStyle}>
        <p style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>{todayMotivation}</p>
        <button style={{ ...buttonStyle, marginTop: '1rem' }} onClick={handleRefresh}>
          Refresh
        </button>
      </div>
    </div>
  );
}

// Styles (same as EventsPage)
const pageStyle = { padding: '2rem', fontFamily: 'Arial, sans-serif' };
const headerStyle = { fontSize: '2rem', marginBottom: '1rem' };
const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '1.5rem',
  background: '#fffbea',
  width: '100%',
  maxWidth: '500px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
};
const buttonStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '5px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  cursor: 'pointer'
};

export default MotivationPage;
