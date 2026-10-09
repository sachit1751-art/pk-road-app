import React, { useState } from 'react';
import { useRouter } from '../router/Router';
import { Menu, X } from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const { path, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', href: '/home' },
    { id: 'chat', label: 'Chat', href: '/chat' },
    { id: 'announcements', label: 'Announcements', href: '/announcements' },
  ];

  const activeTab = (() => {
    if (path === '/home' || path === '/home/') return 'home';
    if (path.startsWith('/chat')) return 'chat';
    if (path.startsWith('/announcements')) return 'announcements';
    return null;
  })();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            navigate('/home');
          }}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A2530] text-white">
            <HouseMark className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1A2530]">ColonyHub</span>
        </a>

        <nav className="hidden items-center gap-6 sm:flex" aria-label="Public site navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.href)}
              className={`text-sm font-semibold transition-colors hover:text-[#1A2530] ${
                activeTab === tab.id
                  ? 'text-[#1A2530] underline underline-offset-4 decoration-2 decoration-[#1A2530]'
                  : 'text-stone-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <button
            onClick={() => navigate('/login')}
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-[#1A2530] transition hover:bg-stone-100"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="rounded-xl bg-[#1A2530] px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-900"
          >
            Register
          </button>
        </div>

        <button
          type="button"
          className="sm:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white px-4 pb-5 pt-3 sm:hidden">
          <nav aria-label="Mobile public navigation">
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    navigate(tab.href);
                    setMobileOpen(false);
                  }}
                  className={`rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'text-[#1A2530] bg-stone-100'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => {
                navigate('/login');
                setMobileOpen(false);
              }}
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-left text-sm font-semibold text-[#1A2530] transition hover:bg-stone-100"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate('/register');
                setMobileOpen(false);
              }}
              className="w-full rounded-xl bg-[#1A2530] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-stone-900"
            >
              Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

function HouseMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
