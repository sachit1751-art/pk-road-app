import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../router/Router';
import { AnnouncementCategory, Department, IssueStatus, VerificationRequest, Issue } from '../../types';
import {
  UserCheck,
  Megaphone,
  AlertTriangle,
  Building,
  Users,
  Wrench,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Send,
  Pin,
  Clock,
  Sparkles,
  ExternalLink,
  FileCheck,
  Eye,
  Check,
  X,
  FileText,
  Radio,
  Settings,
  MoreHorizontal,
  Search,
  Filter,
  Layers,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    issues,
    visitors,
    announcements,
    posts,
    flats,
    publishAnnouncement,
    deleteAnnouncement,
    deletePost,
    updateIssueStatus,
    assignIssueToWorker,
    verificationRequests,
    approveVerificationRequest,
    rejectVerificationRequest,
    preApprovedVisitors,
  } = useApp();

  const { path, navigate, params } = useRouter();

  const currentTab = (params.section as 'overview' | 'issues' | 'residents' | 'announcements' | 'security' | 'more') || 'overview';

  // Residents sub-tab
  const [residentSubTab, setResidentSubTab] = useState<'verifications' | 'directory'>('verifications');

  // Announcement publisher state
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<AnnouncementCategory>('General');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [targetBlock, setTargetBlock] = useState('ALL');
  const [isPinned, setIsPinned] = useState(false);
  const [actionRequired, setActionRequired] = useState(false);

  // Verification review modal state
  const [inspectDocReq, setInspectDocReq] = useState<VerificationRequest | null>(null);
  const [rejectModalReq, setRejectModalReq] = useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('Address on proof document does not match requested flat number.');

  // Issue assignment modal state
  const [assignIssueModal, setAssignIssueModal] = useState<Issue | null>(null);
  const [selectedWorkerUid, setSelectedWorkerUid] = useState('worker-water-1');

  // Filter & Search states
  const [issueFilterStatus, setIssueFilterStatus] = useState<string>('ALL');
  const [issueSearch, setIssueSearch] = useState('');
  const [residentSearch, setResidentSearch] = useState('');

  const openIssues = issues.filter((i) => i.status !== 'Resolved' && i.status !== 'Closed');
  const highPriorityIssues = openIssues.filter((i) => i.priority === 'urgent' || i.priority === 'high');
  const visitorsInside = visitors.filter((v) => v.status === 'inside');
  const pendingVerifications = verificationRequests.filter((r) => r.status === 'pending');

  const deptCounts = issues.reduce((acc, iss) => {
    acc[iss.department] = (acc[iss.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    await publishAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      category: annCategory,
      priority: annPriority,
      targetBlock,
      isPinned,
      authorName: `${currentUser.name} (RWA Management)`,
      actionRequired,
    });

    setAnnTitle('');
    setAnnContent('');
    setShowAnnounceForm(false);
  };

  const handleTriggerEmergencyBroadcast = async () => {
    await publishAnnouncement({
      title: '🚨 IMMEDIATE ATTENTION: Colony Emergency Alert',
      content: 'Critical security/utility alert issued by RWA President. Please check immediate instructions in notice board.',
      category: 'Emergency',
      priority: 'emergency',
      targetBlock: 'ALL',
      isPinned: true,
      authorName: 'RWA President Office',
      actionRequired: true,
    });
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReq) return;

    await rejectVerificationRequest(rejectModalReq.id, rejectReason.trim());
    setRejectModalReq(null);
  };

  const handleConfirmAssign = async () => {
    if (!assignIssueModal) return;
    const workerNames: Record<string, string> = {
      'worker-water-1': 'Suresh Kumar (Plumber)',
      'worker-elec-1': 'Ramesh Singh (Electrician)',
      'worker-san-1': 'Amit Patel (Sanitation)',
      'worker-maint-1': 'Vikas Joshi (General Maintenance)',
    };
    await assignIssueToWorker(
      assignIssueModal.id,
      selectedWorkerUid,
      workerNames[selectedWorkerUid] || 'Field Specialist',
      assignIssueModal.department
    );
    setAssignIssueModal(null);
  };

  const filteredIssues = issues.filter((i) => {
    if (issueFilterStatus === 'OPEN' && (i.status === 'Resolved' || i.status === 'Closed')) return false;
    if (issueFilterStatus === 'RESOLVED' && i.status !== 'Resolved' && i.status !== 'Closed') return false;
    if (issueSearch) {
      const q = issueSearch.toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.department.toLowerCase().includes(q) ||
        i.locationDetails.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold shadow-xs">
            <UserCheck className="w-6 h-6 text-rose-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111111]">RWA Executive Operations Console</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                Administration Active
              </span>
            </div>
            <p className="text-xs text-[#626260] mt-0.5">
              Greenwood Estate Resident Welfare Association • President / General Secretary Console
            </p>
          </div>
        </div>

        {/* Global Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerEmergencyBroadcast}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Emergency Broadcast</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs (Desktop/Tablet) */}
      <nav aria-label="Admin Navigation" className="hidden md:flex bg-white border border-[#d3cec6] rounded-2xl p-1.5 shadow-xs items-center justify-around gap-1">
        {[
          { id: 'overview', label: 'Overview', path: '/admin/overview', icon: Layers },
          { id: 'issues', label: 'Issues', path: '/admin/issues', icon: Wrench, count: openIssues.length },
          { id: 'residents', label: 'Residents', path: '/admin/residents', icon: Users, count: pendingVerifications.length },
          { id: 'announcements', label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
          { id: 'security', label: 'Security', path: '/admin/security', icon: Shield, count: visitorsInside.length },
          { id: 'more', label: 'More', path: '/admin/more', icon: MoreHorizontal },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
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
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* TAB 1: OVERVIEW (COLONY PULSE) */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div
              onClick={() => navigate('/admin/issues')}
              className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs cursor-pointer hover:border-stone-400 transition"
            >
              <span className="text-xs text-[#7b7b78] font-medium block">Open Colony Issues</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-[#111111]">{openIssues.length}</span>
                <span className="text-xs text-rose-600 font-semibold">{highPriorityIssues.length} urgent</span>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Click to view board →</span>
            </div>

            <div
              onClick={() => navigate('/admin/residents')}
              className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs cursor-pointer hover:border-stone-400 transition"
            >
              <span className="text-xs text-[#7b7b78] font-medium block">Verification Requests</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-amber-700">{pendingVerifications.length}</span>
                <span className="text-xs text-amber-800 font-semibold">Action needed</span>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Review documents →</span>
            </div>

            <div
              onClick={() => navigate('/admin/security')}
              className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs cursor-pointer hover:border-stone-400 transition"
            >
              <span className="text-xs text-[#7b7b78] font-medium block">Visitors Inside</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-purple-700">{visitorsInside.length}</span>
                <span className="text-xs text-purple-800 font-semibold">Main & Service</span>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Gate presence log →</span>
            </div>

            <div
              onClick={() => navigate('/admin/announcements')}
              className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs cursor-pointer hover:border-stone-400 transition"
            >
              <span className="text-xs text-[#7b7b78] font-medium block">Active Notices</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-[#111111]">{announcements.length}</span>
                <span className="text-xs text-emerald-600 font-semibold">Official feed</span>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Broadcast & publish →</span>
            </div>
          </div>

          {/* Quick Action & Urgent Alerts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Urgent Issues Queue */}
            <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Urgent Issues Requiring Reassignment ({highPriorityIssues.length})
                </h3>
                <button
                  onClick={() => navigate('/admin/issues')}
                  className="text-xs font-semibold text-stone-700 hover:text-black"
                >
                  View All →
                </button>
              </div>

              {highPriorityIssues.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border">
                  No urgent or emergency issues pending.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {highPriorityIssues.slice(0, 3).map((iss) => (
                    <div
                      key={iss.id}
                      className="p-3.5 rounded-2xl bg-[#f5f1ec] border border-[#d3cec6] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{iss.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">
                            {iss.department}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 mt-0.5 block">
                          Location: {iss.locationDetails} • Assigned: {iss.assignedWorkerName || 'Unassigned'}
                        </span>
                      </div>

                      <button
                        onClick={() => setAssignIssueModal(iss)}
                        className="px-3 py-1.5 rounded-xl bg-[#111111] text-white font-semibold text-xs shrink-0"
                      >
                        Reassign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Department Load Distribution */}
            <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                Department Service Load Distribution
              </h3>

              <div className="space-y-2.5 text-xs">
                {Object.entries(deptCounts).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border">
                    <span className="font-bold text-stone-900">{dept} Authority</span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-600">{count} tickets total</span>
                      <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-800 font-bold text-[10px]">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ISSUES (FULL COLONY BOARD) */}
      {currentTab === 'issues' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {['ALL', 'OPEN', 'RESOLVED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setIssueFilterStatus(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    issueFilterStatus === filter
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-stone-700 border-[#d3cec6] hover:bg-stone-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search issues by title, department, location..."
                value={issueSearch}
                onChange={(e) => setIssueSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#d3cec6] text-xs focus:outline-none focus:border-stone-800"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredIssues.map((iss) => (
              <div
                key={iss.id}
                className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#111111]">{iss.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {iss.department}
                      </span>
                      <span className="text-[10px] font-semibold text-stone-500 font-mono">#{iss.id}</span>
                      {iss.aiConfidence && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" /> AI Routed ({Math.round(iss.aiConfidence * 100)}%)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{iss.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#7b7b78] mt-1">
                      <span>Location: {iss.locationDetails}</span>
                      <span>Assigned: <strong className="text-stone-900">{iss.assignedWorkerName || 'Unassigned'}</strong></span>
                      <span>Status: {iss.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setAssignIssueModal(iss)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#d3cec6] bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition"
                  >
                    Assign
                  </button>

                  {iss.status !== 'Resolved' && (
                    <button
                      onClick={() => updateIssueStatus(iss.id, 'Resolved')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RESIDENTS (VERIFICATION QUEUE & DIRECTORY) */}
      {currentTab === 'residents' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#d3cec6] pb-3">
            <button
              onClick={() => setResidentSubTab('verifications')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                residentSubTab === 'verifications'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-[#d3cec6]'
              }`}
            >
              Verification Queue ({pendingVerifications.length})
            </button>
            <button
              onClick={() => setResidentSubTab('directory')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                residentSubTab === 'directory'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-[#d3cec6]'
              }`}
            >
              Resident Directory & Flats ({flats.length})
            </button>
          </div>

          {/* Subtab 1: Verification Queue */}
          {residentSubTab === 'verifications' && (
            <div className="space-y-3">
              {verificationRequests.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-[#d3cec6] text-xs text-stone-500">
                  No resident verification requests in queue.
                </div>
              ) : (
                verificationRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-white border border-[#d3cec6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#111111]">{req.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            Flat {req.block}-{req.flatNumber}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            {req.residentType}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1">
                          Proof Document: <strong className="text-stone-900">{req.documentType}</strong> • Submitted:{' '}
                          {new Date(req.submittedAt).toLocaleDateString()}
                        </p>
                        {req.rejectionReason && (
                          <p className="text-[11px] text-rose-700 mt-0.5">Admin Note: {req.rejectionReason}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setInspectDocReq(req)}
                        className="px-3 py-1.5 rounded-xl border border-[#d3cec6] bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Document</span>
                      </button>

                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setRejectModalReq(req)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 text-xs font-bold transition"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => approveVerificationRequest(req.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        </>
                      )}

                      {req.status !== 'pending' && (
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {req.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Subtab 2: Directory */}
          {residentSubTab === 'directory' && (
            <div className="space-y-3">
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search resident directory by flat or name..."
                  value={residentSearch}
                  onChange={(e) => setResidentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#d3cec6] text-xs focus:outline-none focus:border-stone-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {flats
                  .filter((f) => !residentSearch || f.flatNumber.includes(residentSearch) || f.occupantNames.some((n) => n.toLowerCase().includes(residentSearch.toLowerCase())))
                  .map((f) => (
                    <div
                      key={`${f.block}-${f.flatNumber}`}
                      className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm">
                          Flat {f.block}-{f.flatNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            f.occupantNames.length > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {f.occupantNames.length > 0 ? 'Occupied' : 'Vacant'}
                        </span>
                      </div>
                      <div className="text-stone-600 space-y-0.5">
                        <p>Residents: <strong className="text-stone-900">{f.occupantNames.join(', ') || 'Unassigned'}</strong></p>
                        <p>Intercom: {f.intercomNumber || `${f.flatNumber}#`}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ANNOUNCEMENTS */}
      {currentTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">
                Official Colony Notices ({announcements.length})
              </h3>
              <p className="text-xs text-[#7b7b78]">Publish official communications with mandatory acknowledgement</p>
            </div>

            <button
              onClick={() => setShowAnnounceForm(!showAnnounceForm)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111111] text-white hover:bg-stone-800 text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Notice</span>
            </button>
          </div>

          {/* New Announcement Form */}
          {showAnnounceForm && (
            <div className="p-6 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-4 animate-in fade-in">
              <h4 className="text-sm font-bold text-[#111111]">New Official Announcement</h4>
              <form onSubmit={handlePublishAnnouncement} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scheduled Lift Maintenance for Block B"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#d3cec6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Content *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Detailed notice for residents..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#d3cec6]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Category</label>
                    <select
                      value={annCategory}
                      onChange={(e) => setAnnCategory(e.target.value as AnnouncementCategory)}
                      className="w-full p-2.5 rounded-xl border border-[#d3cec6] bg-white"
                    >
                      <option value="General">General</option>
                      <option value="Water Shutdown">Water Shutdown</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Security">Security</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Priority</label>
                    <select
                      value={annPriority}
                      onChange={(e) => setAnnPriority(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-[#d3cec6] bg-white"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Target Audience</label>
                    <select
                      value={targetBlock}
                      onChange={(e) => setTargetBlock(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#d3cec6] bg-white"
                    >
                      <option value="ALL">All Residents</option>
                      <option value="Block A">Block A Only</option>
                      <option value="Block B">Block B Only</option>
                      <option value="Block C">Block C Only</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAnnounceForm(false)}
                    className="px-4 py-2 rounded-xl border border-[#d3cec6] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#111111] text-white font-bold hover:bg-stone-800"
                  >
                    Publish Notice Now
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List */}
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-2xl bg-white border border-[#d3cec6] shadow-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                      {ann.category}
                    </span>
                    <span className="text-xs font-bold text-[#111111]">{ann.title}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">{ann.content}</p>
                  <span className="text-[11px] text-[#7b7b78] mt-1 block">
                    Published: {new Date(ann.createdAt).toLocaleString()} • Target: {ann.targetBlock} • {ann.acknowledgedBy?.length || 0} residents confirmed
                  </span>
                </div>

                <button
                  onClick={() => deleteAnnouncement(ann.id)}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY OVERSIGHT */}
      {currentTab === 'security' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs">
              <span className="text-xs text-[#7b7b78] font-medium block">Active Visitors Inside</span>
              <span className="text-2xl font-bold text-stone-900 mt-1 block">{visitorsInside.length}</span>
              <span className="text-[11px] text-purple-600">Across all colony gates</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs">
              <span className="text-xs text-[#7b7b78] font-medium block">Pre-Approved Frequent Passes</span>
              <span className="text-2xl font-bold text-stone-900 mt-1 block">{preApprovedVisitors.length}</span>
              <span className="text-[11px] text-emerald-600">Domestic help & drivers</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs">
              <span className="text-xs text-[#7b7b78] font-medium block">Duty Guard Stations</span>
              <span className="text-2xl font-bold text-stone-900 mt-1 block">2 Active</span>
              <span className="text-[11px] text-stone-500">Main Gate & Service Gate</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#111111]">Real-time Gate Visitor Log</h3>
            <div className="space-y-2">
              {visitors.slice(0, 6).map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-stone-50 border flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-900">{v.visitorName}</span>
                    <span className="text-stone-500 ml-2">Visiting Flat {v.block}-{v.flatNumber} ({v.visitorType})</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.status === 'inside' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MORE (SETTINGS & MODERATION) */}
      {currentTab === 'more' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                <Settings className="w-4 h-4 text-stone-600" /> Colony Configuration
              </h3>
              <div className="space-y-2 text-stone-600">
                <div className="flex justify-between py-1 border-b">
                  <span>Colony Name:</span>
                  <strong className="text-stone-900">Greenwood Estate</strong>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Total Residential Towers:</span>
                  <strong className="text-stone-900">3 Towers (A, B, C)</strong>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Registered Flats:</span>
                  <strong className="text-stone-900">{flats.length} Flats</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>RWA Office Contact:</span>
                  <strong className="text-stone-900">+91 11 2680 9000</strong>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-600" /> Service Authority Staff
              </h3>
              <div className="space-y-2 text-stone-600">
                <div className="flex justify-between py-1 border-b">
                  <span>Water & Plumbing Lead:</span>
                  <strong className="text-stone-900">Suresh Kumar</strong>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Electrical Specialist:</span>
                  <strong className="text-stone-900">Ramesh Singh</strong>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Sanitation Supervisor:</span>
                  <strong className="text-stone-900">Amit Patel</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Head Security Guard:</span>
                  <strong className="text-stone-900">Bahadur Thapa</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Community Moderation */}
          <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <Shield className="w-4 h-4 text-stone-600" /> Community Forum Moderation ({posts.length} posts)
            </h3>
            <p className="text-stone-500">
              Admin audit log for colony public channels. Delete flagged or inappropriate posts.
            </p>

            <div className="space-y-2 pt-1">
              {posts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-stone-50 border flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{p.authorName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-stone-200 rounded">#{p.channel}</span>
                    </div>
                    <p className="text-stone-600 line-clamp-1 mt-0.5">{p.content}</p>
                  </div>
                  <button
                    onClick={() => deletePost(p.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSPECT PROOF DOCUMENT MODAL */}
      {inspectDocReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#d3cec6] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">
                  Residency Proof: {inspectDocReq.name}
                </h3>
                <p className="text-xs text-[#7b7b78]">
                  Target Flat: Block {inspectDocReq.block}-{inspectDocReq.flatNumber} ({inspectDocReq.documentType})
                </p>
              </div>
              <button onClick={() => setInspectDocReq(null)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <div className="rounded-2xl border border-stone-200 overflow-hidden bg-stone-100 max-h-[360px] flex items-center justify-center">
              <img
                src={inspectDocReq.proofDocumentUrl}
                alt="Residency Document Proof"
                className="w-full h-auto object-contain max-h-[360px]"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-stone-100 text-xs">
              <span className="text-stone-500">Document Type: {inspectDocReq.documentType}</span>
              <button
                onClick={() => setInspectDocReq(null)}
                className="px-4 py-2 rounded-xl bg-[#111111] text-white font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT VERIFICATION REASON MODAL */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#d3cec6] space-y-4">
            <h3 className="text-sm font-bold text-[#111111]">Reject Residency Verification</h3>
            <p className="text-xs text-stone-600">
              Provide feedback for {rejectModalReq.name} regarding why their document was rejected.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#d3cec6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="px-4 py-2 rounded-xl border border-[#d3cec6] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN ISSUE MODAL */}
      {assignIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#d3cec6] space-y-4">
            <h3 className="text-sm font-bold text-[#111111]">Assign Issue #{assignIssueModal.id}</h3>
            <p className="text-xs text-stone-600">{assignIssueModal.title}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Select Service Worker</label>
                <select
                  value={selectedWorkerUid}
                  onChange={(e) => setSelectedWorkerUid(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#d3cec6] bg-white"
                >
                  <option value="worker-water-1">Suresh Kumar (Water Authority / Plumber)</option>
                  <option value="worker-elec-1">Ramesh Singh (Electrician)</option>
                  <option value="worker-san-1">Amit Patel (Sanitation)</option>
                  <option value="worker-maint-1">Vikas Joshi (General Maintenance)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignIssueModal(null)}
                  className="px-4 py-2 rounded-xl border border-[#d3cec6] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssign}
                  className="px-4 py-2 rounded-xl bg-[#111111] text-white font-bold hover:bg-stone-800"
                >
                  Assign & Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
