import React, { useState } from 'react';
import { useRouter } from '../router/Router';
import { useApp } from '../context/AppContext';
import { DEMO_PROFILES } from '../data/seedData';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Wrench,
  KeyRound,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const {
    signInWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    isFirebaseConnected,
    currentUser,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Demo accounts helper
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  const redirectByRole = (role: string) => {
    if (role === 'rwa_admin') {
      navigate('/admin/overview');
    } else if (role === 'security_guard') {
      navigate('/security/gate');
    } else if (role.includes('worker')) {
      navigate('/authority/work');
    } else {
      navigate('/resident');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signInWithEmail(cleanEmail, password);
      if (res.success) {
        // Find role to redirect
        const demo = DEMO_PROFILES.find((p) => p.email.toLowerCase() === cleanEmail.toLowerCase());
        const role = demo?.role || currentUser.role || 'resident';
        redirectByRole(role);
      } else {
        setErrorMessage(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      navigate('/resident');
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in was unsuccessful.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    if (!resetEmail.trim()) {
      setResetMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    setResetSubmitting(true);
    try {
      const res = await sendPasswordReset(resetEmail.trim());
      if (res.success) {
        setResetMessage({
          type: 'success',
          text: `Password reset instructions sent to ${resetEmail.trim()}. Check your inbox.`,
        });
      } else {
        setResetMessage({ type: 'error', text: res.error || 'Could not send reset instructions.' });
      }
    } catch (err: any) {
      setResetMessage({ type: 'error', text: err.message || 'Error sending password reset.' });
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleQuickDemoSelect = async (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword('colonyPass@2026');
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await signInWithEmail(demoEmail, 'colonyPass@2026');
      if (res.success) {
        redirectByRole(demoRole);
      } else {
        setErrorMessage(res.error || 'Quick login failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/60 px-4 py-8 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        {/* Public Header / Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Public Colony Portal
          </button>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            PK Road Portal
          </span>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-7 sm:p-9 shadow-sm">
          {/* Colony Branding Header */}
          <div className="text-center">
            <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-[#1A2530] text-white shadow-md">
              <Building2 className="h-6 w-6 text-amber-300" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1A2530]">Sign in to PK Road</h1>
            <p className="mt-1 text-xs text-stone-500">
              Panchkuian Road Railway Colony · Resident & Staff Portal
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Forgot Password View */}
          {isForgotPasswordOpen ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800 mb-1">
                  <KeyRound className="h-4 w-4 text-amber-600" />
                  Reset Your Password
                </div>
                <p className="text-xs text-stone-600">
                  Enter your registered colony email address to receive password reset instructions.
                </p>

                {resetMessage && (
                  <div
                    className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-xs ${
                      resetMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {resetMessage.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    )}
                    <span>{resetMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordResetSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="e.g. rahul.resident@greenwood.org"
                        className="w-full rounded-xl border border-stone-200 pl-9 pr-3 py-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={resetSubmitting}
                      className="flex-1 rounded-xl bg-[#1A2530] py-2 text-xs font-semibold text-white hover:bg-stone-900 transition disabled:opacity-50"
                    >
                      {resetSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPasswordOpen(false);
                        setResetMessage(null);
                      }}
                      className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Email & Password Form */
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com or colony ID"
                    className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 pl-10 pr-4 py-2.5 text-xs text-stone-900 transition placeholder:text-stone-400 focus:bg-white focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordOpen(true);
                      setResetEmail(email);
                    }}
                    className="text-xs font-medium text-[#1A2530] underline-offset-2 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 pl-10 pr-11 py-2.5 text-xs text-stone-900 transition placeholder:text-stone-400 focus:bg-white focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-stone-400 hover:text-stone-600 transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-stone-300 text-[#1A2530] focus:ring-stone-900"
                  />
                  <span className="text-xs text-stone-600">Remember credentials</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A2530] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign In to Portal
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social / Google Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-stone-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
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
            Continue with Google
          </button>

          {/* Quick Demo Personas Dropdown */}
          <div className="mt-6 border-t border-stone-100 pt-5">
            <button
              type="button"
              onClick={() => setShowDemoSelector(!showDemoSelector)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-stone-700 hover:text-stone-900 transition"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Quick 1-Click Demo Accounts
              </span>
              <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-medium">
                {showDemoSelector ? 'Hide' : 'Show Accounts'}
              </span>
            </button>

            {showDemoSelector && (
              <div className="mt-3 space-y-2">
                <p className="text-[11px] text-stone-500">
                  Select any persona to test role-based dashboards and capabilities:
                </p>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('rahul.resident@greenwood.org', 'resident')}
                    className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/60 p-2.5 text-left transition hover:bg-stone-100 hover:border-stone-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">Rahul Sharma</div>
                        <div className="text-[10px] text-stone-500">Resident · Flat B-242 (Verified)</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('admin.rwa@greenwood.org', 'rwa_admin')}
                    className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/60 p-2.5 text-left transition hover:bg-stone-100 hover:border-stone-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">Vikramaditya Roy</div>
                        <div className="text-[10px] text-stone-500">RWA Admin Committee · Flat C-301</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('balwant.security@colony.local', 'security_guard')}
                    className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/60 p-2.5 text-left transition hover:bg-stone-100 hover:border-stone-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">Balwant Singh</div>
                        <div className="text-[10px] text-stone-500">Security Guard · Main Gate</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('suresh.water@colony.local', 'water_worker')}
                    className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/60 p-2.5 text-left transition hover:bg-stone-100 hover:border-stone-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                        <Wrench className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">Suresh Kumar</div>
                        <div className="text-[10px] text-stone-500">Maintenance Authority · Water Supply</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation Link */}
        <p className="mt-6 text-center text-xs text-stone-600">
          Don&rsquo;t have a registered account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-bold text-[#1A2530] underline-offset-2 hover:underline"
          >
            Register as Resident
          </button>
        </p>
      </div>
    </div>
  );
};
