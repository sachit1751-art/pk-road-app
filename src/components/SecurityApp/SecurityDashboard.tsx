import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../router/Router';
import { VisitorType, VisitorEntry, PreApprovedVisitor } from '../../types';
import {
  Shield,
  Truck,
  User,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Car,
  Phone,
  LogOut,
  MapPin,
  AlertCircle,
  ExternalLink,
  Zap,
  Key,
  ShieldCheck,
  PhoneCall,
  Bell,
  AlertTriangle,
  Radio,
  UserCheck,
} from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const {
    visitors,
    registerVisitor,
    markVisitorExit,
    flats,
    currentUser,
    preApprovedVisitors,
    expeditePreApprovedVisitorEntry,
    announcements,
    publishAnnouncement,
  } = useApp();

  const { path, navigate, params } = useRouter();

  const currentTab = (params.section as 'gate' | 'visitors' | 'history' | 'alerts' | 'profile') || 'gate';

  const [searchQuery, setSearchQuery] = useState('');
  const [passcodeSearch, setPasscodeSearch] = useState('');

  // Gate entry form state
  const [visitorName, setVisitorName] = useState('');
  const [visitorType, setVisitorType] = useState<VisitorType>('Delivery');
  const [block, setBlock] = useState('B');
  const [flatNumber, setFlatNumber] = useState('242');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [gate, setGate] = useState('Main Gate');
  const [successEntryId, setSuccessEntryId] = useState<string | null>(null);

  // Shift & Alerts state
  const [onDuty, setOnDuty] = useState(true);
  const [emergencyAlertText, setEmergencyAlertText] = useState('');
  const [showEmergencyTrigger, setShowEmergencyTrigger] = useState(false);

  const visitorTypes: VisitorType[] = [
    'Delivery',
    'Guest',
    'Plumber',
    'Electrician',
    'Technician',
    'Domestic worker',
    'Cab/driver',
    'Service provider',
    'Other',
  ];

  // Quick brand shortcuts for 1-tap rapid entry
  const deliveryShortcuts = [
    { label: 'Amazon', type: 'Delivery' as VisitorType, purpose: 'Amazon Courier Drop' },
    { label: 'Blinkit', type: 'Delivery' as VisitorType, purpose: 'Grocery Delivery' },
    { label: 'Swiggy / Zomato', type: 'Delivery' as VisitorType, purpose: 'Food Delivery' },
    { label: 'Urban Company', type: 'Technician' as VisitorType, purpose: 'Home Appliance Service' },
    { label: 'Uber / Ola', type: 'Cab/driver' as VisitorType, purpose: 'Cab Pickup / Drop' },
  ];

  const handleShortcutClick = (sc: typeof deliveryShortcuts[0]) => {
    setVisitorName(`${sc.label} Agent`);
    setVisitorType(sc.type);
    setPurpose(sc.purpose);
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    const newEntry = await registerVisitor({
      visitorName: visitorName.trim(),
      visitorType,
      block,
      flatNumber,
      phone: phone.trim() || '+91 98000 00000',
      vehicleNumber: vehicleNumber.trim() || undefined,
      purpose: purpose.trim() || `${visitorType} visit`,
      gate,
      guardName: currentUser.name || 'Bahadur Thapa',
    });

    setSuccessEntryId(newEntry.id);
    setTimeout(() => {
      setSuccessEntryId(null);
      setVisitorName('');
      setPhone('');
      setVehicleNumber('');
      setPurpose('');
      navigate('/security/visitors');
    }, 1200);
  };

  // 1-Click Expedited Entry for Pre-Approved Visitors
  const handleExpediteEntry = async (pass: PreApprovedVisitor) => {
    const entry = await expeditePreApprovedVisitorEntry(pass, gate);
    setSuccessEntryId(entry.id);
    setTimeout(() => {
      setSuccessEntryId(null);
      navigate('/security/visitors');
    }, 1200);
  };

  const handleTriggerSecurityEmergency = async () => {
    if (!emergencyAlertText.trim()) return;
    await publishAnnouncement({
      title: '🚨 SECURITY GATE ALERT: ' + emergencyAlertText.trim(),
      content: `Issued by Gate Security (${currentUser.name} at ${gate}). Immediate attention required for colony residents and patrol staff.`,
      category: 'Security',
      priority: 'emergency',
      targetBlock: 'ALL',
      isPinned: true,
      authorName: `${currentUser.name} (Gate Security)`,
      actionRequired: true,
    });
    setEmergencyAlertText('');
    setShowEmergencyTrigger(false);
  };

  const currentInsideVisitors = visitors.filter((v) => v.status === 'inside');
  const exitedVisitors = visitors.filter((v) => v.status === 'exited');
  const activePreApproved = preApprovedVisitors.filter((p) => p.isActive);

  // Check if current form flat has matching pre-approved passes
  const matchingPreApprovedForSelectedFlat = activePreApproved.filter(
    (p) => p.flatNumber === flatNumber && (!p.block || p.block === block)
  );

  const filteredVisitors = visitors.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.visitorName.toLowerCase().includes(q) ||
      v.flatNumber.toLowerCase().includes(q) ||
      (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q)) ||
      v.visitorType.toLowerCase().includes(q)
    );
  });

  const filteredPreApproved = activePreApproved.filter((p) => {
    if (passcodeSearch) {
      return (
        p.passcode.includes(passcodeSearch) ||
        p.visitorName.toLowerCase().includes(passcodeSearch.toLowerCase()) ||
        p.flatNumber.includes(passcodeSearch)
      );
    }
    return true;
  });

  const securityNotices = announcements.filter(
    (a) => a.category === 'Security' || a.priority === 'emergency'
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-3xl bg-white border border-[#d3cec6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Shield className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111111]">Security Gate Terminal</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Gate Station Online
              </span>
            </div>
            <p className="text-xs text-[#626260] mt-0.5">
              Duty Guard: <strong className="text-stone-900 font-bold">{currentUser.name || 'Bahadur Thapa'}</strong> • Station: {gate}
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Inside Colony</span>
            <span className="text-base font-bold text-amber-950">{currentInsideVisitors.length}</span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-800 block">Active Passes</span>
            <span className="text-base font-bold text-purple-950">{activePreApproved.length}</span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-stone-100 border border-[#d3cec6] text-center">
            <span className="text-[10px] uppercase font-bold text-stone-600 block">Exited Today</span>
            <span className="text-base font-bold text-stone-900">{exitedVisitors.length}</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs (Desktop/Tablet) */}
      <nav aria-label="Security Navigation" className="hidden md:flex bg-white border border-[#d3cec6] rounded-2xl p-1.5 shadow-xs items-center justify-around gap-1">
        {[
          { id: 'gate', label: 'Gate', path: '/security/gate', icon: Shield },
          { id: 'visitors', label: 'Visitors', path: '/security/visitors', icon: User, count: currentInsideVisitors.length },
          { id: 'history', label: 'History', path: '/security/history', icon: Clock },
          { id: 'alerts', label: 'Alerts', path: '/security/alerts', icon: AlertTriangle, count: securityNotices.length },
          { id: 'profile', label: 'Profile', path: '/security/profile', icon: UserCheck },
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

      {/* SUCCESS CONFIRMATION BANNER */}
      {successEntryId && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-xs block">Gate Entry Authorized & Resident Notified!</span>
              <span className="text-[11px] text-emerald-800">
                Logged to Flat {block}-{flatNumber} private ledger. Boom barrier opened.
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-white/80 px-2 py-1 rounded border">
            ID: #{successEntryId.slice(0, 8)}
          </span>
        </div>
      )}

      {/* TAB 1: GATE ENTRY & EXPEDITED VERIFICATION */}
      {currentTab === 'gate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Rapid Gate Entry Form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-6 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Log New Gate Visitor / Delivery
                </h3>
                <p className="text-xs text-[#7b7b78] mt-0.5">
                  Creates immediate entry record and sends alert to resident
                </p>
              </div>

              {/* 1-Tap Delivery Shortcuts */}
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1.5 uppercase tracking-wider">
                  ⚡ 1-Tap Quick Brand Fill:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {deliveryShortcuts.map((sc) => (
                    <button
                      key={sc.label}
                      type="button"
                      onClick={() => handleShortcutClick(sc)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition"
                    >
                      + {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Visitor Name / Company <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amazon Agent, Rajesh (Guest)"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#d3cec6] text-xs focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Visitor Category</label>
                    <select
                      value={visitorType}
                      onChange={(e) => setVisitorType(e.target.value as VisitorType)}
                      className="w-full p-2.5 rounded-xl border border-[#d3cec6] bg-white text-xs"
                    >
                      {visitorTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Flat & Tower destination */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#f5f1ec] border border-[#d3cec6]">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Tower / Block</label>
                    <select
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#d3cec6] bg-white text-xs font-bold"
                    >
                      <option value="A">Tower A</option>
                      <option value="B">Tower B</option>
                      <option value="C">Tower C</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block font-semibold text-stone-800 mb-1">
                      Flat Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 242, 101, 302"
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#d3cec6] bg-white text-xs font-bold font-mono"
                    />
                  </div>

                  {matchingPreApprovedForSelectedFlat.length > 0 && (
                    <div className="col-span-3 pt-2 border-t border-stone-200">
                      <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        Found {matchingPreApprovedForSelectedFlat.length} pre-approved regular visitor pass(es) for Flat {block}-{flatNumber}! Check right column to expedite.
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98000 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#d3cec6] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Vehicle Plate (If Driving)</label>
                    <input
                      type="text"
                      placeholder="e.g. DL 03 AX 9920"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#d3cec6] text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Entry Gate</label>
                    <select
                      value={gate}
                      onChange={(e) => setGate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#d3cec6] bg-white text-xs"
                    >
                      <option value="Main Gate">Main Gate</option>
                      <option value="Service Gate">Service Gate</option>
                      <option value="Rear Gate">Rear Gate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Purpose Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Parcel delivery, AC repair"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#d3cec6] text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#111111] hover:bg-stone-800 text-white font-bold text-xs transition shadow-xs flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Gate Entry</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Pre-Approved Passcode Verification Panel */}
          <div className="space-y-5">
            <div className="p-6 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-700" />
                  <h3 className="text-sm font-bold text-[#111111]">Verify 4-Digit Passcode</h3>
                </div>
                <p className="text-xs text-[#7b7b78] mt-0.5">
                  Expedite entry for maids, drivers, regular guests
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Enter 4-digit PIN, name, or flat..."
                  value={passcodeSearch}
                  onChange={(e) => setPasscodeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#f5f1ec] rounded-xl border border-[#d3cec6] text-xs font-mono focus:outline-none focus:border-stone-800"
                />
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredPreApproved.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
                    No matching pre-approved passcodes found.
                  </div>
                ) : (
                  filteredPreApproved.map((pass) => (
                    <div
                      key={pass.id}
                      className="p-3.5 rounded-2xl bg-[#f5f1ec] border border-[#d3cec6] space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-stone-900">{pass.visitorName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-white rounded border border-stone-200 text-stone-700">
                              {pass.visitorType}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-600 block mt-0.5">
                            Flat {pass.block}-{pass.flatNumber} • Valid: {pass.validityType}
                          </span>
                        </div>

                        <span className="font-mono text-sm font-black bg-white px-2 py-0.5 rounded border border-stone-300 text-stone-900 shadow-2xs">
                          {pass.passcode}
                        </span>
                      </div>

                      <button
                        onClick={() => handleExpediteEntry(pass)}
                        className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>1-Click Expedited Entry</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISITORS INSIDE COLONY */}
      {currentTab === 'visitors' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">
                Active Visitors Inside Colony ({currentInsideVisitors.length})
              </h3>
              <p className="text-xs text-[#7b7b78]">Click "Mark Exit" when visitor leaves the gate</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900">
              Live Presence
            </span>
          </div>

          {currentInsideVisitors.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#d3cec6] text-xs text-stone-500">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-stone-800">No visitors currently inside the premises.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentInsideVisitors.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs space-y-3"
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
                        <span className="text-[11px] text-stone-600 block mt-0.5 font-medium">
                          Visiting Flat <strong className="text-stone-900 font-bold">{v.block}-{v.flatNumber}</strong>
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Inside
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 space-y-1 bg-[#f5f1ec] p-2.5 rounded-xl">
                    <div className="flex justify-between">
                      <span>Entered at:</span>
                      <strong className="text-stone-900">
                        {new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({v.gate})
                      </strong>
                    </div>
                    {v.vehicleNumber && (
                      <div className="flex justify-between">
                        <span>Vehicle Plate:</span>
                        <strong className="font-mono text-stone-900">{v.vehicleNumber}</strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Resident Contact:</span>
                      <a href={`tel:${v.phone}`} className="text-blue-600 font-semibold hover:underline">
                        {v.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => markVisitorExit(v.id)}
                      className="px-4 py-2 rounded-xl bg-[#111111] hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Mark Exit & Depart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETE AUDIT HISTORY */}
      {currentTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search history by name, flat, vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#d3cec6] text-xs focus:outline-none focus:border-stone-800"
              />
            </div>
            <span className="text-xs text-[#7b7b78]">{filteredVisitors.length} total entries</span>
          </div>

          <div className="space-y-2.5">
            {filteredVisitors.map((v) => {
              const isInside = v.status === 'inside';
              return (
                <div
                  key={v.id}
                  className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isInside ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {v.visitorType === 'Delivery' ? <Truck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#111111]">{v.visitorName}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {v.visitorType}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          Flat {v.block}-{v.flatNumber}
                        </span>
                        {v.isPreApproved && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-emerald-600" />
                            Pre-Approved
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600 mt-1">
                        <span>Purpose: {v.purpose || 'Visit'}</span>
                        {v.vehicleNumber && (
                          <span className="font-mono text-[11px] text-stone-700">Plate: {v.vehicleNumber}</span>
                        )}
                        <span>Gate: {v.gate}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#7b7b78] mt-1">
                        <span>
                          Entry:{' '}
                          {new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {v.exitTime && (
                          <span>
                            Exit:{' '}
                            {new Date(v.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        <span>Approval: <strong className="uppercase">{v.residentApproval}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isInside ? (
                      <button
                        onClick={() => markVisitorExit(v.id)}
                        className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Mark Exit</span>
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1.5 rounded-xl">
                        Exited
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ALERTS & EMERGENCY GATE PROTOCOLS */}
      {currentTab === 'alerts' && (
        <div className="space-y-5">
          {/* Emergency Gate Broadcast Trigger Card */}
          <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs animate-pulse">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-950">Security Gate Emergency Broadcast</h3>
                  <p className="text-xs text-rose-800">Direct instant broadcast to all resident devices</p>
                </div>
              </div>

              <button
                onClick={() => setShowEmergencyTrigger(!showEmergencyTrigger)}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition shadow-xs"
              >
                {showEmergencyTrigger ? 'Cancel Alert' : 'Trigger Security Alert'}
              </button>
            </div>

            {showEmergencyTrigger && (
              <div className="pt-3 border-t border-rose-200 space-y-3">
                <input
                  type="text"
                  placeholder="Describe emergency (e.g. Unauthorized entry attempt, fire near gate, gate barrier failure)..."
                  value={emergencyAlertText}
                  onChange={(e) => setEmergencyAlertText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-rose-300 bg-white text-xs"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleTriggerSecurityEmergency}
                    className="px-5 py-2 rounded-xl bg-rose-900 text-white font-bold text-xs hover:bg-black transition"
                  >
                    Broadcast to All Residents & Staff Now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Security Notices */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Active Security & Safety Notices ({securityNotices.length})
            </h3>
            {securityNotices.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    {ann.priority.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-[#111111]">{ann.title}</span>
                </div>
                <p className="text-xs text-stone-600">{ann.content}</p>
                <span className="text-[11px] text-[#7b7b78] block">
                  Published: {new Date(ann.createdAt).toLocaleString()} by {ann.authorName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROFILE & SHIFT MANAGEMENT */}
      {currentTab === 'profile' && (
        <div className="space-y-5 max-w-2xl mx-auto">
          <div className="p-6 rounded-3xl bg-white border border-[#d3cec6] shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-xl">
                BT
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111111]">{currentUser.name || 'Bahadur Thapa'}</h3>
                <p className="text-xs text-[#626260]">Security Personnel • Greenwood Estate Gate Force</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 mt-1 inline-block">
                  Badge: SEC-0429
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f1ec] text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-600">Assigned Gate Post:</span>
                <span className="font-bold text-stone-900">{gate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-600">Active Shift:</span>
                <span className="font-bold text-stone-900">08:00 - 20:00 (Day Shift)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-600">Duty Status:</span>
                <span className="font-bold text-emerald-700">On Duty (Active)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-[#7b7b78]">Shift entries logged: {visitors.length}</span>
              <button
                onClick={() => setOnDuty(!onDuty)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  onDuty ? 'bg-stone-200 text-stone-800' : 'bg-emerald-600 text-white'
                }`}
              >
                {onDuty ? 'Pause Shift' : 'Resume Shift'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
