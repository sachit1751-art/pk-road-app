import React, { useState } from 'react';
import { useRouter } from '../router/Router';
import { useApp } from '../context/AppContext';
import {
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  AlertCircle,
  Building2,
  ArrowLeft,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { navigate } = useRouter();
  const {
    signUpWithEmail,
    signInWithGoogle,
    isFirebaseConnected,
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-stone-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the colony guidelines to register.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signUpWithEmail(cleanEmail, password, cleanName, cleanPhone || undefined);
      if (res.success) {
        // Direct new resident to resident dashboard
        navigate('/resident');
      } else {
        setErrorMessage(res.error || 'Failed to create resident account.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      navigate('/resident');
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-up failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/60 px-4 py-8 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        {/* Top Back Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Public Colony Portal
          </button>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-200">
            Resident Enrollment
          </span>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-7 sm:p-9 shadow-sm">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-[#1A2530] text-white shadow-md">
              <Building2 className="h-6 w-6 text-amber-300" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1A2530]">Create Resident Account</h1>
            <p className="mt-1 text-xs text-stone-500">
              Panchkuian Road Railway Colony · Paharganj, New Delhi
            </p>
          </div>

          {/* Verification Notice Banner */}
          <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <span className="font-bold">Colony Onboarding:</span> Accounts are provisioned as unverified residents. You can submit flat proof (electricity bill or deed) in your dashboard for RWA approval.
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anil Kumar"
                  className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 pl-10 pr-4 py-2 text-xs text-stone-900 transition placeholder:text-stone-400 focus:bg-white focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 pl-10 pr-4 py-2 text-xs text-stone-900 transition placeholder:text-stone-400 focus:bg-white focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Mobile Number <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 pl-10 pr-4 py-2 text-xs text-stone-900 transition placeholder:text-stone-400 focus:bg-white focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                {password && (
                  <span className="text-[10px] font-semibold text-stone-500">
                    Strength: {strength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 pl-10 pr-11 py-2 text-xs text-stone-900 transition placeholder:text-stone-400 focus:bg-white focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2 text-stone-400 hover:text-stone-600 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        step <= strength.score ? strength.color : 'bg-stone-200'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 pl-10 pr-4 py-2 text-xs text-stone-900 transition placeholder:text-stone-400 focus:bg-white focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-stone-300 text-[#1A2530] focus:ring-stone-900"
                />
                <span className="text-[11px] leading-tight text-stone-600">
                  I agree to Panchkuian Road Colony guidelines and understand identity proof is needed for official RWA validation.
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A2530] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating Account...
                </span>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Register Resident Account
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-stone-400 font-medium">Or</span>
            </div>
          </div>

          {/* Google Sign-up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isSubmitting || !isFirebaseConnected}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-stone-200 bg-white px-5 py-2.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 hover:border-stone-300 focus:outline-none disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Sign up with Google
          </button>
        </div>

        {/* Footer Navigation Link */}
        <p className="mt-6 text-center text-xs text-stone-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-bold text-[#1A2530] underline-offset-2 hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
