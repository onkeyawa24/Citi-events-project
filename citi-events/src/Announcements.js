// src/AnnouncementsPage.js
import React, { useEffect, useState } from 'react';
import { getEvents } from './api';

const colors = {
  background: '#161F36',
  cardBg: '#1E2A4A',
  cardBorder: '#2A3A5F',
  textPrimary: '#E0E7FF',
  textSecondary: '#A5B4FC',
  accent: '#4A65B5'
};

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then((res) => {
        const announcementItems = res.data.filter(item => item.type === 'announcement');
        setAnnouncements(announcementItems);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading announcements:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={styles.loading}>Loading announcements...</p>;

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>📢 Latest Announcements</h2>
      {announcements.length === 0 ? (
        <p style={styles.noData}>No announcements available yet.</p>
      ) : (
        <div style={styles.grid}>
          {announcements.map((item) => (
            <div key={item.id} style={styles.card}>
              {item.posterUrl && (
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  style={styles.image}
                />
              )}
              <h4 style={styles.title}>{item.title}</h4>
              <p style={styles.description}>{item.description}</p>
              <small style={styles.date}>
                Posted: {new Date(item.postedDate || item.uploadedAt).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: '80px 20px 40px',
    background: '#161F36',
    minHeight: '100vh',
    color: '#E0E7FF',
    fontFamily: 'Arial, sans-serif'
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#A5B4FC'
  },
  noData: {
    textAlign: 'center',
    color: '#A5B4FC'
  },
  loading: {
    textAlign: 'center',
    marginTop: '4rem',
    color: '#A5B4FC'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    background: '#1E2A4A',
    border: '1px solid #2A3A5F',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.3s ease',
  },
  image: {
    width: '100%',
    borderRadius: '8px',
    marginBottom: '1rem',
    aspectRatio: '16/9',
    objectFit: 'cover',
    border: '1px solid #2A3A5F'
  },
  title: {
    marginBottom: '0.5rem',
    color: '#E0E7FF',
    fontSize: '1.25rem'
  },
  description: {
    fontSize: '0.95rem',
    color: '#A5B4FC',
    marginBottom: '0.75rem',
    lineHeight: '1.5',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical'
  },
  date: {
    color: '#6381F5',
    fontSize: '0.8rem',
    marginTop: 'auto'
  }
};

export default Announcements;
