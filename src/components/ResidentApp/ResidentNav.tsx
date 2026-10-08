import React from 'react';
import { useRouter } from '../../router/Router';
import { useApp } from '../../context/AppContext';
import { Home, MessageSquare, AlertCircle, Shield, User } from 'lucide-react';

export const ResidentNav: React.FC = () => {
  const { path, navigate } = useRouter();
  const { issues, visitors, preApprovedVisitors, currentUser } = useApp();

  const residentFlat = currentUser.flatNumber || '242';
  const openIssuesCount = issues.filter(
    (i) => (i.reporterId === currentUser.uid || i.flatNumber === residentFlat) &&
           i.status !== 'Resolved' && i.status !== 'Closed'
  ).length;

  const insideVisitorsCount = visitors.filter(
    (v) => v.flatNumber === residentFlat && v.status === 'inside'
  ).length;

  const navItems = [
    { id: 'home', label: 'Home', path: '/resident', icon: Home },
    { id: 'community', label: 'Community', path: '/resident/community', icon: MessageSquare },
    { id: 'issues', label: 'Issues', path: '/resident/issues', icon: AlertCircle, badge: openIssuesCount },
    { id: 'visitors', label: 'Visitors', path: '/resident/visitors', icon: Shield, badge: insideVisitorsCount },
    { id: 'profile', label: 'Profile', path: '/resident/profile', icon: User },
  ];

  const currentSection = path.split('/')[2] || 'home';

  return (
    <nav className="bg-white border border-[#d3cec6] rounded-2xl p-1.5 shadow-xs flex items-center justify-around gap-1 mb-5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.id === 'home'
            ? path === '/resident' || path === '/resident/'
            : path.startsWith(item.path);

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
              isActive
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100 hover:text-[#111111]'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
