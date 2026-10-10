import React from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../router/Router';
import { Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const { firebaseUser, logout, darkMode, toggleDarkMode } = useApp();
  const { navigate, path } = useRouter();

  const navTabs = [
    { id: 'home', label: 'Home', path: '/resident' },
    { id: 'chat', label: 'Chat', path: '/resident/community' },
    { id: 'announcements', label: 'Announcements', path: '/resident/announcements' },
    { id: 'login', label: firebaseUser ? 'Logout' : 'Login', path: firebaseUser ? '#' : '/login' },
  ];

  return (
    <header className="bg-[#f5f1ec] dark:bg-stone-900 px-4 py-3 border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 p-1.5 rounded-full bg-[#eeeae3] dark:bg-stone-800 border border-[#d3cec6] dark:border-stone-700">
        
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
                  : 'text-stone-700 dark:text-stone-300 hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dark Mode Toggle */}
        <div className="pr-2">
          <button
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f1ec] dark:bg-stone-900 border border-[#d3cec6] dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:text-[#111111] dark:hover:text-white transition shadow-sm"
            aria-label="Toggle dark mode"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
