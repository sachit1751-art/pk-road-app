import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  CheckCircle,
  Clock,
  Upload,
  FileText,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, submitVerificationRequest } = useApp();

  const [block, setBlock] = useState(currentUser.block || 'B');
  const [flatNumber, setFlatNumber] = useState(currentUser.flatNumber || '242');
  const [residentType, setResidentType] = useState<'Owner' | 'Tenant' | 'Family'>('Owner');
  const [documentType, setDocumentType] = useState<'Electricity Bill' | 'Rent Agreement' | 'Property Deed' | 'Utility Bill'>('Electricity Bill');
  const [proofDocumentUrl, setProofDocumentUrl] = useState(
    currentUser.proofDocumentUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const sampleDocuments = [
    { label: 'Electricity Bill', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80' },
    { label: 'Rent Agreement', url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80' },
    { label: 'Property Title Deed', url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber.trim() || !proofDocumentUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await submitVerificationRequest({
        block,
        flatNumber: flatNumber.trim(),
        residentType,
        documentType,
        proofDocumentUrl: proofDocumentUrl.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#d3cec6] animate-in fade-in space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <FileText className="w-5 h-5 text-purple-600" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#111111]">
                Resident Verification Application
              </h3>
              <p className="text-xs text-[#7b7b78]">Greenwood Estate Colony RWA Registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-xs font-semibold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notice */}
        {currentUser.verificationStatus === 'rejected' && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Previous Verification Was Declined</span>
            </div>
            <p className="text-rose-900">
              Reason: <em>"{currentUser.rejectionReason || 'Invalid address proof'}"</em>. Please re-submit with clear documentation below.
            </p>
          </div>
        )}

        {currentUser.verificationStatus === 'pending' && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Application Under Review by RWA Admin</span>
              Our office will verify your residency proof and grant access shortly. You can update your submission below.
            </div>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-[#111111]">
              Verification Request Submitted!
            </h4>
            <p className="text-xs text-[#626260]">
              The RWA Admin has received your documents in the verification review queue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
              <p className="font-semibold text-stone-900 mb-0.5">Applicant Details</p>
              <p>Name: <strong>{currentUser.name}</strong> • Email: <strong>{currentUser.email}</strong></p>
            </div>

            {/* Block & Flat Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#111111] mb-1">Block / Tower</label>
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6] bg-white font-medium"
                >
                  <option value="A">Block A</option>
                  <option value="B">Block B</option>
                  <option value="C">Block C</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">
                  Flat Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  placeholder="e.g. 242"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6] font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#111111] mb-1">Resident Type</label>
                <select
                  value={residentType}
                  onChange={(e) => setResidentType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6] bg-white"
                >
                  <option value="Owner">Flat Owner</option>
                  <option value="Tenant">Registered Tenant</option>
                  <option value="Family">Family Member / Dependent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6] bg-white"
                >
                  <option value="Electricity Bill">Electricity Bill</option>
                  <option value="Rent Agreement">Rent Agreement</option>
                  <option value="Property Deed">Property Deed</option>
                  <option value="Utility Bill">Water / Gas Utility Bill</option>
                </select>
              </div>
            </div>

            {/* Proof Document URL & Sample selector */}
            <div>
              <label className="block font-semibold text-[#111111] mb-1">
                Proof of Residency Document (URL or Sample) <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={proofDocumentUrl}
                onChange={(e) => setProofDocumentUrl(e.target.value)}
                placeholder="https://... document or bill image"
                className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6]"
                required
              />

              {/* Sample preset documents for easy testing */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-stone-500">Sample Docs:</span>
                {sampleDocuments.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setProofDocumentUrl(s.url);
                      setDocumentType(s.label as any);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 font-medium"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Preview */}
            {proofDocumentUrl && (
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-semibold text-stone-600 block mb-1">
                  Attached Document Preview:
                </span>
                <img
                  src={proofDocumentUrl}
                  alt="Proof Document"
                  className="w-full h-36 object-cover rounded-lg border border-stone-200"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#111111] text-white font-bold hover:bg-stone-800 shadow-xs"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Verification Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
