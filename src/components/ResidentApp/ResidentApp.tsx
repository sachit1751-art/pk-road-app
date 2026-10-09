import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../router/Router';
import { Issue, VisitorEntry, Announcement, IssueStatus, AppNotification } from '../../types';
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
  Bell,
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
  const { currentUser, issues, visitors, announcements, preApprovedVisitors, posts, updateIssueStatus, notifications, markNotificationRead } = useApp();
  const { path, navigate, params, goBack } = useRouter();

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [issueFilter, setIssueFilter] = useState<string>('ALL');

  // Optimistic UI & Firestore sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

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

  const myNotifications = notifications.filter(
    (n) => n.userId === currentUser.uid || (n.flatNumber && n.flatNumber === residentFlat) || n.userId === 'ALL'
  );

  const handleNotificationTap = (notif: AppNotification) => {
    markNotificationRead(notif.id);

    if (notif.type === 'visitor') {
      if (notif.relatedId && visitors.some((v) => v.id === notif.relatedId)) {
        navigate(`/resident/visitors/${notif.relatedId}`);
      } else {
        navigate('/resident/visitors');
      }
    } else if (notif.type === 'issue_update') {
      if (notif.relatedId && issues.some((i) => i.id === notif.relatedId)) {
        navigate(`/resident/issues/${notif.relatedId}`);
      } else {
        navigate('/resident/issues');
      }
    } else if (notif.type === 'announcement' || notif.type === 'emergency') {
      if (notif.relatedId && announcements.some((a) => a.id === notif.relatedId)) {
        navigate(`/resident/announcements/${notif.relatedId}`);
      } else {
        navigate('/resident/announcements');
      }
    } else if (notif.type === 'verification') {
      navigate('/resident/profile');
    } else {
      navigate('/resident');
    }
  };

  // Drive detail views and modals from URL router params
  const currentSection = params.section || 'home';
  const showReportModal = currentSection === 'issues' && params.id === 'new';
  const selectedIssue = currentSection === 'issues' && params.id && params.id !== 'new'
    ? issues.find((i) => i.id === params.id) || null
    : null;
  const selectedVisitor = currentSection === 'visitors' && params.id
    ? visitors.find((v) => v.id === params.id) || null
    : null;
  const selectedAnnouncement = currentSection === 'announcements' && params.id
    ? announcements.find((a) => a.id === params.id) || null
    : null;

  // 'NotFound' guard: Redirect if ID is provided, data has loaded, but specific record is not found
  useEffect(() => {
    if (issues.length > 0 && currentSection === 'issues' && params.id && params.id !== 'new' && !selectedIssue) {
      navigate('/resident/issues');
    }
    if (visitors.length > 0 && currentSection === 'visitors' && params.id && !selectedVisitor) {
      navigate('/resident/visitors');
    }
    if (announcements.length > 0 && currentSection === 'announcements' && params.id && !selectedAnnouncement) {
      navigate('/resident/announcements');
    }
  }, [currentSection, params.id, selectedIssue, selectedVisitor, selectedAnnouncement, issues.length, visitors.length, announcements.length, navigate]);

  const filteredIssues = myIssues.filter((i) => {
    if (issueFilter === 'ALL') return true;
    if (issueFilter === 'OPEN') return i.status !== 'Resolved' && i.status !== 'Closed';
    if (issueFilter === 'RESOLVED') return i.status === 'Resolved' || i.status === 'Closed';
    return true;
  });

  // Wrapper for optimistic issue status update with loading/error feedback
  const handleOptimisticStatusUpdate = async (issueId: string, newStatus: IssueStatus) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      await updateIssueStatus(issueId, newStatus, 'Status updated optimistically by resident');
      setSyncSuccessMessage(`Issue #${issueId} status successfully updated to ${newStatus}`);
      setTimeout(() => setSyncSuccessMessage(null), 3000);
    } catch (err: any) {
      setSyncError(err?.message || 'Failed to sync issue update with backend');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Primary Resident Navigation Bar */}
      <ResidentNav />

      {/* Sync Status / Error / Success Feedback Banners */}
      {syncError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-sm flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span><strong>Sync Warning:</strong> {syncError}</span>
          </div>
          <button
            onClick={() => setSyncError(null)}
            className="text-sm font-bold text-rose-700 hover:text-rose-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {syncSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-sm flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{syncSuccessMessage}</span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Synced</span>
        </div>
      )}

      {isSyncing && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center gap-2 animate-pulse">
          <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Syncing update...</span>
        </div>
      )}

      {/* Verification Status Banner if not fully approved */}
      {!isVerified && (
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
            isPendingVerification
              ? 'bg-amber-50/80 border-amber-300 text-amber-950'
              : isRejectedVerification
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isPendingVerification
                  ? 'bg-amber-200 text-amber-900'
                  : isRejectedVerification
                  ? 'bg-rose-200 text-rose-900'
                  : 'bg-blue-200 text-blue-900'
              }`}
            >
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">
                  {isPendingVerification
                    ? 'Residency Verification Pending Approval'
                    : isRejectedVerification
                    ? 'Verification Request Requires Revision'
                    : 'Residency Verification Required'}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border">
                  {currentUser.verificationStatus || 'Unverified'}
                </span>
              </div>
              <p className="text-sm text-stone-700 mt-1 leading-relaxed">
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
            className="px-6 py-3 rounded-xl bg-[#111111] text-white hover:bg-stone-800 text-sm font-bold shrink-0 transition shadow-xs"
          >
            {isPendingVerification ? 'Update Submission' : 'Submit Proof'}
          </button>
        </div>
      )}

      {/* SECTION 1: HOME */}
      {currentSection === 'home' && (
        <div className="space-y-6">
          {/* Emergency Alert Banner (Full width) */}
          {emergencyAlert && (
            <div
              onClick={() => navigate(`/resident/announcements/${emergencyAlert.id}`)}
              className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 flex items-center justify-between gap-3 cursor-pointer hover:bg-rose-100 transition shadow-sm"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-[#ff5600] animate-pulse" />
                <span className="text-sm font-bold text-rose-900">{emergencyAlert.title}</span>
              </div>
              <span className="text-xs font-bold underline">View Detail</span>
            </div>
          )}

          {/* Resident Home Header & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">Welcome, {currentUser.name.split(' ')[0]}</h2>
              <p className="text-xs text-[#7b7b78]">Flat {residentBlock}-{residentFlat} | {isVerified ? '✓ Verified' : 'Unverified'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/resident/issues/new')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff5600] text-white hover:bg-orange-600 text-xs font-semibold transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
              <button
                onClick={() => navigate('/resident/visitors')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#d3cec6] bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition shadow-xs"
              >
                <Key className="w-3.5 h-3.5" />
                <span>+ Pass</span>
              </button>
            </div>
          </div>

          {/* Critical Summary Cards (Horizontal Scroll) */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
            {/* Active Issues Pulse */}
            <div
              onClick={() => navigate('/resident/issues')}
              className="p-5 rounded-2xl bg-white border border-[#d3cec6] shadow-xs cursor-pointer hover:border-orange-200 transition group shrink-0 w-64"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Active Issues</h3>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-[#111111]">{myIssues.filter((i) => i.status !== 'Resolved' && i.status !== 'Closed').length}</p>
                <span className="text-xs font-semibold text-orange-600 group-hover:underline">View All →</span>
              </div>
            </div>

            {/* Pending Visitor Passes Pulse */}
            <div
              onClick={() => navigate('/resident/visitors')}
              className="p-5 rounded-2xl bg-white border border-[#d3cec6] shadow-xs cursor-pointer hover:border-purple-200 transition group shrink-0 w-64"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Pending Passes</h3>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-[#111111]">{myPasses.length}</p>
                <span className="text-xs font-semibold text-purple-600 group-hover:underline">Manage →</span>
              </div>
            </div>

            {/* Latest Notice Pulse */}
            <div
              onClick={() => navigate('/resident/announcements')}
              className="p-5 rounded-2xl bg-white border border-[#d3cec6] shadow-xs cursor-pointer hover:border-blue-200 transition group shrink-0 w-64"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Latest Notice</h3>
              </div>
              <p className="text-sm font-semibold text-stone-700 h-10 line-clamp-2">{announcements[0]?.title || 'No new notices'}</p>
              <span className="text-xs font-semibold text-blue-600 group-hover:underline mt-2 block">View Board →</span>
            </div>
          </div>
          
          {/* Recent Updates Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">Recent Updates</h3>
              {myNotifications.length > 0 && (
                <button
                  onClick={() => navigate('/resident/notifications')}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  View All ({myNotifications.length}) →
                </button>
              )}
            </div>
            {myNotifications.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-[#d3cec6] text-center text-xs text-stone-500">
                No recent updates available.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myNotifications.slice(0, 4).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationTap(notif)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer shadow-xs flex items-center justify-between gap-3 ${
                      notif.isRead
                        ? 'bg-white border-[#d3cec6] hover:border-stone-400'
                        : 'bg-amber-50/60 border-amber-300'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#111111] truncate">{notif.title}</p>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5600] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-1">{notif.message}</p>
                    </div>
                    <span className="text-xs font-semibold text-stone-700 shrink-0">→</span>
                  </div>
                ))}
              </div>
            )}
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
                  navigate('/resident/issues/new');
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
                onClick={() => navigate(`/resident/issues/${iss.id}`)}
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

      {/* SECTION 7: NOTIFICATIONS */}
      {currentSection === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/resident')}
                className="p-1.5 rounded-xl border border-[#d3cec6] bg-white hover:bg-stone-100 text-stone-700 transition flex items-center justify-center"
                title="Back to Resident Home"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <div>
                <h2 className="text-sm font-bold text-[#111111]">Notifications & Alerts</h2>
                <p className="text-xs text-[#7b7b78]">Real-time activity for Flat {residentBlock}-{residentFlat}</p>
              </div>
            </div>
          </div>

          {myNotifications.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-[#d3cec6] text-center space-y-2">
              <Bell className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-700">No notifications yet</p>
              <p className="text-xs text-stone-500">You're all caught up on colony updates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationTap(notif)}
                  className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs ${
                    notif.isRead
                      ? 'bg-white border-[#d3cec6] hover:border-stone-400'
                      : 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111111]">{notif.title}</span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#ff5600]" />
                        )}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">{notif.message}</p>
                    </div>
                    <span className="text-[10px] text-[#7b7b78] shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => navigate('/resident/issues')}
        onCreated={(createdIssue) => {
          navigate(`/resident/issues/${createdIssue.id}`);
        }}
      />

      <IssueDetailsModal
        issue={selectedIssue}
        onClose={() => navigate('/resident/issues')}
      />

      <VisitorDetailModal
        visitor={selectedVisitor}
        onClose={() => navigate('/resident/visitors')}
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
                onClick={() => navigate('/resident/announcements')}
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
                onClick={() => navigate('/resident/announcements')}
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
