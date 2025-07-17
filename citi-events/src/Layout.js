// src/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarPage from './NavbarPage';

const Layout = () => {
  return (
    <div style={{ 
      paddingTop: '60px', 
      background: '#161f36', 
      color: 'white', 
      fontFamily: 'Arial, sans-serif', 
      minHeight: '100vh' 
    }}>
      <NavbarPage />
      <Outlet /> {/* This is where the active route content will appear */}
    </div>
  );
};

export default Layout;
