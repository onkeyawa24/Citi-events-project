import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Spinner } from 'react-bootstrap';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function UploadForm({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'event',
    requiresRsvp: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title || !formData.description) {
      setError('Please fill in Title and Description');
      return;
    }
    if (formData.type === 'event' && (!file || !formData.date)) {
      setError('Events require both a date and poster image');
      return;
    }

    setLoading(true);

    try {
     

      // Prepare payload
      const payload = {
        ...formData,
        files: []
      };

      // Add file if exists
      if (file) {
        const fileBase64 = await toBase64(file);
        payload.files.push({
          filename: file.name,
          filedata: fileBase64.split(',')[1], // Remove data URL prefix
          contentType: file.type
        });
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload-events`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
           
          }
        }
      );

      if (response.status === 200) {
        alert('✅ Upload successful!');
        // Reset form
        setFile(null);
        setFormData({
          title: '',
          description: '',
          date: '',
          type: 'event',
          requiresRsvp: false
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error('Upload error:', err);
      let errorMsg = 'Upload failed';
      
      if (err.response) {
        errorMsg += `: ${err.response.data?.error || err.response.statusText}`;
      } else if (err.request) {
        errorMsg += ': No response from server';
      } else {
        errorMsg += `: ${err.message}`;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert file to base64
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#1E2A4A',
      borderRadius: '8px',
      border: '1px solid #2A3A5F'
    }}>
      <h2 style={{ color: '#E0E7FF', marginBottom: '20px' }}>
        Create New {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
      </h2>

      {error && (
        <Alert variant="danger" style={{ marginBottom: '20px' }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="type" className="form-label" style={{ color: '#E0E7FF' }}>Type</label>
          <select
            id="type"
            name="type"
            className="form-control"
            value={formData.type}
            onChange={handleInputChange}
            style={{ backgroundColor: '#2A3A5F', color: '#E0E7FF', border: '1px solid #3A4B6F' }}
          >
            <option value="event">Event</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="title" className="form-label" style={{ color: '#E0E7FF' }}>Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleInputChange}
            required
            style={{ backgroundColor: '#2A3A5F', color: '#E0E7FF', border: '1px solid #3A4B6F' }}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label" style={{ color: '#E0E7FF' }}>Description*</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="3"
            style={{ backgroundColor: '#2A3A5F', color: '#E0E7FF', border: '1px solid #3A4B6F' }}
          />
        </div>

        {formData.type === 'event' && (
          <>
            <div className="mb-3">
              <label htmlFor="date" className="form-label" style={{ color: '#E0E7FF' }}>Event Date*</label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleInputChange}
                required
                style={{ backgroundColor: '#2A3A5F', color: '#E0E7FF', border: '1px solid #3A4B6F' }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="file" className="form-label" style={{ color: '#E0E7FF' }}>Poster Image*</label>
              <input
                type="file"
                id="file"
                className="form-control"
                onChange={handleFileChange}
                accept="image/*"
                required
                style={{ backgroundColor: '#2A3A5F', color: '#E0E7FF', border: '1px solid #3A4B6F' }}
              />
              {previewUrl && (
                <div className="mt-2">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
                  />
                </div>
              )}
            </div>
          </>
        )}

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            id="requiresRsvp"
            name="requiresRsvp"
            className="form-check-input"
            checked={formData.requiresRsvp}
            onChange={handleInputChange}
            style={{ backgroundColor: '#2A3A5F', borderColor: '#3A4B6F' }}
          />
          <label htmlFor="requiresRsvp" className="form-check-label" style={{ color: '#E0E7FF' }}>
            Requires RSVP
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
          style={{ 
            backgroundColor: '#4F46E5', 
            borderColor: '#4F46E5',
            width: '100%',
            padding: '10px'
          }}
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Processing...</span>
            </>
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </div>
  );
}