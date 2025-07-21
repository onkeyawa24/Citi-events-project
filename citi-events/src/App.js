// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Layout from './Layout';
import WelcomeSection from './WelcomeSection';
import Events from './Events';
import EventDetailsPage from './EventDetailsPage';
import UploadForm from './UploadForm';
import MotivationPage from './MotivationPage';
import Announcements from './Announcements';
import Rsvp from './Rsvp';
import AdminDashboard from './AdminDashboard';
import EventsPage from './EventsPage';

function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<WelcomeSection />} />
          
          {/* Existing events routes */}
          <Route path="events">
            <Route index element={<Events />} />
            <Route path=":id" element={<EventDetailsPage />} />
          </Route>

          {/* New route for /thisEvent/:id */}
          <Route path="thisEvent/:id" element={<EventDetailsPage />} />

          <Route path="announcements" element={<Announcements />} />
          <Route path="rsvp" element={<Rsvp />} />
          <Route path="/eventss" element={<EventsPage />} />
          <Route path="motivation" element={<MotivationPage />} />
          
          <Route 
            path="admindashboard" 
            element={
              
              
                  <AdminDashboard />
              
            
            } 
          />
        </Route>
      </Routes>
     
  );
}

export default App;
