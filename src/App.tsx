import React from 'react';
import { AppProvider, useApp, isDemoMode } from './context/AppContext';
import { RouterProvider, useRouter } from './router/Router';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ResidentApp } from './components/ResidentApp/ResidentApp';
import { AuthorityDashboard } from './components/AuthorityApp/AuthorityDashboard';
import { SecurityDashboard } from './components/SecurityApp/SecurityDashboard';
import { AdminDashboard } from './components/AdminApp/AdminDashboard';
import { LandingPage } from './components/LandingPage';

const MainContent: React.FC = () => {
  const { activeRole, currentUser, isAuthLoading, firebaseUser, switchPersonaByUid, switchRolePersona } = useApp();
  const { path, navigate, params, isAllowedForRole } = useRouter();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f5f1ec] text-[#111111] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#111111] text-white flex items-center justify-center animate-spin font-bold">
          ⚡
        </div>
        <p className="text-xs text-stone-600 mt-3 font-semibold">Authenticating Greenwood Estate...</p>
      </div>
    );
  }

  // If not signed in and not in demo mode, show landing page
  if (!firebaseUser && !isDemoMode && path !== '/login') {
    return <LandingPage />;
  }

  const handleSelectRole = (role: string, uid?: string) => {
    if (uid) {
      switchPersonaByUid(uid);
    } else {
      switchRolePersona(role as any);
    }

    // Navigate to role's primary route using centralized router
    if (role === 'resident') {
      navigate('/resident');
    } else if (role === 'security_guard') {
      navigate('/security/gate');
    } else if (role.includes('worker')) {
      navigate('/authority/work');
    } else if (role === 'rwa_admin') {
      navigate('/admin/overview');
    }
  };

  const roleRoute = params.role || 'resident';
  const isAuthorized = isAllowedForRole(activeRole, path);
  const isUnknown = params.isUnknownRoute;

  const DASHBOARD_MAP: Record<string, React.ComponentType<{ params?: typeof params }>> = {
    resident: ResidentApp,
    security: SecurityDashboard,
    authority: AuthorityDashboard,
    admin: AdminDashboard,
  };

  const ActiveDashboard = DASHBOARD_MAP[roleRoute] || ResidentApp;

  if (isUnknown) {
    return (
      <div className="min-h-screen bg-[#f5f1ec] text-[#111111] flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#d3cec6] shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-bold text-xl">
              404
            </div>
            <h2 className="text-lg font-bold">Page Not Found</h2>
            <p className="text-xs text-stone-600">
              The page or resource you are looking for does not exist in Greenwood Estate.
            </p>
            <button
              onClick={() => navigate('/resident')}
              className="px-5 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-stone-800 transition"
            >
              Return to Resident Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f5f1ec] text-[#111111] flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#d3cec6] shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mx-auto font-bold text-xl">
              🚫
            </div>
            <h2 className="text-lg font-bold">Access Restricted</h2>
            <p className="text-xs text-stone-600">
              Your current persona ({activeRole}) is not authorized to access this section ({roleRoute}).
            </p>
            <button
              onClick={() => {
                if (activeRole === 'resident') navigate('/resident');
                else if (activeRole === 'security_guard') navigate('/security/gate');
                else if (activeRole === 'rwa_admin') navigate('/admin/overview');
                else navigate('/authority/work');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-stone-800 transition"
            >
              Go to Permitted Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1ec] text-[#111111] flex flex-col font-sans selection:bg-amber-200">
      {/* Top Navigation & Role Bar */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
        <ActiveDashboard params={params} />
      </main>

      {/* Persistent Mobile Bottom Navigation (thumb-friendly for one-handed use) */}
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <RouterProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </RouterProvider>
  );
}
