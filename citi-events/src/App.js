import React from 'react';
import WelcomeSection from './WelcomeSection';
import EventsPage from './EventsPage';
import UploadForm from './UploadForm';
import MotivationPage from './MotivationPage';
import NavbarPage from './NavbarPage';


function App() {
  return (
    <div style={{ padding: "80px", background: '#161f36', color: 'white', padding: '80px', fontFamily: 'Arial, sans-serif' }}>
      <NavbarPage />
     <WelcomeSection />
      <hr style={{ margin: '2rem 0' }} />
      <MotivationPage />
       <hr style={{ margin: '2rem 0' }} />
      
      <EventsPage />
       <hr style={{ margin: '2rem 0' }} />
       
      <UploadForm />
      <hr style={{ margin: '2rem 0' }} />
    </div>
  );
}

export default App;