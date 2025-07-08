import React from 'react';
import { signInWithRedirect } from '@aws-amplify/auth'; // ✅ Correct for hosted UI login

export default function LoginPage() {
  const handleLogin = () => {
    signInWithRedirect(); // ✅ This opens the Cognito Hosted UI
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>🔐 Please log in to access CitiEvents</h2>
      <button
        onClick={handleLogin}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Sign In
      </button>
    </div>
  );
}
