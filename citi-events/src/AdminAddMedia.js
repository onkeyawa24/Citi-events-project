// AdminAddMedia.js
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

const AdminAddMedia = ({ eventOverride = null }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleUpload = async () => {
    const eventId = eventOverride?.id;

    if (!eventId) {
      setErrorMsg('❌ No event selected. Cannot upload media.');
      return;
    }

    if (mediaFiles.length === 0) {
      setErrorMsg('❌ Please select at least one image or video file.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Convert files to base64
      const filePromises = mediaFiles.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]; // Strip prefix
            resolve({
              filename: file.name,
              filedata: base64
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const encodedFiles = await Promise.all(filePromises);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/events/${eventId}/add-media`,
        { files: encodedFiles },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setSuccessMsg('✅ Media uploaded successfully!');
      setMediaFiles([]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || '❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      <Form.Group controlId="mediaUpload" className="mt-3">
        <Form.Label>Upload Media (images/videos)</Form.Label>
        <Form.Control
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={e => setMediaFiles(Array.from(e.target.files))}
        />
      </Form.Group>

      <Button
        className="mt-3"
        variant="primary"
        onClick={handleUpload}
        disabled={uploading || !eventOverride?.id}
      >
        {uploading ? <Spinner animation="border" size="sm" /> : 'Upload Media'}
      </Button>
    </div>
  );
};

export default AdminAddMedia;
