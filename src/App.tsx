import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RouterProvider, useRouter } from './router/Router';
import { Header } from './components/Header';
import { ResidentApp } from './components/ResidentApp/ResidentApp';
import { AuthorityDashboard } from './components/AuthorityApp/AuthorityDashboard';
import { SecurityDashboard } from './components/SecurityApp/SecurityDashboard';
import { AdminDashboard } from './components/AdminApp/AdminDashboard';
import {
  Home,
  Wrench,
  Shield,
  UserCheck,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeRole, switchRolePersona, switchPersonaByUid, currentUser } = useApp();
  const { path, navigate, params } = useRouter();

  // Sync router URL with active role if mismatched
  useEffect(() => {
    if (params.role) {
      if (params.role === 'resident' && activeRole !== 'resident') {
        switchRolePersona('resident');
      } else if (params.role === 'security' && activeRole !== 'security_guard') {
        switchRolePersona('security_guard');
      } else if (
        params.role === 'authority' &&
        !['water_worker', 'electrical_worker', 'sanitation_worker', 'maintenance_worker'].includes(activeRole)
      ) {
        switchRolePersona('water_worker');
      } else if (params.role === 'admin' && activeRole !== 'rwa_admin') {
        switchRolePersona('rwa_admin');
      }
    }
  }, [params.role, activeRole, switchRolePersona]);

  const handleSelectRole = (role: string, uid?: string) => {
    if (uid) {
      switchPersonaByUid(uid);
    } else {
      switchRolePersona(role as any);
    }

    // Navigate to role's primary route
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

  const currentRole = params.role || (
    activeRole === 'resident' ? 'resident' :
    activeRole === 'security_guard' ? 'security' :
    activeRole === 'rwa_admin' ? 'admin' : 'authority'
  );

  return (
    <div className="min-h-screen bg-[#f5f1ec] text-[#111111] flex flex-col font-sans selection:bg-amber-200">
      {/* Top Navigation & Role Bar */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentRole === 'resident' && <ResidentApp />}
        {currentRole === 'authority' && <AuthorityDashboard />}
        {currentRole === 'security' && <SecurityDashboard />}
        {currentRole === 'admin' && <AdminDashboard />}
      </main>

      {/* Role Switcher Footer */}
      <footer className="bg-white border-t border-[#d3cec6] px-4 py-2.5 mt-auto shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-stone-900">Greenwood Estate Operations Platform</span>
            <span className="text-[#7b7b78] hidden md:inline">• AI Issue Routing & Gate Security</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-0.5">
            <span className="text-[11px] text-[#7b7b78] font-medium mr-1 hidden lg:inline">
              Simulate Role:
            </span>
            {[
              { role: 'resident', label: 'Resident (Verified B-242)', icon: Home, uid: 'demo-resident-1' },
              { role: 'resident', label: 'Applicant (Unverified C-302)', icon: Home, uid: 'demo-resident-unverified' },
              { role: 'water_worker', label: 'Water Worker', icon: Wrench },
              { role: 'electrical_worker', label: 'Electrician', icon: Wrench },
              { role: 'security_guard', label: 'Security Guard', icon: Shield },
              { role: 'rwa_admin', label: 'RWA Admin', icon: UserCheck },
            ].map((btn) => {
              const Icon = btn.icon;
              const isSelected = btn.uid ? currentUser.uid === btn.uid : activeRole === btn.role;
              return (
                <button
                  key={btn.label}
                  onClick={() => handleSelectRole(btn.role, btn.uid)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </footer>
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
