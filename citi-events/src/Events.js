import React, { useEffect, useState } from 'react';
import { Modal, Alert, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaThumbsUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
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

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [rsvpCounts, setRsvpCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userReactions, setUserReactions] = useState({});
  const [mediaModalUrl, setMediaModalUrl] = useState(null);
  const [mediaModalIsVideo, setMediaModalIsVideo] = useState(false);
  const [thumbnailScroll, setThumbnailScroll] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, rsvpRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/events`),
          axios.get(`${process.env.REACT_APP_API_URL}/rsvp-counts`),
        ]);

        const eventItems = itemsRes.data
          .filter((item) => item.type === 'event')
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

  const handleLike = async (eventId, e) => {
    e.stopPropagation();
    try {
      const fingerprint = await generateFingerprint();
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/event-likes/toggle`,
        { eventId, fingerprint }
      );

      setRsvpCounts(prev => ({
        ...prev,
        [eventId]: res.data.likeCount
      }));
      setUserReactions(prev => ({
        ...prev,
        [eventId]: res.data.action === 'like'
      }));

    } catch (err) {
      setError("Failed to update like");
    }
  };

  const generateFingerprint = async () => {
    try {
      const ipRes = await axios.get('https://ipapi.co/json/');
      const ip = ipRes.data.ip;
      const userAgent = navigator.userAgent;
      return `${ip}-${userAgent}`.hashCode();
    } catch {
      return `session-${Math.random().toString(36).substr(2, 9)}`;
    }
  };

  String.prototype.hashCode = function() {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
      hash = Math.imul(31, hash) + this.charCodeAt(i) | 0;
    }
    return hash.toString(16);
  };

  const isVideo = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  const openMediaModal = (url, e) => {
    e?.stopPropagation();
    setMediaModalUrl(url);
    setMediaModalIsVideo(isVideo(url));
  };

  const closeMediaModal = () => {
    setMediaModalUrl(null);
    setMediaModalIsVideo(false);
  };

  const renderThumbnails = (event) => {
    if (!event.media || event.media.length === 0) return null;

    const media = event.media;
    const eventId = event.id;
    const visibleCount = 4;
    const currentIndex = thumbnailScroll[eventId] || 0;
    const showLeftArrow = currentIndex > 0;
    const showRightArrow = currentIndex + visibleCount < media.length;
    const visibleMedia = media.slice(currentIndex, currentIndex + visibleCount);

    const arrowStyle = {
      cursor: 'pointer',
      fontSize: '1.8rem',
      color: colors.accent,
      userSelect: 'none',
      padding: '0 10px',
      alignSelf: 'center',
      fontWeight: 'bold',
      borderRadius: '4px',
      backgroundColor: '#2a3a5f',
    };

    const handleLeftClick = (e) => {
      e.stopPropagation();
      setThumbnailScroll((prev) => ({
        ...prev,
        [eventId]: Math.max(0, currentIndex - 1),
      }));
    };

    const handleRightClick = (e) => {
      e.stopPropagation();
      setThumbnailScroll((prev) => ({
        ...prev,
        [eventId]: Math.min(media.length - visibleCount, currentIndex + 1),
      }));
    };

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '8px',
          marginBottom: '16px',
        }}
      >
        {showLeftArrow && (
          <div
            onClick={handleLeftClick}
            style={arrowStyle}
            aria-label="Scroll thumbnails left"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleLeftClick(e);
            }}
          >
            ◀
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px', overflow: 'hidden' }}>
          {visibleMedia.map((mediaItem, idx) => (
            <img
              key={mediaItem.mediaId || mediaItem.url || idx}
              src={mediaItem.url}
              alt={mediaItem.filename || 'Media thumbnail'}
              style={{
                width: '80px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '2px solid transparent',
              }}
              onClick={(e) => openMediaModal(mediaItem.url, e)}
            />
          ))}
        </div>

        {showRightArrow && (
          <div
            onClick={handleRightClick}
            style={arrowStyle}
            aria-label="Scroll thumbnails right"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleRightClick(e);
            }}
          >
            ▶
          </div>
        )}
      </div>
    );
  };

  const renderMediaSection = (event) => {
    if (!event.media || event.media.length === 0) {
      if (event.posterUrl) {
        return (
          <img
            src={event.posterUrl}
            alt={event.title}
            style={{
              width: '100%',
              borderRadius: '8px',
              marginBottom: '12px',
              aspectRatio: '16/9',
              objectFit: 'cover',
              border: `1px solid ${colors.cardBorder}`,
              cursor: 'pointer',
            }}
            onClick={(e) => openMediaModal(event.posterUrl, e)}
          />
        );
      }
      return null;
    }

    if (event.posterUrl) {
      return (
        <>
          <img
            src={event.posterUrl}
            alt={event.title}
            style={{
              width: '100%',
              borderRadius: '8px',
              marginBottom: '12px',
              aspectRatio: '16/9',
              objectFit: 'cover',
              border: `1px solid ${colors.cardBorder}`,
              cursor: 'pointer',
            }}
            onClick={(e) => openMediaModal(event.posterUrl, e)}
          />
          {renderThumbnails(event)}
        </>
      );
    }

    const [firstMedia, ...otherMedia] = event.media;

    return (
      <>
        {firstMedia &&
          (isVideo(firstMedia.url) ? (
            <video
              controls
              src={firstMedia.url}
              style={{
                width: '100%',
                maxHeight: '400px',
                borderRadius: '8px',
                objectFit: 'contain',
                marginBottom: '12px',
                cursor: 'pointer',
              }}
              onClick={(e) => openMediaModal(firstMedia.url, e)}
            />
          ) : (
            <img
              src={firstMedia.url}
              alt={firstMedia.filename || 'Media'}
              style={{
                width: '100%',
                maxHeight: '400px',
                borderRadius: '8px',
                objectFit: 'cover',
                marginBottom: '12px',
                cursor: 'pointer',
              }}
              onClick={(e) => openMediaModal(firstMedia.url, e)}
            />
          ))}
        {otherMedia.length > 0 && renderThumbnails({ ...event, media: otherMedia })}
      </>
    );
  };

  const renderItemCard = (event) => {
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const isLiked = userReactions[event.id];

    return (
      <div
        key={event.id}
        style={{
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '12px',
          padding: '1.5rem',
          background: colors.cardBg,
          boxShadow: '0 8px 24px rgba(0,10,30,0.4)',
          marginBottom: '1.5rem',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 28px rgba(0,10,30,0.5)',
          }
        }}
        onClick={() => navigate(`/thisEvent/${event.id}`)}
      >
        <h3 style={{ color: colors.textPrimary }}>
          {event.title}
          <span
            style={{
              fontSize: '0.8rem',
              background: colors.accent,
              color: 'white',
              padding: '0.2rem 0.8rem',
              marginLeft: '1rem',
              borderRadius: '12px',
              fontWeight: 'bold',
            }}
          >
            Event
          </span>
        </h3>

        {renderMediaSection(event)}

        <p style={{ color: colors.textSecondary }}>{event.description}</p>
        <p style={{ color: colors.textSecondary }}>
          <strong style={{ color: colors.accent }}>Event Date:</strong> {formattedDate}
        </p>

        {event.requiresRsvp && (
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => handleLike(event.id, e)}
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                background: isLiked ? colors.accent2 : 'transparent',
                color: 'white',
                border: `1px solid ${isLiked ? colors.accent2 : colors.cardBorder}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                width: '40px',
                height: '40px',
              }}
              aria-label={isLiked ? 'Unlike this event' : 'Like this event'}
            >
              <FaThumbsUp size={16} color={isLiked ? 'white' : colors.textSecondary} />
            </button>
            <span style={{ color: colors.textSecondary }}>
              <strong style={{ color: colors.accent2 }}>{rsvpCounts[event.id] || 0}</strong>
              {' '}people interested
            </span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: colors.primaryBg,
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.primaryBg, minHeight: '100vh', padding: '80px 20px 20px' }}>
      <h2 style={{ color: colors.textPrimary, marginBottom: '2rem' }}>
        <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
        Upcoming Events
      </h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {events.length === 0 ? (
        <Alert variant="info" style={{ background: '#1A2E3A', borderColor: colors.accent, color: colors.textPrimary }}>
          No upcoming events. Check back later!
        </Alert>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {events.map(renderItemCard)}
        </div>
      )}

      <Modal show={!!mediaModalUrl} onHide={closeMediaModal} centered size="lg">
        <Modal.Body style={{ padding: 0 }}>
          {mediaModalIsVideo ? (
            <video controls autoPlay style={{ width: '100%', height: 'auto' }}>
              <source src={mediaModalUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img src={mediaModalUrl} alt="Preview" style={{ width: '100%', height: 'auto' }} />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Events;