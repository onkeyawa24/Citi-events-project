// Entry point of the app
import React from 'react';
import EventsPage from './EventsPage';
import UploadForm from './UploadForm';
import MotivationPage from './MotivationPage';
import NavbarPage from './NavbarPage';

function App() {
  return (
    <div style={{ padding: '80px', fontFamily: 'Arial, sans-serif' }}>
   
      <h1>📅 Citi-events</h1>
      <MotivationPage />
       <hr style={{ margin: '2rem 0' }} />
      <UploadForm />
      <hr style={{ margin: '2rem 0' }} />
      
      <EventsPage />
       <hr style={{ margin: '2rem 0' }} />
       
      
    </div>
  );
}

export default App;
