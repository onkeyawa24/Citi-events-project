import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button } from 'react-bootstrap';
import {
  FaUserCircle, FaBell, FaHome, FaCalendarAlt, FaBullhorn, FaCheckCircle, FaCogs, FaSearch
} from 'react-icons/fa';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from '@aws-amplify/auth';
import Fuse from 'fuse.js';
import './navbarPage.css';

const NavbarPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allItems, setAllItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, announcementsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/events`),
          axios.get(`${process.env.REACT_APP_API_URL}/announcements`)
        ]);

        setAllItems([
          ...eventsRes.data.map(item => ({ ...item, _type: 'event' })),
          ...announcementsRes.data.map(item => ({ ...item, _type: 'announcement' }))
        ]);

        const rsvpEvents = eventsRes.data.filter(event => event.requiresRsvp);
        setNotifications(rsvpEvents);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const fuse = new Fuse(allItems, {
      keys: ['title', 'description'],
      threshold: 0.4, // controls fuzzy match sensitivity
    });

    const results = fuse.search(searchTerm).map(result => result.item);
    setSearchResults(results);
    setShowSearchDropdown(true);
  };

  const handleResultClick = (item) => {
    navigate(item._type === 'event' ? '/events' : '/announcements');
    setSearchResults([]);
    setSearchTerm('');
    setShowSearchDropdown(false);
  };

  const navLinkContent = (icon, label) => (
    <div className="d-flex flex-column align-items-center text-white">
      <div>{icon}</div>
      <div style={{ fontSize: '0.8rem', marginTop: '2px', fontWeight: '400' }}>{label}</div>
    </div>
  );

  return (
    <Navbar fixed="top" expand="lg" style={{ backgroundColor: '#0D1B2A' }} variant="dark" className="shadow-sm py-2">
      <Container fluid className="px-3">
        <Navbar.Brand as={NavLink} to="/" className="me-4">
          <img src="/citi-event-logo.png" alt="Logo" height="40" className="d-inline-block align-top" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto d-flex flex-column flex-lg-row align-items-center gap-4 text-center">
            <Nav.Link as={NavLink} to="/" end className="nav-link text-white">
              {navLinkContent(<FaHome size={26} />, 'Home')}
            </Nav.Link>
            <Nav.Link as={NavLink} to="/events" className="nav-link text-white">
              {navLinkContent(<FaCalendarAlt size={26} />, 'Events')}
            </Nav.Link>
            <Nav.Link as={NavLink} to="/announcements" className="nav-link text-white">
              {navLinkContent(<FaBullhorn size={26} />, 'Announcements')}
            </Nav.Link>
            <Nav.Link as={NavLink} to="/rsvp" className="nav-link text-white">
              {navLinkContent(<FaCheckCircle size={26} />, 'RSVP')}
            </Nav.Link>
            <Nav.Link as={NavLink} to="/adminDashboard" className="nav-link text-white">
              {navLinkContent(<FaCogs size={26} />, 'Admin')}
            </Nav.Link>
          </Nav>

          {/* Search Bar */}
          <Form className="d-flex position-relative" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <FormControl
              type="search"
              placeholder="Search events or announcements..."
              className="me-2 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: '220px', maxWidth: '300px', fontSize: '0.9rem' }}
            />
            <Button
              variant="outline-light"
              onClick={handleSearch}
              style={{
                background: '#23395B',
                borderColor: '#23395B',
                color: 'white',
                transition: '0.3s',
              }}
            >
              <FaSearch />
            </Button>

            {showSearchDropdown && searchResults.length > 0 && (
              <div className="position-absolute bg-white shadow rounded p-2" style={{
                top: '105%',
                right: 0,
                width: '300px',
                zIndex: 1050,
                maxHeight: '250px',
                overflowY: 'auto'
              }}>
                {searchResults.map(item => (
                  <div
                    key={item.id || item.eventId}
                    className="py-1 px-2 border-bottom hover-bg-light"
                    onClick={() => handleResultClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: '500' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{item._type.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            )}
          </Form>

          {/* Right Side Icons */}
          <Nav className="ms-4 d-flex flex-row align-items-center gap-3 text-white">
            <div style={{ position: 'relative' }}>
              <FaBell
                size={24}
                className="cursor-pointer"
                title="Notifications"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {notifications.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                  {notifications.length}
                </span>
              )}
              {showDropdown && (
                <div className="position-absolute end-0 mt-2 p-2 shadow border rounded bg-white text-dark" style={{ width: '250px', zIndex: 1000 }}>
                  <strong style={{ fontSize: '0.85rem' }}>Events Requiring RSVP</strong>
                  <ul className="list-unstyled mt-2 mb-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {notifications.map(event => (
                      <li key={event.id} className="border-bottom py-1">
                        <div className="fw-semibold" style={{ fontSize: '0.78rem' }}>{event.title}</div>
                        <small style={{ fontSize: '0.7rem' }}>{event.date}</small>
                      </li>
                    ))}
                    {notifications.length === 0 && <li style={{ fontSize: '0.78rem' }}>No new notifications</li>}
                  </ul>
                </div>
              )}
            </div>

            <div className="position-relative">
              <FaUserCircle
                size={30}
                className="cursor-pointer"
                title="User Account"
                onClick={() => setShowUserMenu(!showUserMenu)}
              />
              {showUserMenu && (
                <div className="position-absolute end-0 mt-2 p-2 shadow border rounded bg-white text-dark" style={{ zIndex: 1000, minWidth: '150px' }}>
                  <div className="dropdown-item" onClick={() => navigate('/profile')}>Profile</div>
                  <div className="dropdown-item text-danger" onClick={handleSignOut}>Sign Out</div>
                </div>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarPage;
