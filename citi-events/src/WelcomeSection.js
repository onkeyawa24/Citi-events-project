import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

const WelcomeSection = () => {
  const navigate = useNavigate();
  const [latestEvents, setLatestEvents] = useState([]);
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, motivationRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/events`),
          axios.get(`${process.env.REACT_APP_API_URL}/motivation`)
        ]);

        const events = eventsRes.data
          .filter(item => item.type === 'event')
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);

        const randomMotivation = motivationRes.data.length > 0
          ? motivationRes.data[Math.floor(Math.random() * motivationRes.data.length)]
          : '';

        setLatestEvents(events);
        setMotivation(randomMotivation.motivation);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      minHeight: '100vh',
      width: '100%'
    }}>
      {/* Left: Image Background */}
      <div style={{
        flex: '1 1 70%',
        minHeight: '300px',
        backgroundImage: 'url(https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          color: 'white',
          textAlign: 'center',
          maxWidth: '600px',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to Citi Events</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Discover exciting upcoming events and announcements from our campus community.
            Whether you're here to learn, grow, or connect — there's always something happening.
          </p>
          <button 
            onClick={() => navigate('/events')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: colors.accent,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                backgroundColor: colors.accentLight,
                transform: 'translateY(-2px)'
              }
            }}
          >
            View Events
          </button>
        </div>
      </div>

      {/* Right: Motivation + Events */}
      <div style={{
        flex: '1 1 30%',
        backgroundColor: colors.primaryBg,
        padding: '2rem',
        color: colors.textPrimary,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Motivation */}
        <div style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: colors.accent2,
            color: 'white',
            padding: '0.25rem 1rem',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}>
            MOTIVATION
          </div>
          <p style={{
            fontStyle: 'italic',
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: colors.textSecondary
          }}>
            {motivation}
          </p>
        </div>

        {/* Upcoming Events */}
        <div style={{ flex: 1 }}>
          <h4 style={{ borderBottom: `2px solid ${colors.cardBorder}`, paddingBottom: '0.5rem' }}>
            Recent Events
          </h4>

          <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '1rem' }}>
            {latestEvents.map((event, index) => (
              <li key={event.id || index} style={{
                display: 'flex',
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
              }}>
                {/* Image */}
                {event.posterUrl && (
                  <div style={{
                    flex: '0 0 30%',
                    minWidth: '100px',
                    maxWidth: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem'
                  }}>
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '80px',
                        objectFit: 'cover',
                        borderRadius: '6px'
                      }}
                    />
                  </div>
                )}

                {/* Text */}
                <div style={{
                  flex: '1 1 70%',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h5 style={{ margin: 0, color: colors.textPrimary }}>{event.title}</h5>
                  <p style={{
                    margin: '0.25rem 0 0.5rem',
                    color: colors.textSecondary,
                    fontSize: '0.9rem',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>{event.description}</p>
                  <small style={{ color: colors.accentLight }}>
                    {new Date(event.date).toLocaleDateString()}
                  </small>
                </div>
              </li>
            ))}
          </ul>

          {/* View Events Button */}
          <button 
            onClick={() => navigate('/events')}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: colors.accent,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '1rem',
              ':hover': {
                backgroundColor: colors.accentLight
              }
            }}
          >
            View All Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;