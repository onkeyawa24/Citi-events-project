import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import axios from 'axios';
import './navbarPage.css'; // Optional custom styling

const NavbarPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchRsvpEvents = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/events`);
        const rsvpEvents = res.data.filter(event => event.requiresRsvp);
        setNotifications(rsvpEvents);
      } catch (err) {
        console.error('Error fetching RSVP events:', err);
      }
    };

    fetchRsvpEvents();
  }, []);

  return (
    <Navbar fixed="top" expand="lg" bg="light" variant="light" className="shadow-sm py-2">
      <Container fluid className="px-3">
        {/* Logo */}
        <Navbar.Brand href="#">
          <img
            src="./public/citi-event-logo.png"
            alt="Logo"
            height="30"
            className="d-inline-block align-top"
          />
        </Navbar.Brand>

        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          <Nav className="mx-auto text-center">
            <Navbar.Text className="navbar-title mx-auto fw-bold fs-5">
              Citi Events
            </Navbar.Text>
          </Nav>

          <Nav className="ms-auto d-flex flex-row align-items-center gap-3 position-relative">
            <div style={{ position: 'relative' }}>
              <FaBell
                size={20}
                className="text-dark cursor-pointer"
                title="Notifications"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {notifications.length > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.6rem' }}>
                  {notifications.length}
                </span>
              )}
              {showDropdown && (
                <div className="position-absolute end-0 mt-2 p-2 bg-white shadow-sm border rounded" style={{ width: '250px', zIndex: 1000 }}>
                  <strong>Events Requiring RSVP</strong>
                  <ul className="list-unstyled mt-2 mb-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {notifications.map((event) => (
                      <li key={event.id} className="border-bottom py-1">
                        <div className="fw-semibold">{event.title}</div>
                        <small>{event.date}</small>
                      </li>
                    ))}
                    {notifications.length === 0 && <li>No new notifications</li>}
                  </ul>
                </div>
              )}
            </div>
            <FaUserCircle size={22} className="text-dark cursor-pointer" title="User Account" />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarPage;
