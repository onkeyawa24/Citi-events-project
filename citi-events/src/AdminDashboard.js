// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import { FiMoreHorizontal } from 'react-icons/fi';
import AdminAddMedia from './AdminAddMedia';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const colors = {
  background: '#161F36',
  cardBg: '#1E2A4A',
  textPrimary: '#E0E7FF',
  accent: '#4A65B5',
  border: '#2A3A5F'
};

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '' });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/events`);
        const filtered = res.data.filter(event => event.type === 'event');
        setEvents(filtered);
      } catch (err) {
        console.error('Failed to fetch events');
      }
    };
    fetchEvents();
  }, []);

  const openUpdateModal = async (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 10)
    });
    try {
      setMediaFiles(event.media || []);
    } catch (err) {
      console.error('Failed to fetch media for event');
      setMediaFiles([]);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete event');
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEventUpdate = async () => {
    try {
      setUploading(true);
      await axios.put(`${process.env.REACT_APP_API_URL}/events/${selectedEvent.id}`, formData);
      const updated = await axios.get(`${process.env.REACT_APP_API_URL}/events`);
      setEvents(updated.data.filter(e => e.type === 'event'));
      setShowModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to update event');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/media/${mediaId}`);
      setMediaFiles(prev => prev.filter(m => m.mediaId !== mediaId));
    } catch (err) {
      console.error('Failed to delete media');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(mediaFiles);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setMediaFiles(reordered);
  };

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '80px 20px', color: colors.textPrimary }}>
      <Container style={{ maxWidth: '1000px' }}>
        <h2 className="mb-4" style={{ color: colors.textPrimary }}>🛠️ Admin Dashboard</h2>
        <div style={{ backgroundColor: colors.cardBg, borderRadius: '12px', padding: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: `1px solid ${colors.border}` }}>
          <Tabs defaultActiveKey="events" id="admin-tabs" className="mb-3" fill variant="pills">
            <Tab eventKey="events" title="Events">
              <div className="pt-3">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {events.map(event => (
                    <div key={event.id} style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '1.5rem' }}>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" style={{ color: colors.textPrimary, padding: 0 }}>
                            <FiMoreHorizontal size={24} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => openUpdateModal(event)}>Update</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDelete(event.id)}>Delete</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                      {event.posterUrl && (
                        <img
                          src={event.posterUrl}
                          alt={event.title}
                          style={{ width: '100%', borderRadius: '8px', marginBottom: '12px', objectFit: 'cover', aspectRatio: '16/9' }}
                        />
                      )}
                      <h5>{event.title}</h5>
                      <p style={{ fontSize: '0.9rem' }}>{new Date(event.date).toLocaleDateString()}</p>
                      <p style={{ fontSize: '0.85rem', color: '#aaa' }}>{event.description?.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      </Container>

      {showModal && selectedEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: colors.cardBg, borderRadius: '12px', padding: '20px', maxWidth: '600px', width: '100%', color: colors.textPrimary, maxHeight: '95vh', overflowY: 'auto' }}>
            <h4 className="mb-3">Update Event: {selectedEvent.title}</h4>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Event Title</Form.Label>
                <Form.Control type="text" name="title" value={formData.title} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" name="date" value={formData.date} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Existing Media (drag to reorder)</Form.Label>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="media" direction="horizontal">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {mediaFiles.map((media, index) => (
                          <Draggable
                            key={media.mediaId ? media.mediaId.toString() : `media-${index}`}
                            draggableId={media.mediaId ? media.mediaId.toString() : `media-${index}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style, position: 'relative' }}
                              >
                                <img
                                  src={media.url}
                                  alt="media"
                                  style={{ width: '100px', height: '70px', borderRadius: '6px', objectFit: 'cover' }}
                                />
                                <button
                                  onClick={() => handleDeleteMedia(media.mediaId)}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    background: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0 6px 0 6px',
                                    padding: '2px 6px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </Draggable>

                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Form.Group>
              <Form.Group className="mb-3">
                <AdminAddMedia eventOverride={selectedEvent} />
              </Form.Group>
              <div className="d-flex justify-content-between mt-4">
                <Button variant="secondary" onClick={() => { setShowModal(false); setSelectedEvent(null); }}>Cancel</Button>
                <Button variant="primary" onClick={handleEventUpdate} disabled={uploading}>
                  {uploading ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;