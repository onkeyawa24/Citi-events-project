import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('event');
  const [rsvpRequired, setRsvpRequired] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Basic validation
    if (!title || !description) {
      alert('Please fill in Title and Description.');
      return;
    }
    if (type === 'event' && (!file || !date)) {
      alert('Please fill in all required event fields (Date, Poster).');
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = file ? reader.result.split(',')[1] : null;

      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/upload-poster`, {
          filename: file ? file.name : '',
          filedata: base64,
          title,
          description,
          date,
          type,
          requiresRsvp: rsvpRequired,
        });

        alert('✅ Upload successful!');
        // Reset form
        setFile(null);
        setTitle('');
        setDescription('');
        setDate('');
        setType('event');
        setRsvpRequired(false);
      } catch (err) {
        console.error('Upload failed:', err);
        alert('Upload failed: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      // For announcements without file
      reader.onloadend();
    }
  };

  return (
    <div className={isDarkMode ? 'dark-theme' : 'light-theme'} style={styles.container}>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Upload Poster</h2>

        <label style={styles.label}>
          Type
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={styles.input}
          >
            <option value="event">Event</option>
            <option value="announcement">Announcement</option>
          </select>
        </label>

        <label style={styles.label}>
          Title
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Description
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            style={styles.textarea}
          />
        </label>

        {type === 'event' && (
          <>
            <label style={styles.label}>
              Date
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                style={styles.input}
              />
            </label>

            <label style={{ ...styles.label, flexDirection: 'row', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={rsvpRequired}
                onChange={e => setRsvpRequired(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              RSVP Required
            </label>

            <label style={styles.label}>
              Poster Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                style={styles.input}
              />
            </label>

            {previewUrl && (
              <div style={styles.previewContainer}>
                <p>Preview:</p>
                <img src={previewUrl} alt="Poster preview" style={styles.previewImage} />
              </div>
            )}
          </>
        )}

        <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: '2rem auto',
    padding: 20,
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    fontFamily: 'Arial, sans-serif',
  },
  toggleBtn: {
    marginBottom: 20,
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: 4,
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: 12,
    fontWeight: 'bold',
    fontSize: 14,
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    marginTop: 4,
    padding: 8,
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #ccc',
    width: '100%',
  },
  textarea: {
    marginTop: 4,
    padding: 8,
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #ccc',
    width: '100%',
    resize: 'vertical',
    minHeight: 60,
  },
  previewContainer: {
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    maxHeight: 200,
    objectFit: 'contain',
    borderRadius: 4,
    border: '1px solid #ddd',
  },
  submitBtn: {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
};
