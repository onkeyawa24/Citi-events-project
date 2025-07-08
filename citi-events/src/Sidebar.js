// Sidebar.js
import React, { useState } from 'react';
import {
  Home,
  Calendar,
  FileText,
  Users,
  Bell,
  Menu,
} from 'lucide-react';

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  const menu = [
    { name: 'Home', icon: <Home size={20} /> },
    { name: 'Events', icon: <Calendar size={20} /> },
    { name: 'Announcements', icon: <FileText size={20} /> },
    { name: 'RSVPs', icon: <Users size={20} /> },
    { name: 'Calendar', icon: <Bell size={20} /> },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full z-50 bg-blue-700 text-white transition-all duration-300 ${
        open ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex justify-end p-3">
        <button onClick={() => setOpen(!open)}>
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex flex-col space-y-4 px-3 mt-4">
        {menu.map((item, idx) => (
          <a
            key={idx}
            href={`#${item.name.toLowerCase()}`}
            className="flex items-center space-x-3 hover:bg-blue-600 rounded px-2 py-2 transition-all"
          >
            <span>{item.icon}</span>
            {open && <span className="whitespace-nowrap">{item.name}</span>}
          </a>
        ))}
      </nav>
    </div>
  );
}
