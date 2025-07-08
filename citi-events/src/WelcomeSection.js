import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa';

const colors = {
  primaryBg: '#161F36',
  cardBg: '#1E2A4A',
  cardBorder: '#2A3A5F',
  textPrimary: '#E0E7FF',
  textSecondary: '#A5B4FC',
  accent: '#4A65B5',
  accent2: '#702963',
  accentLight: '#6381F5',
  success: '#2DD4BF',
  error: '#FB7185',
  warning: '#FACC15'
};

const WelcomeSection = () => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #161F36 0%, #0F172A 100%)',
      minHeight: '100vh',
      width: '100vw',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      padding: '2rem'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(112,41,99,0.2) 0%, rgba(112,41,99,0) 70%)',
        zIndex: 1
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,101,181,0.1) 0%, rgba(74,101,181,0) 70%)',
        zIndex: 1
      }} />

      <Container style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '3rem',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 0'
      }}>
        {/* Text content - takes full width on mobile */}
        <div style={{ 
          flex: 1,
          padding: '1rem',
          textAlign: { xs: 'center', md: 'left' }
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '700',
            marginBottom: '1.5rem',
            lineHeight: '1.3',
            background: 'linear-gradient(90deg, #E0E7FF 0%, #A5B4FC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome to Citi Events
          </h1>
          
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            lineHeight: '1.6',
            marginBottom: '2rem',
            color: '#E0E7FF',
            maxWidth: '600px'
          }}>
            Discover exciting upcoming events and important announcements from our community. 
            Whether you're looking to network, learn, or socialize, we've got something for everyone.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', md: 'flex-start' }
          }}>
            <Button 
              variant="primary" 
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                border: 'none',
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                minWidth: '200px'
              }}
            >
              Explore Events <FaArrowRight style={{ marginLeft: '0.5rem' }} />
            </Button>
            
            <Button 
              variant="outline-light"
              style={{
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                color: '#E0E7FF',
                borderColor: '#E0E7FF',
                minWidth: '200px'
              }}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Image - hidden on small screens */}
        <div style={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '600px',
            height: '400px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1E2A4A 0%, #2A3A5F 100%)',
            border: '1px solid #3A4B7A',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Placeholder for your image */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'url(https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80) center/cover',
              opacity: 0.8
            }} />
            
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              padding: '1.5rem',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              color: 'white'
            }}>
              <h3 style={{ margin: 0 }}>Join Our Next Event</h3>
              <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>Meet like-minded professionals</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default WelcomeSection;