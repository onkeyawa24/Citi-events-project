import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';

const colors = {
  primaryBg: '#161F36',
  cardBg: '#1E2A4A',
  cardBorder: '#2A3A5F',
  textPrimary: '#E0E7FF',
  textSecondary: '#A5B4FC',
  accent: '#4A65B5',
  accent2: '#702963',
  accentLight: '#6381F5',
  success: '#2DD4BF',
  error: '#FB7185',
  warning: '#FACC15'
};

function MotivationPage() {
  const [motivations, setMotivations] = useState([]);
  const [todayMotivation, setTodayMotivation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToday = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchMotivations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/motivation`);
        const data = res.data;
        setMotivations(data);
        showTodayMotivation(data);
      } catch (err) {
        setError(`Failed to load motivation: ${err.message}`);
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

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: colors.primaryBg,
        padding: '3rem',
        textAlign: 'center'
      }}>
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        backgroundColor: colors.primaryBg,
        padding: '3rem',
        textAlign: 'center',
        color: colors.error
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.primaryBg} 0%, #0F172A 100%)`,
      padding: '4rem 2rem',
      margin: '0 -2rem 2rem',
      borderBottom: `1px solid ${colors.cardBorder}`
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          background: colors.cardBg,
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          position: 'relative',
          border: `1px solid ${colors.cardBorder}`,
          maxWidth: '800px',
          width: '100%'
        }}>
          <span style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: colors.accent2,
            color: 'white',
            padding: '0.5rem 2rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            boxShadow: `0 4px 12px ${colors.accent2}40`
          }}>
            DAILY MOTIVATION
          </span>
          
          <p style={{
            fontSize: '1.5rem',
            lineHeight: '1.8',
            fontStyle: 'italic',
            margin: '2rem 0',
            position: 'relative',
            color: colors.textPrimary
          }}>
            <span style={{
              position: 'absolute',
              left: '-40px',
              top: '-20px',
              fontSize: '4rem',
              color: `${colors.accent2}30`,
              lineHeight: 1,
              fontFamily: 'serif'
            }}>“</span>
            
            {todayMotivation}
            
            <span style={{
              position: 'absolute',
              right: '-40px',
              bottom: '-30px',
              fontSize: '4rem',
              color: `${colors.accent2}30`,
              lineHeight: 1,
              fontFamily: 'serif'
            }}>”</span>
          </p>
          
          <div style={{
            height: '3px',
            background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.accent2} 100%)`,
            borderRadius: '2px',
            margin: '1.5rem 0',
            width: '50%',
            marginLeft: 'auto',
            marginRight: 'auto'
          }} />
          
          <button 
            onClick={handleRefresh}
            style={{
              background: colors.accent2,
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              margin: '0 auto',
              fontSize: '1rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              ':hover': {
                background: '#8A3A78',
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${colors.accent2}80`
              }
            }}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white"
              strokeWidth="2"
            >
              <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round"/>
            </svg>
            New Inspiration
          </button>
        </div>
      </div>
    </div>
  );
}

export default MotivationPage;
