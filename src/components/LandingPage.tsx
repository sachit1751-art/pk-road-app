import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../router/Router';

export const LandingPage: React.FC = () => {
  const { signInWithGoogle } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-[#f5f1ec] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#d3cec6] shadow-xl text-center space-y-6">
        <h1 className="text-2xl font-bold text-[#111111]">Welcome to ColonyHub</h1>
        
        <div className="flex bg-[#eeeae3] p-1 rounded-full">
          {(['login', 'register'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
                activeTab === tab ? 'bg-white shadow-sm' : 'text-stone-600'
              }`}
            >
              {tab === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            {activeTab === 'login' ? 'Sign in to access your dashboard.' : 'Create a new account to get started.'}
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#111111] text-white text-sm font-bold hover:bg-stone-800 transition"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};
