import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUserCircle, FaBell, FaCalendarAlt, FaBullhorn } from 'react-icons/fa';
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
  success: '#2DD4BF',
  error: '#FB7185',
  warning: '#FACC15'
};

const EventsPageWithNavbar = () => {
  const [allItems, setAllItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpCounts, setRsvpCounts] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'announcements'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, rsvpRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/events`),
          axios.get(`${process.env.REACT_APP_API_URL}/rsvp-counts`)
        ]);

        const items = itemsRes.data;
        setAllItems(items);
        
        // Process events
        const eventItems = items
          .filter(item => item.type === 'event')
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(eventItems);
        
        // Process announcements
        const announcementItems = items
          .filter(item => item.type === 'announcement')
          .sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
        setAnnouncements(announcementItems);
        
        // Only show events requiring RSVP in notifications
        setNotifications(eventItems.filter(event => event.requiresRsvp));
        setRsvpCounts(rsvpRes.data);
      } catch (err) {
        setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
        console.error("API Error:", err);
        setNotifications([]);
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
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/submit-rsvp`,
        {
          name: rsvpName,
          email: rsvpEmail,
          eventId: selectedEvent?.eventId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

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
      console.error("RSVP Error:", err);
    }
  };

  const renderItemCard = (item) => {
    const isEvent = item.type === 'event';
    const displayDate = isEvent ? item.date : item.postedDate;
    const formattedDate = displayDate 
      ? new Date(displayDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : 'Date not specified';

    return (
      <div 
        key={item.eventId} 
        style={{
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '12px',
          padding: '1.5rem',
          background: colors.cardBg,
          boxShadow: '0 8px 24px rgba(0,10,30,0.4)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          marginBottom: '1.5rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,15,40,0.5)';
          e.currentTarget.style.borderColor = colors.accent2;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,10,30,0.4)';
          e.currentTarget.style.borderColor = colors.cardBorder;
        }}
      >
        <h3 style={{ 
          marginTop: 0,
          color: colors.textPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {item.title}
          <span style={{
            fontSize: '0.8rem',
            background: isEvent ? colors.accent : colors.accent2,
            color: 'white',
            padding: '0.2rem 0.8rem',
            borderRadius: '12px',
            fontWeight: 'bold'
          }}>
            {isEvent ? 'Event' : 'Announcement'}
          </span>
        </h3>
        
        {item.posterUrl && (
          <img
            src={item.posterUrl}
            alt={item.title}
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
        
        <p style={{ 
          marginBottom: '0.5rem',
          color: colors.textSecondary
        }}>
          {item.description}
        </p>
        
        <p style={{ 
          color: colors.textSecondary,
          marginBottom: '1rem'
        }}>
          <strong style={{ color: isEvent ? colors.accent : colors.accent2 }}>
            {isEvent ? 'Event Date: ' : 'Posted: '}
          </strong> 
          {formattedDate}
        </p>
        
        {isEvent && item.requiresRsvp && (
          <>
            <p style={{ 
              margin: '16px 0',
              color: colors.textSecondary
            }}>
              <strong style={{ color: colors.accent2 }}>
                {rsvpCounts[item.eventId] || 0}
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
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 4px 12px ${colors.accent2}80`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = '';
                e.target.style.boxShadow = '';
              }}
              onClick={() => {
                setSelectedEvent(item);
                setShowModal(true);
              }}
            >
              RSVP Now
            </button>
          </>
        )}
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
    <div style={{ backgroundColor: colors.primaryBg, minHeight: '100vh' }}>
      {/* Navbar (unchanged) */}
      <Navbar fixed="top" expand="lg" bg="dark" variant="dark" className="shadow-sm py-2" style={{ backgroundColor: '#111827' }}>
        {/* ... existing navbar code ... */}
      </Navbar>

      {/* Main Content */}
      <div style={{ 
        padding: '80px 20px 20px', 
        fontFamily: 'Arial, sans-serif',
        color: colors.textPrimary
      }}>
        {error && (
          <Alert 
            variant="danger" 
            onClose={() => setError(null)} 
            dismissible
            style={{
              backgroundColor: '#2E1D2B',
              borderColor: colors.error,
              color: colors.textPrimary
            }}
          >
            {error}
          </Alert>
        )}
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          gap: '1rem'
        }}>
          <button
            onClick={() => setActiveTab('events')}
            style={{
              background: activeTab === 'events' ? colors.accent : 'transparent',
              color: activeTab === 'events' ? 'white' : colors.textSecondary,
              border: `1px solid ${activeTab === 'events' ? colors.accent : colors.cardBorder}`,
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            <FaCalendarAlt />
            Events ({events.length})
          </button>
          
          <button
            onClick={() => setActiveTab('announcements')}
            style={{
              background: activeTab === 'announcements' ? colors.accent2 : 'transparent',
              color: activeTab === 'announcements' ? 'white' : colors.textSecondary,
              border: `1px solid ${activeTab === 'announcements' ? colors.accent2 : colors.cardBorder}`,
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            <FaBullhorn />
            Announcements ({announcements.length})
          </button>
        </div>
        
        {activeTab === 'events' ? (
          events.length === 0 ? (
            <Alert 
              variant="info"
              style={{
                backgroundColor: '#1A2E3A',
                borderColor: colors.accent,
                color: colors.textPrimary,
                textAlign: 'center'
              }}
            >
              No upcoming events. Check back later!
            </Alert>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1.5rem'
            }}>
              {events.map(renderItemCard)}
            </div>
          )
        ) : (
          announcements.length === 0 ? (
            <Alert 
              variant="info"
              style={{
                backgroundColor: '#1A2E3A',
                borderColor: colors.accent2,
                color: colors.textPrimary,
                textAlign: 'center'
              }}
            >
              No announcements available.
            </Alert>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1.5rem'
            }}>
              {announcements.map(renderItemCard)}
            </div>
          )
        )}
      </div>

      {/* RSVP Modal (unchanged) */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered
        contentClassName="border-0"
      >
        {/* ... existing modal code ... */}
      </Modal>
    </div>
  );
};

export default EventsPageWithNavbar;