import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../router/Router';
import { Issue, VisitorEntry, Announcement } from '../../types';
import { ResidentNav } from './ResidentNav';
import { CommunityDiscussions } from './CommunityDiscussions';
import { OfficialAnnouncements } from './OfficialAnnouncements';
import { VisitorsHub } from './VisitorsHub';
import { ResidentProfile } from './ResidentProfile';
import { ReportIssueModal } from './ReportIssueModal';
import { IssueDetailsModal } from './IssueDetailsModal';
import { VisitorDetailModal } from './VisitorDetailModal';
import { VerificationModal } from './VerificationModal';
import {
  Home,
  AlertCircle,
  Shield,
  Key,
  Plus,
  Clock,
  ChevronRight,
  MapPin,
  CheckCircle,
  Truck,
  Wrench,
  FileCheck,
  Megaphone,
  MessageSquare,
  Users,
  Eye,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const ResidentApp: React.FC = () => {
  const { currentUser, issues, visitors, announcements, preApprovedVisitors, posts } = useApp();
  const { path, navigate, params, goBack } = useRouter();

  const [showReportModal, setShowReportModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorEntry | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [issueFilter, setIssueFilter] = useState<string>('ALL');

  const residentFlat = currentUser.flatNumber || '242';
  const residentBlock = currentUser.block || 'B';

  const isVerified = currentUser.verified && currentUser.verificationStatus === 'approved';
  const isPendingVerification = currentUser.verificationStatus === 'pending';
  const isRejectedVerification = currentUser.verificationStatus === 'rejected';

  const myPasses = preApprovedVisitors.filter(
    (p) => p.flatNumber === residentFlat && (!p.block || p.block === residentBlock)
  );

  const myIssues = issues.filter(
    (i) => i.reporterId === currentUser.uid || i.flatNumber === residentFlat
  );

  const flatVisitors = visitors.filter(
    (v) => v.flatNumber === residentFlat && (!v.block || v.block === residentBlock)
  );

  const emergencyAlert = announcements.find((a) => a.priority === 'emergency');

  // Handle URL deep-linking
  useEffect(() => {
    if (params.section === 'issues' && params.id) {
      if (params.id === 'new') {
        setShowReportModal(true);
      } else {
        const found = issues.find((i) => i.id === params.id);
        if (found) setSelectedIssue(found);
      }
    } else if (params.section === 'visitors' && params.id) {
      const found = visitors.find((v) => v.id === params.id);
      if (found) setSelectedVisitor(found);
    } else if (params.section === 'announcements' && params.id) {
      const found = announcements.find((a) => a.id === params.id);
      if (found) setSelectedAnnouncement(found);
    }
  }, [params.section, params.id, issues, visitors, announcements]);

  const filteredIssues = myIssues.filter((i) => {
    if (issueFilter === 'ALL') return true;
    if (issueFilter === 'OPEN') return i.status !== 'Resolved' && i.status !== 'Closed';
    if (issueFilter === 'RESOLVED') return i.status === 'Resolved' || i.status === 'Closed';
    return true;
  });

  const currentSection = params.section || 'home';

  return (
    <div className="space-y-5">
      {/* Primary Resident Navigation Bar */}
      <ResidentNav />

      {/* Verification Status Banner if not fully approved */}
      {!isVerified && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
            isPendingVerification
              ? 'bg-amber-50/80 border-amber-300 text-amber-950'
              : isRejectedVerification
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isPendingVerification
                  ? 'bg-amber-200 text-amber-900'
                  : isRejectedVerification
                  ? 'bg-rose-200 text-rose-900'
                  : 'bg-blue-200 text-blue-900'
              }`}
            >
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">
                  {isPendingVerification
                    ? 'Residency Verification Pending Approval'
                    : isRejectedVerification
                    ? 'Verification Request Requires Revision'
                    : 'Residency Verification Required'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border">
                  {currentUser.verificationStatus || 'Unverified'}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {isPendingVerification
                  ? `Your proof document for Flat ${residentBlock}-${residentFlat} is currently in the RWA Admin queue.`
                  : isRejectedVerification
                  ? `RWA Admin Note: "${currentUser.rejectionReason || 'Please provide updated bill/agreement'}"`
                  : 'Please submit a utility bill or rent agreement to unlock resident features.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowVerificationModal(true)}
            className="px-4 py-2 rounded-xl bg-[#111111] text-white hover:bg-stone-800 text-xs font-bold shrink-0 transition shadow-xs"
          >
            {isPendingVerification ? 'Update Submission' : 'Submit Proof of Residency'}
          </button>
        </div>
      )}

      {/* SECTION 1: HOME */}
      {currentSection === 'home' && (
        <div className="space-y-6">
          {/* Emergency Alert Banner */}
          {emergencyAlert && (
            <div
              onClick={() => setSelectedAnnouncement(emergencyAlert)}
              className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-rose-100/70 transition shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ff5600] text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-200 text-rose-900 tracking-wider">
                      Emergency Alert
                    </span>
                    <span className="text-xs font-bold">{emergencyAlert.title}</span>
                  </div>
                  <p className="text-xs text-rose-800 mt-1 line-clamp-1">
                    {emergencyAlert.content}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700 underline shrink-0 flex items-center gap-1">
                View Details <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {/* Resident Home Header & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111111]">Flat {residentBlock}-{residentFlat} Overview</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isVerified
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isPendingVerification
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {isVerified ? '✓ Verified' : isPendingVerification ? 'Pending Review' : 'Unverified'}
                </span>
              </div>
              <p className="text-xs text-[#7b7b78] mt-0.5">
                {currentUser.name} • Greenwood Estate Operations
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!isVerified && !isPendingVerification) {
                    setShowVerificationModal(true);
                  } else {
                    setShowReportModal(true);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff5600] text-white hover:bg-orange-600 text-xs font-semibold transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Report Problem</span>
              </button>

              <button
                onClick={() => navigate('/resident/visitors')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#d3cec6] bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition shadow-xs"
              >
                <Key className="w-3.5 h-3.5" />
                <span>+ Visitor Pass</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => navigate('/resident/issues')}
              className="p-3.5 rounded-2xl bg-white border border-[#d3cec6] shadow-xs cursor-pointer hover:border-stone-400 transition"
            >
              <span className="text-[11px] text-[#7b7b78] font-medium block">Open Issues</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-[#111111]">
                  {myIssues.filter((i) => i.status !== 'Resolved' && i.status !== 'Closed').length}
                </span>
                <span className="text-xs text-amber-600 font-semibold">View →</span>
              </div>
            </div>

            <div
              onClick={() => navigate('/resident/visitors')}
              className="p-3.5 rounded-2xl bg-white border border-[#d3cec6] shadow-xs cursor-pointer hover:border-stone-400 transition"
            >
              <span className="text-[11px] text-[#7b7b78] font-medium block">Active Passes</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-[#111111]">{myPasses.length}</span>
                <span className="text-xs text-emerald-600 font-semibold">Passes →</span>
              </div>
            </div>

            <div
              onClick={() => navigate('/resident/visitors')}
              className="p-3.5 rounded-2xl bg-white border border-[#d3cec6] shadow-xs cursor-pointer hover:border-stone-400 transition"
            >
              <span className="text-[11px] text-[#7b7b78] font-medium block">Visitors Inside</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-[#111111]">
                  {flatVisitors.filter((v) => v.status === 'inside').length}
                </span>
                <span className="text-xs text-purple-600 font-semibold">Log →</span>
              </div>
            </div>

            <div
              onClick={() => navigate('/resident/profile')}
              className="p-3.5 rounded-2xl bg-white border border-[#d3cec6] shadow-xs cursor-pointer hover:border-stone-400 transition"
            >
              <span className="text-[11px] text-[#7b7b78] font-medium block">Residency</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-[#111111] truncate">Flat {residentBlock}-{residentFlat}</span>
                <span className="text-xs text-stone-600 font-semibold">Profile →</span>
              </div>
            </div>
          </div>

          {/* Section: Open Issues */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                My Open Issues ({myIssues.length})
              </h3>
              <button
                onClick={() => navigate('/resident/issues')}
                className="text-xs font-semibold text-stone-700 hover:text-black"
              >
                View All Issues →
              </button>
            </div>

            {myIssues.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-[#d3cec6] text-xs text-stone-500">
                You have not submitted any issues. Click "Report Problem" to create one.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myIssues.slice(0, 3).map((iss) => (
                  <div
                    key={iss.id}
                    onClick={() => setSelectedIssue(iss)}
                    className="p-4 rounded-2xl bg-white border border-[#d3cec6] hover:border-stone-400 transition cursor-pointer shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#111111]">{iss.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            {iss.department}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{iss.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-[#7b7b78] mt-1">
                          <span>Status: <strong className="text-stone-800">{iss.status}</strong></span>
                          <span>• Assigned: {iss.assignedWorkerName || 'Pending'}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-stone-700 flex items-center gap-1 shrink-0">
                      Open Issue <ChevronRight className="w-4 h-4 text-stone-400" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* What happened recently: Recent Gate Visitors (Clicking opens visitor detail) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Recent Visitor Activity for Flat {residentBlock}-{residentFlat}
              </h3>
              <button
                onClick={() => navigate('/resident/visitors')}
                className="text-xs font-semibold text-stone-700 hover:text-black"
              >
                View Full Gate Log →
              </button>
            </div>

            {flatVisitors.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-[#d3cec6] text-xs text-stone-500">
                No recent visitors logged at gate for your flat.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {flatVisitors.slice(0, 4).map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVisitor(v)}
                    className="p-3.5 rounded-xl bg-white border border-[#d3cec6] hover:border-stone-400 transition cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                        {v.visitorType === 'Delivery' ? <Truck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#111111]">{v.visitorName}</span>
                          {v.isPreApproved && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              Pre-Approved
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500">
                          {v.visitorType} • Entry: {new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.status === 'inside'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {v.status === 'inside' ? 'Inside' : 'Exited'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Important Colony Announcements Preview (Card clicks directly to notice detail) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Official Colony Notices ({announcements.length})
              </h3>
              <button
                onClick={() => navigate('/resident/announcements')}
                className="text-xs font-semibold text-stone-700 hover:text-black"
              >
                Browse Notices →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {announcements.slice(0, 2).map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="p-4 rounded-2xl bg-white border border-[#d3cec6] hover:border-stone-400 transition cursor-pointer shadow-xs space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                      {ann.category}
                    </span>
                    <span className="text-xs font-bold text-[#111111] line-clamp-1">{ann.title}</span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2">{ann.content}</p>
                  <span className="text-[11px] text-[#7b7b78] block pt-1">
                    Published: {new Date(ann.createdAt).toLocaleDateString()} • Read Notice →
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Community Activity Card (Links to relevant community channel) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Recent Community Messages ({posts.length})
              </h3>
              <button
                onClick={() => navigate('/resident/community')}
                className="text-xs font-semibold text-stone-700 hover:text-black"
              >
                Open Community Channels →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {posts.slice(0, 2).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/resident/community/${p.channel}`)}
                  className="p-3.5 rounded-xl bg-white border border-[#d3cec6] hover:border-stone-400 transition cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      #{p.channel}
                    </span>
                    <span className="text-xs font-bold text-[#111111]">{p.authorName}</span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-1 mt-1">{p.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: COMMUNITY */}
      {currentSection === 'community' && <CommunityDiscussions />}

      {/* SECTION 3: ISSUES */}
      {currentSection === 'issues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {['ALL', 'OPEN', 'RESOLVED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setIssueFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    issueFilter === filter
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-stone-700 border-[#d3cec6] hover:bg-stone-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (!isVerified && !isPendingVerification) {
                  setShowVerificationModal(true);
                } else {
                  setShowReportModal(true);
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#ff5600] text-white text-xs font-semibold hover:bg-orange-600 transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Report Problem</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredIssues.map((iss) => (
              <div
                key={iss.id}
                onClick={() => setSelectedIssue(iss)}
                className="p-4 rounded-2xl bg-white border border-[#d3cec6] hover:border-stone-400 transition cursor-pointer shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#111111]">{iss.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {iss.department}
                      </span>
                      <span className="text-[10px] font-semibold text-stone-500">#{iss.id}</span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2">{iss.description}</p>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      iss.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : iss.status === 'In Progress'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {iss.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#7b7b78] pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {iss.locationDetails}
                    </span>
                    <span>Assigned: {iss.assignedWorkerName || 'Pending'}</span>
                  </div>
                  <span className="text-stone-700 font-semibold flex items-center gap-1">
                    View Details & Timeline →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: VISITORS */}
      {currentSection === 'visitors' && <VisitorsHub />}

      {/* SECTION 5: PROFILE */}
      {currentSection === 'profile' && <ResidentProfile />}

      {/* SECTION 6: ANNOUNCEMENTS */}
      {currentSection === 'announcements' && <OfficialAnnouncements />}

      {/* MODALS */}
      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onCreated={(createdIssue) => {
          setShowReportModal(false);
          setSelectedIssue(createdIssue);
        }}
      />

      <IssueDetailsModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />

      <VisitorDetailModal
        visitor={selectedVisitor}
        onClose={() => setSelectedVisitor(null)}
      />

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      />

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#d3cec6] space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                  {selectedAnnouncement.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedAnnouncement.priority === 'emergency'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedAnnouncement.priority === 'urgent'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  Priority: {selectedAnnouncement.priority}
                </span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#111111]">{selectedAnnouncement.title}</h3>
              <p className="text-xs text-[#7b7b78] mt-0.5">
                Published: {new Date(selectedAnnouncement.createdAt).toLocaleString()} • Author:{' '}
                {selectedAnnouncement.authorName}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f1ec] text-xs text-stone-800 leading-relaxed whitespace-pre-line">
              {selectedAnnouncement.content}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-stone-100">
              <span className="text-[11px] text-[#7b7b78]">
                Target Audience: Block {selectedAnnouncement.targetBlock}
              </span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-stone-800 transition"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
