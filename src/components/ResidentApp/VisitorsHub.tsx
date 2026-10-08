import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VisitorEntry, PreApprovedVisitor, VisitorType } from '../../types';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  User,
  Wrench,
  Phone,
  AlertCircle,
  Plus,
  Key,
  Copy,
  ChevronRight,
  Search,
  Calendar,
  Lock,
  PhoneCall,
} from 'lucide-react';
import { VisitorDetailModal } from './VisitorDetailModal';

export const VisitorsHub: React.FC = () => {
  const {
    visitors,
    currentUser,
    updateVisitorApproval,
    preApprovedVisitors,
    addPreApprovedVisitor,
    togglePreApprovedVisitor,
    deletePreApprovedVisitor,
  } = useApp();

  const [activeSegment, setActiveSegment] = useState<'inside' | 'preapproved' | 'history'>('inside');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorEntry | null>(null);
  const [selectedPreApproval, setSelectedPreApproval] = useState<PreApprovedVisitor | null>(null);
  const [showAddPassModal, setShowAddPassModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add pass form state
  const residentFlat = currentUser.flatNumber || '242';
  const residentBlock = currentUser.block || 'B';
  const [passName, setPassName] = useState('');
  const [passType, setPassType] = useState<VisitorType>('Domestic worker');
  const [passPhone, setPassPhone] = useState('');
  const [passVehicle, setPassVehicle] = useState('');
  const [validityType, setValidityType] = useState<'Daily / Recurring' | 'Today Only' | 'Custom Date'>('Daily / Recurring');
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [passcode, setPasscode] = useState(String(Math.floor(1000 + Math.random() * 9000)));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter visitors for this flat (privacy invariant)
  const myFlatVisitors = visitors.filter(
    (v) => v.flatNumber === residentFlat && (!v.block || v.block === residentBlock)
  );

  const currentlyInside = myFlatVisitors.filter((v) => v.status === 'inside');
  const entryHistory = myFlatVisitors.filter((v) => v.status !== 'inside' || activeSegment === 'history');
  const myPreApprovedPasses = preApprovedVisitors.filter(
    (p) => p.flatNumber === residentFlat && (!p.block || p.block === residentBlock)
  );

  const pendingApprovalAtGate = currentlyInside.filter((v) => v.residentApproval === 'pending');

  const filteredHistory = entryHistory.filter((v) => {
    if (!searchQuery) return true;
    return (
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitorType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.includes(searchQuery)
    );
  });

  const handleGeneratePin = () => {
    setPasscode(String(Math.floor(1000 + Math.random() * 9000)));
  };

  const handleCreatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passName.trim()) return;

    await addPreApprovedVisitor({
      flatNumber: residentFlat,
      block: residentBlock,
      visitorName: passName.trim(),
      visitorType: passType,
      phone: passPhone.trim() || '+91 98000 00000',
      vehicleNumber: passVehicle.trim() || undefined,
      validityType,
      validUntil: validityType === 'Today Only' ? new Date().toISOString().split('T')[0] : validUntil,
      passcode,
    });

    setShowAddPassModal(false);
    setPassName('');
    setPassPhone('');
    setPassVehicle('');
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
      <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Shield className="w-6 h-6 text-stone-200" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111111]">
              Visitor Security & Passes • Flat {residentBlock}-{residentFlat}
            </h2>
            <p className="text-xs text-[#626260]">
              Real-time gate logging, visitor pre-approvals, and entry authorization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddPassModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111111] text-white hover:bg-stone-800 text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Pre-Approved Pass</span>
          </button>
        </div>
      </div>

      {/* Immediate Gate Approval Alerts Banner if someone waiting */}
      {pendingApprovalAtGate.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>Visitor at Gate Awaiting Resident Authorization</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-800">
              {pendingApprovalAtGate.length} waiting
            </span>
          </div>

          <div className="space-y-2">
            {pendingApprovalAtGate.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#111111]">{v.visitorName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {v.visitorType}
                    </span>
                    <span className="text-[11px] text-stone-500">at {v.gate}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Purpose: {v.purpose || 'Visit'} • Arrived at{' '}
                    {new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateVisitorApproval(v.id, 'denied')}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 text-xs font-bold transition"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => updateVisitorApproval(v.id, 'approved')}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition shadow-xs"
                  >
                    Approve Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Three Segments Switcher */}
      <div className="flex items-center gap-1.5 border-b border-[#d3cec6] pb-3">
        {[
          { id: 'inside', label: 'Currently Inside', count: currentlyInside.length, icon: Shield },
          { id: 'preapproved', label: 'Expected & Pre-Approved', count: myPreApprovedPasses.length, icon: Key },
          { id: 'history', label: 'Entry & Exit History', count: entryHistory.length, icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSegment === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSegment(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-[#d3cec6] hover:bg-stone-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEGMENT 1: CURRENTLY INSIDE */}
      {activeSegment === 'inside' && (
        <div className="space-y-3">
          {currentlyInside.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-[#d3cec6] text-xs text-stone-500 space-y-1">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-stone-800">No visitors currently inside for your flat.</p>
              <p className="text-stone-500">Security guard will log all entries at Main Gate or Service Gate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentlyInside.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVisitor(v)}
                  className="p-4 rounded-2xl bg-white border border-[#d3cec6] hover:border-stone-400 transition cursor-pointer shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold">
                        {v.visitorType === 'Delivery' ? <Truck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#111111]">{v.visitorName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            {v.visitorType}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          Entered: {new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Gate: {v.gate}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 shrink-0">
                      Inside
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-stone-100 text-[#7b7b78]">
                    <span>Duty Guard: {v.guardName}</span>
                    <span className="text-stone-900 font-semibold flex items-center gap-1">
                      View Detail <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEGMENT 2: EXPECTED & PRE-APPROVED PASSES */}
      {activeSegment === 'preapproved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7b7b78]">
              Pre-approved visitors use a 4-digit PIN for expedited entry at gate without calling you.
            </span>
            <button
              onClick={() => setShowAddPassModal(true)}
              className="text-xs font-bold text-stone-900 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Pass
            </button>
          </div>

          {myPreApprovedPasses.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-[#d3cec6] text-xs text-stone-500 space-y-2">
              <Key className="w-8 h-8 text-stone-400 mx-auto opacity-70" />
              <p className="font-semibold text-stone-800">No pre-approved passes created yet.</p>
              <p>Add regular domestic help, drivers, tutors, or visiting relatives for instant gate entry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myPreApprovedPasses.map((pass) => (
                <div
                  key={pass.id}
                  className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111111]">{pass.visitorName}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {pass.visitorType}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Validity: {pass.validityType} ({pass.validUntil})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold bg-[#f5f1ec] px-2.5 py-1 rounded-lg border border-[#d3cec6] text-stone-900">
                        {pass.passcode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <button
                      onClick={() => handleCopyPass(pass)}
                      className="text-[11px] font-semibold text-stone-700 hover:text-black flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedId === pass.id ? 'Copied!' : 'Copy Code & Share'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPreApproval(pass)}
                        className="text-[11px] font-semibold text-stone-800 hover:underline"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => deletePreApprovedVisitor(pass.id)}
                        className="text-[11px] text-rose-600 hover:underline"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEGMENT 3: HISTORY */}
      {activeSegment === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search visitor history by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#d3cec6] text-xs focus:outline-none focus:border-stone-800"
              />
            </div>
            <span className="text-xs text-[#7b7b78]">{filteredHistory.length} total entries</span>
          </div>

          <div className="space-y-2.5">
            {filteredHistory.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVisitor(v)}
                className="p-3.5 rounded-2xl bg-white border border-[#d3cec6] hover:border-stone-400 transition cursor-pointer shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                    {v.visitorType === 'Delivery' ? <Truck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#111111]">{v.visitorName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {v.visitorType}
                      </span>
                      {v.isPreApproved && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                          Pre-Approved
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Entry: {new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {v.exitTime ? `Exit: ${new Date(v.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Inside'} • {v.gate}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    v.status === 'inside'
                      ? 'bg-amber-100 text-amber-800'
                      : v.status === 'exited'
                      ? 'bg-stone-100 text-stone-700'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Pre-Approved Pass Modal */}
      {showAddPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#d3cec6] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-[#111111]">Create Pre-Approved Entry Pass</h3>
              <button
                onClick={() => setShowAddPassModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Visitor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh (Driver), Sunita (Maid)"
                  value={passName}
                  onChange={(e) => setPassName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#d3cec6] focus:outline-none focus:border-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Visitor Type</label>
                  <select
                    value={passType}
                    onChange={(e) => setPassType(e.target.value as VisitorType)}
                    className="w-full p-2.5 rounded-xl border border-[#d3cec6] bg-white"
                  >
                    <option value="Domestic worker">Domestic worker</option>
                    <option value="Guest">Guest</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Cab/driver">Cab/driver</option>
                    <option value="Technician">Technician</option>
                    <option value="Service provider">Service provider</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98000 00000"
                    value={passPhone}
                    onChange={(e) => setPassPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#d3cec6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Validity Period</label>
                <select
                  value={validityType}
                  onChange={(e) => setValidityType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#d3cec6] bg-white"
                >
                  <option value="Daily / Recurring">Daily / Recurring (6 Months)</option>
                  <option value="Today Only">Today Only</option>
                  <option value="Custom Date">Custom Date</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-stone-700">4-Digit Gate Passcode</label>
                  <button
                    type="button"
                    onClick={handleGeneratePin}
                    className="text-[11px] text-amber-700 hover:underline font-semibold"
                  >
                    Regenerate PIN
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#d3cec6] font-mono text-center text-lg font-bold tracking-widest bg-stone-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPassModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#d3cec6] text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#111111] text-white font-bold hover:bg-stone-800 transition"
                >
                  Save Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Detail Modal */}
      <VisitorDetailModal
        visitor={selectedVisitor}
        preApproval={selectedPreApproval}
        onClose={() => {
          setSelectedVisitor(null);
          setSelectedPreApproval(null);
        }}
        onApprove={(id) => updateVisitorApproval(id, 'approved')}
        onDeny={(id) => updateVisitorApproval(id, 'denied')}
        onRevokePass={(id) => deletePreApprovedVisitor(id)}
      />
    </div>
  );
};
