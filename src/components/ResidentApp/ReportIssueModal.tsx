import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Department, Priority, Issue } from '../../types';
import {
  X,
  Sparkles,
  Camera,
  MapPin,
  AlertCircle,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (createdIssue: Issue) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { currentUser, submitIssue, classifyIssueWithAI } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationDetails, setLocationDetails] = useState(
    currentUser.flatNumber ? `Flat ${currentUser.block || 'B'}-${currentUser.flatNumber}` : 'Colony Grounds'
  );
  const [block, setBlock] = useState(currentUser.block || 'B');
  const [flatNumber, setFlatNumber] = useState(currentUser.flatNumber || '242');
  const [photoUrl, setPhotoUrl] = useState('');
  const [manualCategory, setManualCategory] = useState<Department>('Water');

  // AI State
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiResult, setAiResult] = useState<{
    department: Department;
    issueType: string;
    priority: Priority;
    location: string;
    confidence: number;
    summary: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  // Preset sample scenarios for quick testing
  const samplePrompts = [
    {
      label: 'Water Leakage',
      text: 'Water is leaking near flat 242 from the main vertical pipe line onto the corridor floor.',
      location: '2nd Floor Corridor outside Flat 242',
      img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Streetlight Issue',
      text: 'Street light outside B block pathway is dark and flickering, creating hazard for walkers.',
      location: 'B Block garden pathway pole B-04',
      img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Garbage Overflow',
      text: 'Garbage has not been collected for two days near gate collection bins, spreading foul odor.',
      location: 'Main Gate Waste Bay',
      img: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: 'Elevator Glitch',
      text: 'Lift #2 in Block C is jerking during descent and the floor indicator is malfunctioning.',
      location: 'Block C Lift #2',
      img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const handleApplyPreset = (preset: typeof samplePrompts[0]) => {
    setTitle(preset.text.slice(0, 60) + '...');
    setDescription(preset.text);
    setLocationDetails(preset.location);
    setPhotoUrl(preset.img);
    handleTriggerAI(preset.text, preset.location);
  };

  const handleTriggerAI = async (textToClassify = description, loc = locationDetails) => {
    if (!textToClassify.trim()) return;
    setIsClassifying(true);
    try {
      const res = await classifyIssueWithAI(textToClassify, loc, manualCategory);
      setAiResult(res);
      setManualCategory(res.department);
      if (!title) {
        setTitle(res.summary.slice(0, 70));
      }
    } finally {
      setIsClassifying(false);
    }
  };

  const handleCaptureCamera = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const department = aiResult ? aiResult.department : manualCategory;
      const priority = aiResult ? aiResult.priority : 'normal';
      const issueType = aiResult ? aiResult.issueType : `${department} Maintenance`;

      const created = await submitIssue({
        title: title || `${department} Issue at ${locationDetails}`,
        description,
        category: department,
        department,
        issueType,
        priority,
        block,
        flatNumber: flatNumber || undefined,
        locationDetails,
        photoUrl: photoUrl || undefined,
        aiConfidence: aiResult?.confidence,
        aiSummary: aiResult?.summary,
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        if (onCreated) {
          onCreated(created);
        } else {
          onClose();
        }
        setSubmittedSuccess(false);
        setTitle('');
        setDescription('');
        setAiResult(null);
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#d3cec6] my-8 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#111111]">Report Colony Problem</h2>
              <p className="text-xs text-[#7b7b78]">AI will automatically classify & route to the authority</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#111111]">Ticket Submitted & Dispatched!</h3>
            <p className="text-xs text-[#626260] max-w-sm mx-auto">
              AI classified the issue and assigned it to the relevant department authority. You will receive updates here.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Quick Sample Presets */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Quick Test Scenarios (Click to test AI routing):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition font-medium"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#111111]">
                  Describe the Issue <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleTriggerAI()}
                  disabled={!description.trim() || isClassifying}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 disabled:opacity-50"
                >
                  {isClassifying ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Classifying...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Analyze with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  if (description.trim() && !aiResult) {
                    handleTriggerAI();
                  }
                }}
                rows={3}
                placeholder="e.g. Water is leaking near flat 242 from the pipe joint onto the floor..."
                className="w-full text-xs p-3 rounded-xl border border-[#d3cec6] focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
                required
              />
            </div>

            {/* AI Classification Feedback Banner */}
            {aiResult && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>AI Classification: {aiResult.department} Department</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {Math.round(aiResult.confidence * 100)}% Confidence
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-amber-950 pt-1">
                  <div>
                    <span className="text-amber-700">Issue Type:</span>{' '}
                    <span className="font-semibold">{aiResult.issueType}</span>
                  </div>
                  <div>
                    <span className="text-amber-700">Calculated Priority:</span>{' '}
                    <span className="font-semibold capitalize">{aiResult.priority}</span>
                  </div>
                  <div className="col-span-2 text-stone-700 text-[11px] italic">
                    "{aiResult.summary}"
                  </div>
                </div>
              </div>
            )}

            {/* Title / Summary */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Short Title / Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pipeline leakage in 2nd floor shaft"
                className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6] focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            {/* Location & Flat Inputs */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">Block / Tower</label>
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#d3cec6] bg-white"
                >
                  <option value="A">Block A</option>
                  <option value="B">Block B</option>
                  <option value="C">Block C</option>
                  <option value="General">Common Grounds</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">Flat # (Optional)</label>
                <input
                  type="text"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  placeholder="242"
                  className="w-full text-xs p-2 rounded-xl border border-[#d3cec6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">Department</label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as Department)}
                  className="w-full text-xs p-2 rounded-xl border border-[#d3cec6] bg-white font-medium"
                >
                  <option value="Water">Water / Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Maintenance">Maintenance / Lift</option>
                  <option value="Security">Security / Gate</option>
                </select>
              </div>
            </div>

            {/* Specific Landmark/Location */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Location Details / Landmark
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="e.g. Near lift lobby, 2nd floor Block B"
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#d3cec6]"
                />
              </div>
            </div>

            {/* Photo Attachment & Camera Capability */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#111111]">
                  Attach Evidence Photo
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition">
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>Open Camera / Capture</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleCaptureCamera}
                  />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste image URL or use camera capture above..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#d3cec6]"
                />
                {photoUrl && (
                  <div className="relative shrink-0">
                    <img
                      src={photoUrl}
                      alt="Evidence Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-[#d3cec6]"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-700 transition"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit buttons */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#111111] text-white hover:bg-stone-800 disabled:opacity-50 transition shadow-xs flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit & Dispatch Ticket'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
