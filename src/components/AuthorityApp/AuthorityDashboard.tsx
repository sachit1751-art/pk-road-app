import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../router/Router';
import { Issue, Department, IssueStatus } from '../../types';
import {
  Wrench,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  AlertTriangle,
  Upload,
  Lock,
  Send,
  User,
  Filter,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Bell,
  UserCheck,
  Check,
  Calendar,
  Briefcase,
  X,
} from 'lucide-react';

export const AuthorityDashboard: React.FC = () => {
  const {
    currentUser,
    issues,
    updateIssueStatus,
    assignIssueToWorker,
    addIssueComment,
    resolveIssueWithProof,
    notifications,
  } = useApp();

  const { path, navigate, params } = useRouter();

  const currentTab = (params.section as 'work' | 'issues' | 'notifications' | 'profile') || 'work';

  const workerDept = currentUser.department || 'Water';
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(workerDept);
  const [activeTicket, setActiveTicket] = useState<Issue | null>(null);

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Comment state in drawer
  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // On duty state
  const [onDuty, setOnDuty] = useState(true);

  const departments: Department[] = ['Water', 'Electrical', 'Sanitation', 'Maintenance', 'Security'];

  // Check URL deep linking for ticket
  useEffect(() => {
    if (params.id) {
      const found = issues.find((i) => i.id === params.id);
      if (found) setActiveTicket(found);
    }
  }, [params.id, issues]);

  const departmentIssues = issues.filter((i) => {
    if (selectedDeptFilter === 'ALL') return true;
    return i.department === selectedDeptFilter;
  });

  const assignedToMe = issues.filter(
    (i) => i.assignedTo === currentUser.uid || (i.department === workerDept && i.status === 'In Progress')
  );

  const newUnassigned = departmentIssues.filter(
    (i) => (!i.assignedTo || i.status === 'Submitted' || i.status === 'Received') && i.status !== 'Resolved'
  );

  const workerNotifications = notifications.filter(
    (n) => n.type === 'issue_update' || n.type === 'emergency' || n.title.includes(workerDept)
  );

  const sampleProofPhotos = [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80',
  ];

  const handleAcceptTicket = async (ticket: Issue) => {
    await assignIssueToWorker(ticket.id, currentUser.uid, currentUser.name, ticket.department);
    await updateIssueStatus(ticket.id, 'In Progress', `${currentUser.name} accepted the ticket and initiated service.`);
  };

  const handleUpdateStatus = async (ticketId: string, status: IssueStatus) => {
    await updateIssueStatus(ticketId, status);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !newComment.trim()) return;

    await addIssueComment(activeTicket.id, newComment.trim(), isInternalNote);
    setNewComment('');
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;

    await resolveIssueWithProof(
      activeTicket.id,
      proofPhotoUrl.trim() || sampleProofPhotos[0],
      resolutionNotes.trim() || 'Work verified and completed by service authority.'
    );

    setShowResolveModal(false);
    setProofPhotoUrl('');
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Authority Header Banner */}
      <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Wrench className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111111]">Authority Operations Portal</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {currentUser.name} ({workerDept} Authority)
              </span>
            </div>
            <p className="text-xs text-[#626260] mt-0.5">
              Service work orders, field verification proof, and resident updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-800 block">My Active Work</span>
            <span className="text-base font-bold text-purple-950">{assignedToMe.length}</span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Unassigned Pool</span>
            <span className="text-base font-bold text-amber-950">{newUnassigned.length}</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="bg-white border border-[#d3cec6] rounded-2xl p-1.5 shadow-xs flex items-center justify-around gap-1">
        {[
          { id: 'work', label: 'Work', path: '/authority/work', icon: Briefcase, count: assignedToMe.length },
          { id: 'issues', label: 'Issues', path: '/authority/issues', icon: Wrench, count: departmentIssues.length },
          { id: 'notifications', label: 'Notifications', path: '/authority/notifications', icon: Bell, count: workerNotifications.length },
          { id: 'profile', label: 'Profile', path: '/authority/profile', icon: UserCheck },
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

      {/* TAB 1: WORK (MY ACTIVE WORK ORDERS) */}
      {currentTab === 'work' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">
                My Active Work Orders ({assignedToMe.length})
              </h3>
              <p className="text-xs text-[#7b7b78]">Priority dispatch queue assigned to your station</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              ⚡ Actionable Tasks
            </span>
          </div>

          {assignedToMe.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#d3cec6] text-xs text-stone-500 space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
              <p className="font-semibold text-stone-800">You have no pending assigned tickets.</p>
              <p>Check the "Issues" tab to claim unassigned tickets from the department pool.</p>
              <button
                onClick={() => navigate('/authority/issues')}
                className="mt-2 px-4 py-2 rounded-xl bg-[#111111] text-white font-bold"
              >
                Browse Department Pool →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedToMe.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-5 rounded-2xl bg-white border border-[#d3cec6] shadow-xs space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111111]">{ticket.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ticket.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-mono mt-0.5 block">
                        Ticket #{ticket.id} • Flat {ticket.block}-{ticket.flatNumber || 'Common'}
                      </span>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 shrink-0">
                      {ticket.status}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2">{ticket.description}</p>

                  <div className="flex items-center justify-between text-xs text-[#7b7b78] pt-2 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {ticket.locationDetails}
                    </span>
                    <span>Reported: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={() => setActiveTicket(ticket)}
                      className="px-3.5 py-2 rounded-xl border border-[#d3cec6] bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition"
                    >
                      Chat / Notes
                    </button>

                    <button
                      onClick={() => {
                        setActiveTicket(ticket);
                        setShowResolveModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete with Photo Proof</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ISSUES (ALL DEPARTMENT ISSUES POOL) */}
      {currentTab === 'issues' && (
        <div className="space-y-4">
          {/* Department selector filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', ...departments].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDeptFilter(dept)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  selectedDeptFilter === dept
                    ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                    : 'bg-white text-stone-700 border-[#d3cec6] hover:bg-stone-50'
                }`}
              >
                {dept} Pool
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {departmentIssues.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#111111]">{ticket.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {ticket.department}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">#{ticket.id}</span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{ticket.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#7b7b78] mt-1">
                      <span>Location: {ticket.locationDetails}</span>
                      <span>Assigned: <strong className="text-stone-900">{ticket.assignedWorkerName || 'Unassigned'}</strong></span>
                      <span>Status: {ticket.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTicket(ticket)}
                    className="px-3 py-1.5 rounded-xl border border-[#d3cec6] text-xs font-semibold text-stone-800 hover:bg-stone-50 transition"
                  >
                    View
                  </button>

                  {(!ticket.assignedTo || ticket.status === 'Submitted') && (
                    <button
                      onClick={() => handleAcceptTicket(ticket)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#111111] text-white hover:bg-stone-800 text-xs font-bold transition shadow-xs"
                    >
                      Accept Ticket
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {currentTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111111]">
              Department Dispatch Alerts ({workerNotifications.length})
            </h3>
            <span className="text-xs text-[#7b7b78]">Real-time tickets filed by residents</span>
          </div>

          <div className="space-y-2.5">
            {workerNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">{notif.title}</h4>
                    <p className="text-xs text-stone-600 mt-0.5">{notif.message}</p>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {notif.relatedId && (
                  <button
                    onClick={() => {
                      const t = issues.find((i) => i.id === notif.relatedId);
                      if (t) setActiveTicket(t);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#111111] text-white text-xs font-bold shrink-0"
                  >
                    Open Ticket
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE */}
      {currentTab === 'profile' && (
        <div className="space-y-5 max-w-2xl mx-auto">
          <div className="p-6 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-xl">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111111]">{currentUser.name}</h3>
                <p className="text-xs text-[#626260]">Greenwood Estate Maintenance Authority</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 mt-1 inline-block">
                  Specialty: {workerDept} Department
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f1ec] text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-600">Assigned Department:</span>
                <span className="font-bold text-stone-900">{workerDept}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-600">Total Work Orders Resolved:</span>
                <span className="font-bold text-emerald-700">14 completed</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-600">Duty Shift:</span>
                <span className="font-bold text-stone-900">{onDuty ? 'On Duty (Active)' : 'Off Duty'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-[#7b7b78]">Average Resolution Time: 1.8 hrs</span>
              <button
                onClick={() => setOnDuty(!onDuty)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  onDuty ? 'bg-stone-200 text-stone-800' : 'bg-emerald-600 text-white'
                }`}
              >
                {onDuty ? 'Clock Out' : 'Clock In'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLUTION PROOF MODAL */}
      {showResolveModal && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#d3cec6] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-[#111111]">
                Complete Ticket #{activeTicket.id} with Proof
              </h3>
              <button onClick={() => setShowResolveModal(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Upload Resolution Photo Proof URL
                </label>
                <input
                  type="url"
                  placeholder="Paste photo link..."
                  value={proofPhotoUrl}
                  onChange={(e) => setProofPhotoUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#d3cec6]"
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-stone-500">Or use sample photo:</span>
                  {sampleProofPhotos.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setProofPhotoUrl(url)}
                      className="text-[11px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 font-semibold"
                    >
                      Sample {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Completion Notes & Actions Taken *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe root cause and how the issue was resolved..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#d3cec6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#d3cec6] text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                >
                  Mark Resolved & Notify Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET DETAILS & COMMENTS DRAWER */}
      {activeTicket && !showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#d3cec6] max-h-[85vh] flex flex-col space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900">{activeTicket.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {activeTicket.department}
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 mt-0.5 block">
                  Location: {activeTicket.locationDetails} • Status: {activeTicket.status}
                </span>
              </div>
              <button onClick={() => setActiveTicket(null)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f5f1ec] text-stone-800 leading-relaxed">
                {activeTicket.description}
              </div>

              {/* Comments stream */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-stone-900">Worklog & Discussion</h4>
                {(activeTicket.comments || []).length === 0 ? (
                  <p className="text-stone-400">No notes recorded yet.</p>
                ) : (
                  (activeTicket.comments || []).map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border ${
                        c.isInternal
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-stone-900">{c.authorName}</span>
                        {c.isInternal && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded">
                            Internal Tech Note
                          </span>
                        )}
                      </div>
                      <p className="text-stone-700">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comment input form */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-stone-100 shrink-0 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add technician comment or internal note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-[#d3cec6] text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#111111] text-white font-bold text-xs"
                >
                  Send
                </button>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded"
                />
                <span>Internal technician note (Hidden from resident)</span>
              </label>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
