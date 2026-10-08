import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  ChevronRight,
  LogOut,
  Car,
} from 'lucide-react';

export const FlatActivity: React.FC = () => {
  const { visitors, currentUser, updateVisitorApproval } = useApp();

  const residentFlat = currentUser.flatNumber || '242';
  const residentBlock = currentUser.block || 'B';

  // Only show visitors for this flat (privacy invariant)
  const flatVisitors = visitors.filter(
    (v) => v.flatNumber === residentFlat && (!v.block || v.block === residentBlock)
  );

  const pendingApprovals = flatVisitors.filter(
    (v) => v.residentApproval === 'pending' && v.status === 'inside'
  );

  const getVisitorIcon = (type: string) => {
    switch (type) {
      case 'Delivery':
        return Truck;
      case 'Plumber':
      case 'Electrician':
      case 'Technician':
        return Wrench;
      default:
        return User;
    }
  };

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 text-stone-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#111111]">
              Private Gate Activity & Visitor History
            </h2>
            <p className="text-xs text-[#626260]">
              Monitored for Flat {residentBlock}-{residentFlat} • Greenwood Security Gate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            {flatVisitors.filter((v) => v.status === 'inside').length} Currently Inside
          </span>
        </div>
      </div>

      {/* Pending Resident Approvals (Flow B - Immediate action) */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>Visitor Waiting at Colony Gate for Approval</span>
          </div>

          <div className="space-y-2">
            {pendingApprovals.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#111111]">{v.visitorName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {v.visitorType}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Purpose: {v.purpose || 'Visit'} • Arrived at {v.gate} (
                    {new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateVisitorApproval(v.id, 'denied')}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Deny</span>
                  </button>
                  <button
                    onClick={() => updateVisitorApproval(v.id, 'approved')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#111111] text-white hover:bg-stone-800 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Allow Entry</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chronological Visitor Log */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider text-stone-500">
          Visitor Logs for Flat {residentBlock}-{residentFlat}
        </h3>

        {flatVisitors.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#d3cec6] text-xs text-stone-500">
            No gate visitors registered for your flat yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {flatVisitors.map((v) => {
              const Icon = getVisitorIcon(v.visitorType);
              const isInside = v.status === 'inside';

              return (
                <div
                  key={v.id}
                  className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isInside ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#111111]">{v.visitorName}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                          {v.visitorType}
                        </span>
                        {isInside ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Inside Colony
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500">Exited</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#626260] mt-1">
                        <span>Purpose: {v.purpose || 'Visit'}</span>
                        {v.vehicleNumber && (
                          <span className="flex items-center gap-1 font-mono text-[11px] text-stone-700">
                            <Car className="w-3 h-3 text-stone-400" />
                            {v.vehicleNumber}
                          </span>
                        )}
                        <span>Gate: {v.gate}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          Entered:{' '}
                          {new Date(v.entryTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {v.exitTime && (
                          <span className="flex items-center gap-1 text-stone-600">
                            <LogOut className="w-3 h-3 text-stone-400" />
                            Exited:{' '}
                            {new Date(v.exitTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.residentApproval === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : v.residentApproval === 'denied'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {v.residentApproval.toUpperCase()}
                    </span>
                    <span className="block text-[10px] text-[#7b7b78] mt-1">
                      Guard: {v.guardName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
