import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <p className="text-center mt-4">Loading event...</p>;
  if (error) return <p className="text-danger text-center mt-4">{error}</p>;
  if (!event) return <p className="text-center mt-4">Event not found.</p>;

  return (
    <div className="container py-5">
      <h2 className="mb-3">{event.title}</h2>
      <p><strong>Date:</strong> {event.date}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Description:</strong></p>
      <p>{event.description}</p>
      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} className="img-fluid mt-3" />
      )}
    </div>
  );
};

export default EventDetails;
