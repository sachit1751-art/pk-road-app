import React from 'react';
import { VisitorEntry, PreApprovedVisitor } from '../../types';
import {
  X,
  Shield,
  Truck,
  User,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Car,
  MapPin,
  Calendar,
  Key,
  ShieldCheck,
  PhoneCall,
  Lock,
} from 'lucide-react';

interface VisitorDetailModalProps {
  visitor: VisitorEntry | null;
  preApproval?: PreApprovedVisitor | null;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  onRevokePass?: (id: string) => void;
}

export const VisitorDetailModal: React.FC<VisitorDetailModalProps> = ({
  visitor,
  preApproval,
  onClose,
  onApprove,
  onDeny,
  onRevokePass,
}) => {
  if (!visitor && !preApproval) return null;

  const isEntry = !!visitor;
  const name = visitor ? visitor.visitorName : preApproval?.visitorName;
  const type = visitor ? visitor.visitorType : preApproval?.visitorType;
  const phone = visitor ? visitor.phone : preApproval?.phone;
  const vehicle = visitor ? visitor.vehicleNumber : preApproval?.vehicleNumber;
  const block = visitor ? visitor.block : preApproval?.block;
  const flatNumber = visitor ? visitor.flatNumber : preApproval?.flatNumber;

  const getVisitorIcon = (t?: string) => {
    switch (t) {
      case 'Delivery':
        return Truck;
      case 'Plumber':
      case 'Electrician':
      case 'Technician':
        return Wrench;
      case 'Cab/driver':
        return Car;
      default:
        return User;
    }
  };

  const Icon = getVisitorIcon(type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#d3cec6] relative space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center shadow-xs">
              <Icon className="w-6 h-6 text-stone-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111111]">{name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                  {type}
                </span>
              </div>
              <p className="text-xs text-[#626260] mt-0.5">
                Destination: Flat {block}-{flatNumber} • Greenwood Estate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="p-3.5 rounded-2xl bg-[#f5f1ec] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7b7b78] font-medium">Current Status:</span>
            {isEntry ? (
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  visitor.status === 'inside'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : visitor.status === 'exited'
                    ? 'bg-stone-200 text-stone-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {visitor.status === 'inside'
                  ? 'Currently Inside Colony'
                  : visitor.status === 'exited'
                  ? 'Exited Premises'
                  : 'Entry Denied'}
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                Active Pre-Approved Pass
              </span>
            )}
          </div>

          {visitor?.isPreApproved && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ⚡ Expedited Entry
            </span>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-[#d3cec6] bg-white">
            <span className="text-[#7b7b78] text-[11px] block">Contact Phone</span>
            <span className="font-semibold text-stone-900 mt-0.5 block">{phone || 'Not provided'}</span>
          </div>

          <div className="p-3 rounded-xl border border-[#d3cec6] bg-white">
            <span className="text-[#7b7b78] text-[11px] block">Vehicle Plate</span>
            <span className="font-semibold text-stone-900 mt-0.5 block">{vehicle || 'None (Pedestrian)'}</span>
          </div>

          {isEntry && (
            <>
              <div className="p-3 rounded-xl border border-[#d3cec6] bg-white">
                <span className="text-[#7b7b78] text-[11px] block">Entry Time & Gate</span>
                <span className="font-semibold text-stone-900 mt-0.5 block">
                  {new Date(visitor.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {visitor.gate}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-[#d3cec6] bg-white">
                <span className="text-[#7b7b78] text-[11px] block">Exit Time</span>
                <span className="font-semibold text-stone-900 mt-0.5 block">
                  {visitor.exitTime
                    ? new Date(visitor.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Still on site'}
                </span>
              </div>

              <div className="col-span-2 p-3 rounded-xl border border-[#d3cec6] bg-white">
                <span className="text-[#7b7b78] text-[11px] block">Duty Guard & Purpose</span>
                <span className="font-semibold text-stone-900 mt-0.5 block">
                  Guard: {visitor.guardName} • Purpose: {visitor.purpose || 'Personal visit'}
                </span>
              </div>
            </>
          )}

          {!isEntry && preApproval && (
            <>
              <div className="p-3 rounded-xl border border-[#d3cec6] bg-white">
                <span className="text-[#7b7b78] text-[11px] block">Passcode (PIN)</span>
                <span className="font-mono font-bold text-stone-900 text-sm mt-0.5 block">{preApproval.passcode}</span>
              </div>

              <div className="p-3 rounded-xl border border-[#d3cec6] bg-white">
                <span className="text-[#7b7b78] text-[11px] block">Validity Type</span>
                <span className="font-semibold text-stone-900 mt-0.5 block">
                  {preApproval.validityType} ({preApproval.validUntil})
                </span>
              </div>

              {preApproval.notes && (
                <div className="col-span-2 p-3 rounded-xl border border-[#d3cec6] bg-white">
                  <span className="text-[#7b7b78] text-[11px] block">Pass Notes</span>
                  <span className="text-stone-800 mt-0.5 block">{preApproval.notes}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#d3cec6] bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Visitor</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {isEntry && visitor.status === 'inside' && visitor.residentApproval === 'pending' && (
              <>
                <button
                  onClick={() => {
                    onDeny?.(visitor.id);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 text-xs font-bold transition"
                >
                  Deny Entry
                </button>
                <button
                  onClick={() => {
                    onApprove?.(visitor.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition shadow-xs"
                >
                  Approve Entry
                </button>
              </>
            )}

            {!isEntry && preApproval && onRevokePass && (
              <button
                onClick={() => {
                  onRevokePass(preApproval.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 text-xs font-bold transition"
              >
                Revoke Pass
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111111] text-white hover:bg-stone-800 text-xs font-semibold transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
