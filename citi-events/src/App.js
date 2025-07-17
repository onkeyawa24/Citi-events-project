// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import WelcomeSection from './WelcomeSection';
import Events from './Events';
import UploadForm from './UploadForm';
import MotivationPage from './MotivationPage';
import Announcements from './Announcements';
import Rsvp from './Rsvp';
import AdminDashboard from './AdminDashboard';

function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Default route */}
          <Route index element={<WelcomeSection />} />

          {/* Other pages */}
          <Route path="events" element={<Events />} />
          <Route path="Announcements" element={<Announcements />} />
          <Route path="Rsvp" element={<Rsvp />} />
          <Route path="AdminDashboard" element={<AdminDashboard />} />
          <Route path="motivation" element={<MotivationPage />} />
          
          {/* Add more as needed */}
        </Route>
      </Routes>

  );
}

export default App;
