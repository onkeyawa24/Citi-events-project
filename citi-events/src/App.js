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

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_CLIENT_ID,
      identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
      loginWith: {
        oauth: {
          domain: `${process.env.REACT_APP_COGNITO_DOMAIN}.auth.${process.env.REACT_APP_REGION}.amazoncognito.com`,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [
            process.env.REACT_APP_REDIRECT_SIGN_IN,
            'http://localhost:3000/admindashboard'
          ],
          redirectSignOut: [
            process.env.REACT_APP_REDIRECT_SIGN_OUT,
            'http://localhost:3000'
          ],
          responseType: 'code'
        }
      }
    }
  }
});

const AuthWrapper = ({ children }) => {
  const { route } = useAuthenticator((context) => [context.route]);
  
  if (route !== 'authenticated') {
    return (
      <Authenticator 
        loginMechanisms={['email']}
        hideSignUp={true}
      />
    );
  }

  return children;
};

const ProtectedRoute = ({ children }) => {
  const { route } = useAuthenticator((context) => [context.route]);
  
  if (route !== 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Authenticator.Provider>
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
              <AuthWrapper>
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              </AuthWrapper>
            } 
          />
        </Route>
      </Routes>
    </Authenticator.Provider>
  );
}

export default App;
