import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PreApprovedVisitor, VisitorType } from '../../types';
import {
  ShieldCheck,
  Plus,
  Key,
  Clock,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Share2,
  Calendar,
  User,
  Truck,
  Wrench,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const PreApprovedVisitors: React.FC = () => {
  const {
    currentUser,
    preApprovedVisitors,
    addPreApprovedVisitor,
    togglePreApprovedVisitor,
    deletePreApprovedVisitor,
  } = useApp();

  const residentFlat = currentUser.flatNumber || '242';
  const residentBlock = currentUser.block || 'B';

  const [showAddModal, setShowAddModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorType, setVisitorType] = useState<VisitorType>('Domestic worker');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [validityType, setValidityType] = useState<'Daily / Recurring' | 'Today Only' | 'Custom Date'>('Daily / Recurring');
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [passcode, setPasscode] = useState(String(Math.floor(1000 + Math.random() * 9000)));
  const [notes, setNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter passes for this flat
  const myPasses = preApprovedVisitors.filter(
    (p) => p.flatNumber === residentFlat && (!p.block || p.block === residentBlock)
  );

  const visitorTypes: VisitorType[] = [
    'Domestic worker',
    'Guest',
    'Service provider',
    'Delivery',
    'Technician',
    'Plumber',
    'Electrician',
    'Cab/driver',
    'Other',
  ];

  const handleGeneratePin = () => {
    setPasscode(String(Math.floor(1000 + Math.random() * 9000)));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    await addPreApprovedVisitor({
      flatNumber: residentFlat,
      block: residentBlock,
      visitorName: visitorName.trim(),
      visitorType,
      phone: phone.trim() || '+91 98000 00000',
      vehicleNumber: vehicleNumber.trim() || undefined,
      validityType,
      validUntil: validityType === 'Today Only' ? new Date().toISOString().split('T')[0] : validUntil,
      passcode,
      notes: notes.trim() || undefined,
    });

    setShowAddModal(false);
    setVisitorName('');
    setPhone('');
    setVehicleNumber('');
    setNotes('');
    handleGeneratePin();
  };

  const handleCopyPass = (pass: PreApprovedVisitor) => {
    const text = `Greenwood Estate Pre-Approved Entry Pass\nVisitor: ${pass.visitorName} (${pass.visitorType})\nFlat: ${pass.block}-${pass.flatNumber}\nPasscode: ${pass.passcode}\nValid: ${pass.validityType} (${pass.validUntil})\nPresent this code to security guard at gate for expedited entry.`;
    navigator.clipboard?.writeText(text);
    setCopiedId(pass.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#111111]">
              Pre-Approved Frequent Visitors
            </h2>
            <p className="text-xs text-[#626260]">
              Passcodes allow maids, drivers, tutors, and family instant expedited clearance at the gate
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            handleGeneratePin();
            setShowAddModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-[#111111] text-white hover:bg-stone-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Pre-Approval Pass</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
        <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-stone-900 block">How Expedited Entry Works:</span>
          When your pre-approved visitor arrives at the gate, they provide their name or 4-digit Passcode. The Security Guard terminal automatically flags them as verified, clears entry in 1 click, notifies you, and records the entry/exit in your Flat Activity history.
        </div>
      </div>

      {/* Pre-Approved Passes List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Active Pre-Approvals for Flat {residentBlock}-{residentFlat} ({myPasses.length})
        </h3>

        {myPasses.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#d3cec6] text-xs text-stone-500">
            No pre-approved visitors added yet. Create one for your domestic help, cook, or frequent guests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {myPasses.map((pass) => (
              <div
                key={pass.id}
                className={`p-4 rounded-2xl bg-white border transition shadow-xs space-y-3 ${
                  pass.isActive ? 'border-[#d3cec6]' : 'border-stone-200 opacity-60 bg-stone-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-[#111111]">{pass.visitorName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {pass.visitorType}
                      </span>
                    </div>
                    <span className="text-xs text-stone-500 block">{pass.phone}</span>
                  </div>

                  {/* 4-digit Passcode Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wider">
                      Gate PIN
                    </span>
                    <span className="font-mono text-sm font-black px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg tracking-wider">
                      {pass.passcode}
                    </span>
                  </div>
                </div>

                {/* Validity Badge & Instructions */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#7b7b78]">Validity Schedule:</span>
                    <span className="font-semibold text-stone-800">
                      {pass.validityType} (Until {pass.validUntil})
                    </span>
                  </div>
                  {pass.notes && (
                    <p className="text-[11px] text-stone-600 italic">"{pass.notes}"</p>
                  )}
                </div>

                {/* Footer Controls: Toggle active, Share, Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePreApprovedVisitor(pass.id, !pass.isActive)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition ${
                        pass.isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      }`}
                    >
                      {pass.isActive ? 'Active Pass' : 'Suspended'}
                    </button>

                    <button
                      onClick={() => handleCopyPass(pass)}
                      className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 px-2 py-1 rounded hover:bg-stone-100 flex items-center gap-1"
                      title="Copy pass details"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedId === pass.id ? 'Copied!' : 'Share Pass'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => deletePreApprovedVisitor(pass.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 rounded transition"
                    title="Delete pre-approval"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: New Pre-Approval Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#d3cec6] animate-in fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">
                  Create Pre-Approved Visitor Pass
                </h3>
                <p className="text-xs text-[#7b7b78]">For Flat {residentBlock}-{residentFlat}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 text-xs font-semibold"
              >
                Cancel ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#111111] mb-1">
                  Visitor / Staff Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Sunita Devi (Maid) or Alok Saxena (Tutor)"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">Visitor Type</label>
                  <select
                    value={visitorType}
                    onChange={(e) => setVisitorType(e.target.value as VisitorType)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6] bg-white font-medium"
                  >
                    {visitorTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#111111] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">Validity Type</label>
                  <select
                    value={validityType}
                    onChange={(e) => setValidityType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6] bg-white"
                  >
                    <option value="Daily / Recurring">Daily / Recurring (Maid/Cook/Driver)</option>
                    <option value="Today Only">Today Only (Expected Guest)</option>
                    <option value="Custom Date">Custom Expiry Date</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#111111] mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    disabled={validityType === 'Today Only'}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6] bg-white"
                  />
                </div>
              </div>

              {/* Passcode Generation */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-950 block">4-Digit Entry Passcode</span>
                  <span className="text-[11px] text-amber-800">
                    Visitor provides this code to the guard
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.slice(0, 4))}
                    maxLength={4}
                    className="w-20 text-center font-mono font-bold text-base p-1.5 rounded-lg border border-amber-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePin}
                    className="text-[11px] font-semibold text-amber-800 hover:underline"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">
                  Gate Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Allowed morning hours only, Park two-wheeler in Slot B-12"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#111111] text-white font-bold hover:bg-stone-800 shadow-xs"
                >
                  Save & Activate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
