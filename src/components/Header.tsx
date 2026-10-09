import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../router/Router';
import { Send } from 'lucide-react';

export const Header: React.FC = () => {
  const { firebaseUser, logout } = useApp();
  const { navigate, path } = useRouter();

  const navTabs = [
    { id: 'home', label: 'Home', path: '/resident' },
    { id: 'chat', label: 'Chat', path: '/resident/community' },
    { id: 'announcements', label: 'Announcements', path: '/resident/announcements' },
    { id: 'login', label: firebaseUser ? 'Logout' : 'Login', path: firebaseUser ? '#' : '/login' },
  ];

  return (
    <header className="bg-[#f5f1ec] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 p-1.5 rounded-full bg-[#eeeae3] border border-[#d3cec6]">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.label === 'Logout') {
                  logout();
                } else {
                  navigate(tab.path);
                }
              }}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition ${
                path.startsWith(tab.path) && tab.path !== '#'
                  ? 'bg-[#fce58d] text-[#111111] shadow-sm'
                  : 'text-stone-700 hover:text-[#111111]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
