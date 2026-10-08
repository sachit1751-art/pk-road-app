import React from 'react';
import { useRouter } from '../router/Router';
import { useApp } from '../context/AppContext';
import {
  Home,
  MessageSquare,
  AlertCircle,
  Shield,
  User,
  Clock,
  AlertTriangle,
  UserCheck,
  Briefcase,
  Bell,
  LayoutDashboard,
  Users,
  Megaphone,
  MoreHorizontal,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const MobileBottomNav: React.FC = () => {
  const { path, navigate, params } = useRouter();
  const {
    activeRole,
    issues,
    visitors,
    currentUser,
    announcements,
  } = useApp();

  const residentFlat = currentUser.flatNumber || '242';

  // Compute badges
  const residentOpenIssues = issues.filter(
    (i) =>
      (i.reporterId === currentUser.uid || i.flatNumber === residentFlat) &&
      i.status !== 'Resolved' &&
      i.status !== 'Closed'
  ).length;

  const residentActiveVisitors = visitors.filter(
    (v) => v.flatNumber === residentFlat && v.status === 'inside'
  ).length;

  const currentInsideSecurity = visitors.filter((v) => v.status === 'inside').length;
  const securityAlerts = announcements.filter(
    (a) => a.category === 'Security' || a.priority === 'emergency'
  ).length;

  const authorityAssigned = issues.filter(
    (i) => i.assignedTo === currentUser.uid && i.status !== 'Resolved' && i.status !== 'Closed'
  ).length;

  const adminOpenIssues = issues.filter(
    (i) => i.status !== 'Resolved' && i.status !== 'Closed'
  ).length;

  const currentRole =
    params.role ||
    (activeRole === 'resident'
      ? 'resident'
      : activeRole === 'security_guard'
      ? 'security'
      : activeRole === 'rwa_admin'
      ? 'admin'
      : 'authority');

  let items: NavItem[] = [];

  if (currentRole === 'resident') {
    items = [
      { id: 'home', label: 'Home', path: '/resident', icon: Home },
      { id: 'community', label: 'Community', path: '/resident/community', icon: MessageSquare },
      { id: 'issues', label: 'Issues', path: '/resident/issues', icon: AlertCircle, badge: residentOpenIssues },
      { id: 'visitors', label: 'Visitors', path: '/resident/visitors', icon: Shield, badge: residentActiveVisitors },
      { id: 'profile', label: 'Profile', path: '/resident/profile', icon: User },
    ];
  } else if (currentRole === 'security') {
    items = [
      { id: 'gate', label: 'Gate', path: '/security/gate', icon: Shield },
      { id: 'visitors', label: 'Visitors', path: '/security/visitors', icon: User, badge: currentInsideSecurity },
      { id: 'history', label: 'History', path: '/security/history', icon: Clock },
      { id: 'alerts', label: 'Alerts', path: '/security/alerts', icon: AlertTriangle, badge: securityAlerts },
      { id: 'profile', label: 'Profile', path: '/security/profile', icon: UserCheck },
    ];
  } else if (currentRole === 'authority') {
    items = [
      { id: 'work', label: 'Work', path: '/authority/work', icon: Briefcase, badge: authorityAssigned },
      { id: 'issues', label: 'Issues', path: '/authority/issues', icon: AlertCircle },
      { id: 'notifications', label: 'Alerts', path: '/authority/notifications', icon: Bell },
      { id: 'profile', label: 'Profile', path: '/authority/profile', icon: UserCheck },
    ];
  } else if (currentRole === 'admin') {
    items = [
      { id: 'overview', label: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
      { id: 'issues', label: 'Issues', path: '/admin/issues', icon: AlertCircle, badge: adminOpenIssues },
      { id: 'residents', label: 'Residents', path: '/admin/residents', icon: Users },
      { id: 'announcements', label: 'Notices', path: '/admin/announcements', icon: Megaphone },
      { id: 'more', label: 'More', path: '/admin/more', icon: MoreHorizontal },
    ];
  }

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#f5f1ec]/95 backdrop-blur-md border-t border-[#d3cec6] px-2 py-1 shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === 'home' || item.id === 'overview' || item.id === 'work' || item.id === 'gate'
              ? path === item.path || path === `${item.path}/`
              : path.startsWith(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition touch-manipulation relative ${
                isActive
                  ? 'text-[#111111]'
                  : 'text-[#7b7b78] hover:text-[#111111]'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-[#111111] text-white shadow-xs' : 'text-stone-700'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-[#111111]' : 'font-medium text-stone-600'
                }`}
              >
                {item.label}
              </span>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`absolute top-1 right-[22%] sm:right-[28%] text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center ${
                    isActive
                      ? 'bg-amber-400 text-stone-900 ring-2 ring-[#f5f1ec]'
                      : 'bg-[#ff5600] text-white ring-2 ring-[#f5f1ec]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
