import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Issue } from '../../types';
import {
  X,
  Clock,
  User,
  Wrench,
  CheckCircle,
  MessageSquare,
  Send,
  AlertTriangle,
  Sparkles,
  MapPin,
  Star,
} from 'lucide-react';

interface IssueDetailsModalProps {
  issue: Issue | null;
  onClose: () => void;
}

export const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({ issue, onClose }) => {
  const { currentUser, addIssueComment } = useApp();
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!issue) return null;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSending(true);
    try {
      await addIssueComment(issue.id, commentText.trim(), false);
      setCommentText('');
    } finally {
      setIsSending(false);
    }
  };

  // Filter out internal authority notes from resident view
  const visibleComments = (issue.comments || []).filter(
    (c) => !c.isInternal || currentUser.role !== 'resident'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Assigned':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Closed':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      default:
        return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#d3cec6] my-8 animate-in fade-in duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(issue.status)}`}>
                {issue.status}
              </span>
              <span className="text-[11px] font-semibold text-stone-600 px-2 py-0.5 rounded bg-stone-100">
                {issue.department} Dept
              </span>
              <span className="text-xs text-[#7b7b78]">Ticket #{issue.id}</span>
            </div>
            <h2 className="text-base font-bold text-[#111111]">{issue.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {/* Metadata banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-stone-50 text-xs border border-stone-200">
            <div>
              <span className="text-[#7b7b78] block text-[10px]">Location</span>
              <span className="font-semibold text-stone-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-stone-500" />
                {issue.locationDetails}
              </span>
            </div>
            <div>
              <span className="text-[#7b7b78] block text-[10px]">Priority</span>
              <span className="font-semibold capitalize text-stone-800 block mt-0.5">
                {issue.priority}
              </span>
            </div>
            <div>
              <span className="text-[#7b7b78] block text-[10px]">Assigned Worker</span>
              <span className="font-semibold text-stone-800 block mt-0.5">
                {issue.assignedWorkerName || 'Pending Assignment'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-[#111111] mb-1">Problem Description</h3>
            <p className="text-xs text-stone-700 leading-relaxed bg-white p-3 rounded-xl border border-stone-100">
              {issue.description}
            </p>
          </div>

          {/* AI Info pill if present */}
          {issue.aiConfidence && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>AI Automated Route: {issue.department} ({issue.issueType})</span>
              </div>
              <span className="text-[10px] text-amber-700 font-bold">
                {Math.round(issue.aiConfidence * 100)}% Confidence
              </span>
            </div>
          )}

          {/* Photos: Reported Photo vs Resolution Proof */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {issue.photoUrl && (
              <div>
                <span className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Reported Photo
                </span>
                <img
                  src={issue.photoUrl}
                  alt="Issue photo"
                  className="w-full h-36 object-cover rounded-xl border border-stone-200"
                />
              </div>
            )}
            {issue.proofPhotoUrl && (
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 block mb-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Resolution Proof Photo
                </span>
                <img
                  src={issue.proofPhotoUrl}
                  alt="Proof photo"
                  className="w-full h-36 object-cover rounded-xl border border-emerald-300 ring-2 ring-emerald-100"
                />
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div>
            <h3 className="text-xs font-bold text-[#111111] mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              Activity History & Progress Timeline
            </h3>
            <div className="space-y-2 border-l-2 border-stone-200 ml-2 pl-3">
              {(issue.timeline || []).map((t, idx) => (
                <div key={t.id || idx} className="relative pb-1">
                  <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-stone-500 ring-2 ring-white" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">{t.action}</span>
                    <span className="text-[10px] text-[#7b7b78]">
                      {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#626260]">
                    By {t.performedBy} {t.details ? `• ${t.details}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Discussion Thread */}
          <div className="pt-2 border-t border-stone-100">
            <h3 className="text-xs font-bold text-[#111111] mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
              Issue Communication ({visibleComments.length})
            </h3>

            <div className="space-y-2 mb-3">
              {visibleComments.length === 0 ? (
                <p className="text-xs text-[#7b7b78] italic">No messages yet. Ask a question or update status below.</p>
              ) : (
                visibleComments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-xl text-xs border ${
                      c.authorId === currentUser.uid
                        ? 'bg-stone-50 border-stone-200 text-stone-800'
                        : 'bg-blue-50/50 border-blue-100 text-blue-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[11px]">
                        {c.authorName} ({c.authorRole})
                      </span>
                      <span className="text-[10px] text-[#7b7b78]">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Reply to worker or ask for update..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#d3cec6] focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
              <button
                type="submit"
                disabled={isSending || !commentText.trim()}
                className="px-3 py-2 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
