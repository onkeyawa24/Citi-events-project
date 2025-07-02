import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPage() {
  const [motivations, setMotivations] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [newMotivation, setNewMotivation] = useState("");
  const [editingMotivation, setEditingMotivation] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch data once
  useEffect(() => {
    fetchData();
  }, []);

  // Apply search and date filtering on events
  useEffect(() => {
    let filtered = [...events];
    if (filterDate) filtered = filtered.filter((e) => e.date === filterDate);
    if (search)
      filtered = filtered.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      );
    setFilteredEvents(filtered);
    setCurrentPage(1); // reset to first page on filter change
  }, [events, search, filterDate]);

  const fetchData = async () => {
    try {
      // Fetch motivations
      const motivationRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/motivation`
      );
      setMotivations(motivationRes.data);

      // Fetch events (all events, no filtering)
      const eventRes = await axios.get(`${process.env.REACT_APP_API_URL}/events`);
      setEvents(eventRes.data);
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  // Motivations handlers
  const handleAddMotivation = async () => {
    if (!newMotivation.trim()) return alert("Write a motivation first");
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/upload-poster`, {
        id: Date.now().toString(),
        motivation: newMotivation,
        type: "motivation",
      });
      setNewMotivation("");
      fetchData();
    } catch (err) {
      alert("Failed to add motivation");
    }
  };

  const handleUpdateMotivation = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/motivation/${editingMotivation.id}`,
        {
          motivation: editingMotivation.motivation,
        }
      );
      setEditingMotivation(null);
      fetchData();
    } catch (err) {
      alert("Failed to update motivation");
    }
  };

  const handleDeleteMotivation = async (id) => {
    if (!window.confirm("Delete this motivation?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/motivation/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete motivation");
    }
  };

  // Events handlers
  const handleUpdateEvent = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/events/${editingEvent.id}`,
        editingEvent
      );
      setEditingEvent(null);
      fetchData();
    } catch (err) {
      alert("Failed to update event");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/events/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete event");
    }
  };

  // Pagination
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  return (
    <div style={styles.page}>
      <h2 style={styles.header}>Admin Panel</h2>

      {/* Motivation Section */}
      <section>
        <h3 style={styles.subHeader}>Manage Motivations</h3>
        <div style={styles.inputRow}>
          <input
            type="text"
            placeholder="New motivation"
            value={newMotivation}
            onChange={(e) => setNewMotivation(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleAddMotivation} style={styles.button}>
            Add
          </button>
        </div>

        {motivations.map((m) => (
          <div key={m.id} style={styles.card}>
            {editingMotivation?.id === m.id ? (
              <>
                <input
                  type="text"
                  value={editingMotivation.motivation}
                  onChange={(e) =>
                    setEditingMotivation({
                      ...editingMotivation,
                      motivation: e.target.value,
                    })
                  }
                  style={styles.input}
                />
                <button onClick={handleUpdateMotivation} style={styles.button}>
                  Save
                </button>
                <button
                  onClick={() => setEditingMotivation(null)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p>{m.motivation}</p>
                <button
                  onClick={() => setEditingMotivation(m)}
                  style={styles.button}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMotivation(m.id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </section>

      {/* Event Section */}
      <section style={{ marginTop: "2rem" }}>
        <h3 style={styles.subHeader}>Manage Events</h3>

        <div style={styles.inputRow}>
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={styles.input}
          />
        </div>

        {paginatedEvents.length === 0 ? (
          <p>No events found.</p>
        ) : (
          paginatedEvents.map((event) => (
            <div key={event.id} style={styles.card}>
              {editingEvent?.id === event.id ? (
                <>
                  <input
                    type="text"
                    value={editingEvent.title}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, title: e.target.value })
                    }
                    style={styles.input}
                  />
                  <textarea
                    value={editingEvent.description}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        description: e.target.value,
                      })
                    }
                    style={{ ...styles.input, height: "80px" }}
                  />
                  <input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                    style={styles.input}
                  />
                  <button onClick={handleUpdateEvent} style={styles.button}>
                    Save
                  </button>
                  <button
                    onClick={() => setEditingEvent(null)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                  <p>
                    <strong>Date:</strong> {event.date}
                  </p>
                  <button
                    onClick={() => setEditingEvent(event)}
                    style={styles.button}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))
        )}

        {/* Pagination Controls */}
        <div style={{ marginTop: "1rem" }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                ...styles.button,
                backgroundColor: currentPage === i + 1 ? "#0056b3" : "#007bff",
                marginRight: "0.5rem",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { padding: "2rem", fontFamily: "Arial, sans-serif" },
  header: { fontSize: "2rem", marginBottom: "1rem" },
  subHeader: { fontSize: "1.5rem", margin: "1rem 0" },
  inputRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  input: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    flex: 1,
    minWidth: "200px",
  },
  button: {
    padding: "0.4rem 0.8rem",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  cancelBtn: {
    backgroundColor: "#ccc",
    padding: "0.4rem 0.8rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "0.5rem",
    marginLeft: "0.5rem",
  },
  deleteBtn: {
    backgroundColor: "red",
    color: "#fff",
    padding: "0.4rem 0.8rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "0.5rem",
    marginLeft: "0.5rem",
  },
  card: {
    background: "#f9f9f9",
    padding: "1rem",
    marginBottom: "1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
};
