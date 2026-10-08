import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  Car,
  Users,
  Bell,
  CheckCircle,
  FileCheck,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { VerificationModal } from './VerificationModal';

export const ResidentProfile: React.FC = () => {
  const { currentUser, switchPersonaByUid, logout } = useApp();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [notifPreferences, setNotifPreferences] = useState({
    gateAlerts: true,
    emergencyBroadcasts: true,
    communityDiscussions: true,
    serviceWorkOrderUpdates: true,
  });

  const isVerified = currentUser.verified && currentUser.verificationStatus === 'approved';
  const isPendingVerification = currentUser.verificationStatus === 'pending';
  const isRejectedVerification = currentUser.verificationStatus === 'rejected';

  const residentFlat = currentUser.flatNumber || '242';
  const residentBlock = currentUser.block || 'B';

  const toggleNotif = (key: keyof typeof notifPreferences) => {
    setNotifPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Overview Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#d3cec6] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#111111]">{currentUser.name}</h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isVerified
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isPendingVerification
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {isVerified ? '✓ Verified Resident' : isPendingVerification ? 'Pending Review' : 'Unverified'}
              </span>
            </div>
            <p className="text-xs text-[#626260] mt-1 flex items-center gap-2">
              <span>Greenwood Estate</span> • <span>Tower {residentBlock}</span> •{' '}
              <strong className="text-stone-900 font-bold">Flat {residentBlock}-{residentFlat}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isVerified && (
            <button
              onClick={() => setShowVerificationModal(true)}
              className="px-4 py-2 rounded-xl bg-[#111111] text-white hover:bg-stone-800 text-xs font-bold transition shadow-xs"
            >
              {isPendingVerification ? 'Update Proof' : 'Verify Residency'}
            </button>
          )}
        </div>
      </div>

      {/* Verification Status Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isVerified
                  ? 'bg-emerald-100 text-emerald-800'
                  : isPendingVerification
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111111]">Residency Verification Status</h3>
              <p className="text-xs text-[#7b7b78]">RWA Official Resident Registry</p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isVerified
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : isPendingVerification
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            {isVerified
              ? 'Status: Verified Resident'
              : isPendingVerification
              ? 'Status: Under Admin Review'
              : 'Status: Action Required'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#f5f1ec] text-xs space-y-2">
          {isVerified ? (
            <div className="flex items-start gap-2 text-stone-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-900">
                  Flat {residentBlock}-{residentFlat} is authenticated with Greenwood Estate RWA.
                </p>
                <p className="text-[11px] text-[#626260] mt-0.5">
                  Full rights granted: Pre-approved visitor passes, community voting, gate alert approvals, and direct maintenance dispatch.
                </p>
              </div>
            </div>
          ) : isPendingVerification ? (
            <div className="flex items-start gap-2 text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  Proof of residency submitted and queued in the RWA Admin dashboard.
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Document under audit by Colony President / Secretary. Approval usually completes within 24 hours.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  Residency documentation required for Flat {residentBlock}-{residentFlat}.
                </p>
                <p className="text-[11px] text-rose-800 mt-0.5">
                  {currentUser.rejectionReason
                    ? `Admin Note: "${currentUser.rejectionReason}"`
                    : 'Please submit a current utility bill (electricity/water) or lease agreement.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Residence & Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7b7b78] flex items-center gap-1.5">
            <Building className="w-4 h-4" /> Residence Assignment
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Block / Tower</span>
              <span className="font-bold text-stone-900">Block {residentBlock}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Flat Number</span>
              <span className="font-bold text-stone-900">Flat {residentFlat}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Resident Type</span>
              <span className="font-semibold text-stone-900">Owner Occupant</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-stone-500">Registered Vehicles</span>
              <span className="font-semibold text-stone-900">2 (DL 04 AB 4040, HR 26 Z 1010)</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7b7b78] flex items-center gap-1.5">
            <Phone className="w-4 h-4" /> Contact Information
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Phone Number</span>
              <span className="font-bold text-stone-900">{currentUser.phone || '+91 98111 24200'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Email Address</span>
              <span className="font-semibold text-stone-900">{currentUser.email || 'rahul.sharma@colonyhub.org'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Intercom Ext.</span>
              <span className="font-semibold text-stone-900">242#</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-stone-500">Emergency Contact</span>
              <span className="font-semibold text-stone-900">+91 98111 24201 (Pooja Sharma)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-6 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#7b7b78] flex items-center gap-1.5">
          <Bell className="w-4 h-4" /> Notification Preferences
        </h3>

        <div className="space-y-3 text-xs">
          {[
            { key: 'gateAlerts', title: 'Gate Visitor & Delivery Alerts', desc: 'Instant popup and sound when visitor arrives at gate' },
            { key: 'emergencyBroadcasts', title: 'Emergency Alerts & Water Shutdown Notices', desc: 'Critical alerts broadcast by RWA management' },
            { key: 'serviceWorkOrderUpdates', title: 'Maintenance Ticket Progress', desc: 'Updates when technician accepts or resolves your problem' },
            { key: 'communityDiscussions', title: 'Community Discussion Replies', desc: 'Mentions and comments on your buy/sell or help posts' },
          ].map((item) => {
            const isChecked = notifPreferences[item.key as keyof typeof notifPreferences];
            return (
              <div
                key={item.key}
                onClick={() => toggleNotif(item.key as keyof typeof notifPreferences)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 transition cursor-pointer border border-stone-100"
              >
                <div>
                  <span className="font-bold text-stone-900 block">{item.title}</span>
                  <span className="text-[11px] text-stone-500">{item.desc}</span>
                </div>
                <div
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition ${
                    isChecked ? 'bg-[#111111]' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      isChecked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      />
    </div>
  );
};
