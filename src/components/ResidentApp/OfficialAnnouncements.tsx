import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../router/Router';
import { AnnouncementCategory, Announcement } from '../../types';
import {
  AlertTriangle,
  Megaphone,
  CheckCircle2,
  Pin,
  Calendar,
  Wrench,
  Zap,
  Droplet,
  ShieldAlert,
  Users,
  ArrowLeft,
} from 'lucide-react';

export const OfficialAnnouncements: React.FC = () => {
  const { announcements, acknowledgeAnnouncement, currentUser } = useApp();
  const { navigate } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'Emergency',
    'Water Shutdown',
    'Maintenance',
    'Electricity',
    'Meeting',
    'Security',
    'General',
  ];

  const filtered = announcements.filter((a) => {
    if (selectedCategory !== 'ALL' && a.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryIcon = (category: AnnouncementCategory) => {
    switch (category) {
      case 'Water Shutdown':
        return Droplet;
      case 'Electricity':
        return Zap;
      case 'Maintenance':
        return Wrench;
      case 'Emergency':
        return ShieldAlert;
      case 'Meeting':
        return Users;
      default:
        return Megaphone;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/resident')}
            className="p-1.5 rounded-xl border border-[#d3cec6] bg-white hover:bg-stone-100 text-stone-700 transition flex items-center justify-center"
            title="Back to Resident Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-[#111111]">Official Colony Notices</h2>
            <p className="text-xs text-[#7b7b78]">Verified communications from RWA executive board</p>
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              selectedCategory === cat
                ? 'bg-[#111111] text-white border-[#111111]'
                : 'bg-white text-stone-700 border-[#d3cec6] hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((ann) => {
          const Icon = getCategoryIcon(ann.category);
          const isEmergency = ann.priority === 'emergency';
          const isUrgent = ann.priority === 'urgent';
          const isAcknowledged = (ann.acknowledgedBy || []).includes(currentUser.uid);

          return (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl border transition shadow-xs ${
                isEmergency
                  ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                  : isUrgent
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-white border-[#d3cec6]'
              }`}
            >
              {/* Top metadata badge row */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  {ann.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      <Pin className="w-3 h-3 text-stone-600" /> Pinned
                    </span>
                  )}
                  {isEmergency && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ff5600] text-white animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> EMERGENCY ALERT
                    </span>
                  )}
                  {isUrgent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      URGENT NOTICE
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-stone-600 px-2 py-0.5 rounded bg-white/80 border border-stone-200 flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {ann.category}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Target: <strong className="text-stone-700">{ann.targetBlock}</strong>
                  </span>
                </div>

                <span className="text-[11px] text-[#7b7b78] shrink-0">
                  {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Title & Body */}
              <h3 className={`text-sm sm:text-base font-bold mb-2 ${isEmergency ? 'text-rose-950' : 'text-[#111111]'}`}>
                {ann.title}
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line mb-4">
                {ann.content}
              </p>

              {/* Footer row: Author & Acknowledge CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-stone-200/60 text-xs">
                <div className="text-[11px] text-[#626260]">
                  Issued by: <strong className="text-stone-800">{ann.authorName}</strong>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-[11px] text-[#7b7b78]">
                    {(ann.acknowledgedBy || []).length} residents acknowledged
                  </span>

                  {ann.actionRequired ? (
                    <button
                      onClick={() => acknowledgeAnnouncement(ann.id)}
                      disabled={isAcknowledged}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isAcknowledged
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-[#111111] text-white hover:bg-stone-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge Notice'}</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
