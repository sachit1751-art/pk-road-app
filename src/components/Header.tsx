import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, AppNotification } from '../types';
import { useRouter } from '../router/Router';
import {
  Shield,
  Home,
  Wrench,
  UserCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Sparkles,
  ChevronDown,
  Building2,
  ChevronRight,
  User,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    firebaseUser,
    activeRole,
    switchRolePersona,
    switchPersonaByUid,
    signInWithGoogle,
    logout,
    notifications,
    unreadNotifsCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const { path, navigate, params } = useRouter();
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roleConfigs: { role: UserRole; label: string; icon: any; desc: string; badge: string; uid?: string }[] = [
    {
      role: 'resident',
      label: 'Resident (Verified)',
      icon: Home,
      desc: 'Rahul Sharma (Flat B-242)',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      uid: 'demo-resident-1',
    },
    {
      role: 'resident',
      label: 'Resident (Unverified)',
      icon: Home,
      desc: 'Rohit Mehra (Applicant - Flat C-302)',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      uid: 'demo-resident-unverified',
    },
    {
      role: 'water_worker',
      label: 'Water Authority',
      icon: Wrench,
      desc: 'Suresh Kumar (Plumbing & Water)',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      role: 'electrical_worker',
      label: 'Electrical Authority',
      icon: Wrench,
      desc: 'Ramesh Singh (Electrician)',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      role: 'security_guard',
      label: 'Security Guard',
      icon: Shield,
      desc: 'Bahadur Thapa (Main Gate)',
      badge: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    {
      role: 'rwa_admin',
      label: 'RWA Admin',
      icon: UserCheck,
      desc: 'Vikramaditya Roy (RWA President)',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
    },
  ];

  const currentRoleConfig = roleConfigs.find(
    (r) => (r.uid ? r.uid === currentUser.uid : r.role === activeRole)
  ) || roleConfigs[0];

  const relevantNotifications = notifications.filter((n) => {
    if (activeRole === 'resident') {
      return !n.flatNumber || n.flatNumber === currentUser.flatNumber;
    }
    if (activeRole === 'security_guard') {
      return n.type === 'visitor' || n.type === 'emergency';
    }
    if (activeRole.includes('worker')) {
      return n.type === 'issue_update' || n.type === 'emergency';
    }
    return true;
  });

  const handleNotifClick = (notif: AppNotification) => {
    markNotificationRead(notif.id);
    setShowNotifDrawer(false);

    if (notif.type === 'issue_update' && notif.relatedId) {
      if (activeRole.includes('worker')) {
        navigate(`/authority/issues/${notif.relatedId}`);
      } else {
        navigate(`/resident/issues/${notif.relatedId}`);
      }
    } else if (notif.type === 'visitor' && notif.relatedId) {
      if (activeRole === 'security_guard') {
        navigate('/security/visitors');
      } else {
        navigate(`/resident/visitors/${notif.relatedId}`);
      }
    } else if ((notif.type === 'announcement' || notif.type === 'emergency') && notif.relatedId) {
      navigate(`/resident/announcements/${notif.relatedId}`);
    } else if (notif.type === 'verification') {
      if (activeRole === 'rwa_admin') {
        navigate('/admin/residents');
      } else {
        navigate('/resident/profile');
      }
    }
  };

  const handleSelectPersona = (cfg: typeof roleConfigs[0]) => {
    if (cfg.uid) {
      switchPersonaByUid(cfg.uid);
    } else {
      switchRolePersona(cfg.role);
    }
    setShowRoleMenu(false);

    if (cfg.role === 'resident') navigate('/resident');
    else if (cfg.role === 'security_guard') navigate('/security/gate');
    else if (cfg.role === 'rwa_admin') navigate('/admin/overview');
    else navigate('/authority/work');
  };

  // Breadcrumb generation
  const pathParts = path.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, idx) => {
    const fullPath = '/' + pathParts.slice(0, idx + 1).join('/');
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    return { label, fullPath, isLast: idx === pathParts.length - 1 };
  });

  return (
    <header className="sticky top-0 z-40 bg-[#f5f1ec] border-b border-[#d3cec6] px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeRole === 'resident') navigate('/resident');
              else if (activeRole === 'security_guard') navigate('/security/gate');
              else if (activeRole === 'rwa_admin') navigate('/admin/overview');
              else navigate('/authority/work');
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#111111] text-white flex items-center justify-center shadow-xs group-hover:bg-stone-800 transition">
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-base text-[#111111] tracking-tight block leading-tight">
                ColonyHub
              </span>
              <span className="text-[10px] text-[#626260] hidden sm:block">
                Greenwood Estate
              </span>
            </div>
          </button>

          {/* Breadcrumb Context Trail */}
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-[#7b7b78] pl-3 border-l border-stone-300">
            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb.fullPath}>
                <ChevronRight className="w-3 h-3 text-stone-400" />
                {crumb.isLast ? (
                  <span className="font-semibold text-[#111111] truncate max-w-[140px]">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(crumb.fullPath)}
                    className="hover:text-stone-900 transition"
                  >
                    {crumb.label}
                  </button>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center: Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#d3cec6] hover:border-stone-400 transition shadow-xs text-xs sm:text-sm font-medium text-[#111111]"
            title="Switch testing interface persona"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[#7b7b78] hidden sm:inline">Role:</span>
            <span className="font-semibold truncate max-w-[120px] sm:max-w-none">{currentRoleConfig.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-[#d3cec6] p-2 z-50">
              <div className="px-3 py-2 border-b border-stone-100 mb-1">
                <p className="text-xs font-semibold text-[#111111]">Switch Operational Experience</p>
                <p className="text-[11px] text-[#7b7b78]">Instant role simulation across all 4 apps</p>
              </div>
              <div className="space-y-1">
                {roleConfigs.map((cfg) => {
                  const Icon = cfg.icon;
                  const isSelected = cfg.uid ? currentUser.uid === cfg.uid : activeRole === cfg.role;
                  return (
                    <button
                      key={cfg.label}
                      onClick={() => handleSelectPersona(cfg)}
                      className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition ${
                        isSelected
                          ? 'bg-stone-100 text-[#111111] font-medium'
                          : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="p-1.5 rounded-md bg-stone-100 text-stone-700 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{cfg.label}</span>
                          {isSelected && (
                            <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#7b7b78] truncate">{cfg.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications button with deep linking */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="p-2 rounded-lg bg-white border border-[#d3cec6] hover:bg-stone-50 relative text-[#111111]"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff5600] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#f5f1ec]">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {showNotifDrawer && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#d3cec6] p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111111]">Notifications</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                      {relevantNotifications.length}
                    </span>
                  </div>
                  {unreadNotifsCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {relevantNotifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#7b7b78]">
                      No notifications yet
                    </div>
                  ) : (
                    relevantNotifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`p-2.5 rounded-lg text-xs cursor-pointer transition border hover:bg-stone-100 ${
                          notif.isRead
                            ? 'bg-white border-stone-100 text-stone-600'
                            : 'bg-amber-50/70 border-amber-200 text-[#111111]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-[12px]">{notif.title}</span>
                          <span className="text-[10px] text-[#7b7b78] shrink-0">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] font-semibold text-blue-600 block mt-1">
                          Tap to view details →
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile / Google Auth */}
          {firebaseUser ? (
            <div className="flex items-center gap-2 pl-1">
              <button
                onClick={() => {
                  if (activeRole === 'resident') navigate('/resident/profile');
                  else if (activeRole === 'security_guard') navigate('/security/profile');
                  else if (activeRole === 'rwa_admin') navigate('/admin/residents');
                  else navigate('/authority/profile');
                }}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-stone-100 transition"
                title="View Profile"
              >
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-[#d3cec6]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center text-xs font-semibold">
                    {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg border border-[#d3cec6] bg-white hover:bg-stone-50 text-stone-600"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white hover:bg-stone-800 transition text-xs font-medium shadow-xs"
              title="Sign in with Google Account"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"
                />
              </svg>
              <span className="hidden sm:inline">Google Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
