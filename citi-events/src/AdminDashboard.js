import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Form, Button, Spinner, Alert, Dropdown } from 'react-bootstrap';
import { FiMoreHorizontal, FiLogOut } from 'react-icons/fi';
import { getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';
import axios from 'axios';
import AdminAddMedia from './AdminAddMedia';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import UploadForm from './UploadForm';

const colors = {
  background: '#161F36',
  cardBg: '#1E2A4A',
  textPrimary: '#E0E7FF',
  accent: '#4A65B5',
  border: '#2A3A5F',
};

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '' });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        setIsLoading(true);
        const { username, signInDetails } = await getCurrentUser();
        const { tokens } = await fetchAuthSession();
        
        const groups = tokens?.accessToken?.payload['cognito:groups'] || [];
        setIsAdmin(groups.includes('Admins'));

        if (!groups.includes('Admins')) {
          setError('You do not have admin privileges');
        } else {
          await fetchEvents();
          await fetchAnnouncements();
        }
      } catch (err) {
        setError('Authentication error. Please login again.');
        console.error(err);
        await handleSignOut();
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/announcements`);
      setAnnouncements(res.data.filter(item => item.type === 'announcement'));
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/events`);
      setEvents(res.data.filter(event => event.type === 'event'));
    } catch (err) {
      setError('Failed to fetch events');
      console.error(err);
    }
  };

  const openUpdateModal = async (event) => {
    try {
      setSelectedEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date.slice(0, 10),
      });

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/events/${event.id}/media`);
      setMediaFiles(res.data || []);
    } catch (err) {
      console.error('Failed to fetch media for event');
      setMediaFiles([]);
    } finally {
      setShowModal(true);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/${type}s/${id}`);
      if (type === 'event') {
        setEvents(events.filter(e => e.id !== id));
      } else {
        setAnnouncements(announcements.filter(a => a.id !== id));
      }
    } catch (err) {
      setError(`Failed to delete ${type}`);
      console.error(err);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEventUpdate = async () => {
    try {
      setUploading(true);
      await axios.put(
        `${process.env.REACT_APP_API_URL}/events/${selectedEvent.id}`,
        formData
      );
      await fetchEvents();
      setShowModal(false);
      setSelectedEvent(null);
    } catch (err) {
      setError('Failed to update event');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/media/${mediaId}`);
      setMediaFiles(prev => prev.filter(m => m.mediaId !== mediaId));
    } catch (err) {
      setError('Failed to delete media');
      console.error(err);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(mediaFiles);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setMediaFiles(reordered);
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '80px 20px', color: colors.textPrimary }}>
        <Container style={{ maxWidth: '800px' }}>
          <Spinner animation="border" variant="light" />
          <p className="mt-3">Loading admin dashboard...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '80px 20px', color: colors.textPrimary }}>
        <Container style={{ maxWidth: '800px' }}>
          <Alert variant="danger">
            {error}
            <div className="mt-3">
              <Button variant="primary" onClick={handleSignOut}>
                Return to Login
              </Button>
            </div>
          </Alert>
        </Container>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '80px 20px', color: colors.textPrimary }}>
        <Container style={{ maxWidth: '800px' }}>
          <Spinner animation="border" variant="light" />
          <p className="mt-3">Verifying admin privileges...</p>
        </Container>
      </div>
    );
  }

  const renderEventCard = (item) => (
    <div key={item.id} style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '1.5rem' }}>
        <Dropdown>
          <Dropdown.Toggle variant="link" style={{ color: colors.textPrimary, padding: 0 }}>
            <FiMoreHorizontal size={24} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => openUpdateModal(item)}>Update</Dropdown.Item>
            <Dropdown.Item onClick={() => handleDelete(item.id, 'event')}>Delete</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {item.posterUrl && (
        <img
          src={item.posterUrl}
          alt={item.title}
          style={{ width: '100%', borderRadius: '8px', marginBottom: '12px', objectFit: 'cover', aspectRatio: '16/9' }}
        />
      )}
      <h5>{item.title}</h5>
      {item.date && <p style={{ fontSize: '0.9rem' }}>{new Date(item.date).toLocaleDateString()}</p>}
      <p style={{ fontSize: '0.85rem', color: '#aaa' }}>{item.description?.substring(0, 100)}...</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '80px 20px', color: colors.textPrimary }}>
      <Container style={{ maxWidth: '1000px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ color: colors.textPrimary }}>🛠️ Admin Dashboard</h2>
          <Button variant="danger" onClick={handleSignOut}>
            <FiLogOut className="me-1" /> Logout
          </Button>
        </div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        <div style={{ backgroundColor: colors.cardBg, borderRadius: '12px', padding: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: `1px solid ${colors.border}` }}>
          <Tabs 
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            id="admin-tabs"
            className="mb-3"
            fill
            variant="pills"
          >
            <Tab eventKey="events" title="Events">
              <div className="pt-3">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {events.map(renderEventCard)}
                </div>
              </div>
            </Tab>
            
            <Tab eventKey="announcements" title="Announcements">
              <div className="pt-3">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {announcements.map(announcement => (
                    <div key={announcement.id} style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '1.5rem' }}>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" style={{ color: colors.textPrimary, padding: 0 }}>
                            <FiMoreHorizontal size={24} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleDelete(announcement.id, 'announcement')}>Delete</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                      <h5>{announcement.title}</h5>
                      <p style={{ fontSize: '0.85rem', color: '#aaa' }}>{announcement.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Tab>
            
            <Tab eventKey="create" title="Create New Event">
              <div className="pt-3">
                <UploadForm 
                  onSuccess={() => {
                    fetchEvents();
                    fetchAnnouncements();
                    setActiveTab('events');
                  }} 
                />
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