import React from 'react';
import { useRouter } from '../router/Router';
import { useApp } from '../context/AppContext';
import { LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { signInWithGoogle, isFirebaseConnected } = useApp();

  return (
    <div className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex flex-col items-center max-w-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A2530] text-white">
          <HouseMark className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-xl font-bold tracking-tight text-[#1A2530]">Welcome back</h1>
        <p className="mt-1 text-sm text-stone-600">Sign in to your account to continue.</p>

        <div className="mt-8 w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              disabled={!isFirebaseConnected}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A2530] px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-900 disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              Continue with Google
            </button>

            {!isFirebaseConnected && (
              <p className="text-xs text-stone-500">Firebase is not connected yet. Sign-in is disabled until the app is configured.</p>
            )}
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
            <span>or</span>
            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-stone-400">Email / password</span>
            <span>coming soon</span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-stone-600">
          Don&rsquo;t have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-semibold text-[#1A2530] underline-offset-2 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

function HouseMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
