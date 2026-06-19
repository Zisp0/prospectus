import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuthContext from '../context/AuthContext';

/* ──────────────────────────────────────────
   SVG ICONS — Lucide‑style, 1.5px stroke
   ────────────────────────────────────────── */

const LogoMark = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#4F46E5" />
    <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7L13.03 12.7a1.94 1.94 0 01-2.06 0L2 7" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

/* ──────────────────────────────────────────
   DECORATIVE SHAPES for the left panel
   ────────────────────────────────────────── */

const DecorativeCircles = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="450" cy="200" r="180" fill="rgba(255,255,255,0.06)" />
    <circle cx="120" cy="600" r="140" fill="rgba(255,255,255,0.04)" />
    <circle cx="350" cy="650" r="60" fill="rgba(255,255,255,0.05)" />
    <circle cx="500" cy="500" r="40" fill="rgba(255,255,255,0.03)" />
    <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="1.2" fill="rgba(255,255,255,0.12)" />
    </pattern>
    <rect width="600" height="800" fill="url(#dots)" />
    <line x1="0" y1="400" x2="600" y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    <line x1="0" y1="500" x2="600" y2="300" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    <line x1="0" y1="600" x2="600" y2="400" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
  </svg>
);

const Login = () => {
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome!');
      navigate('/');
    } catch (e) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 bg-indigo-600">
        <DecorativeCircles />
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20">
              <LogoMark />
            </div>
            <span className="text-xl font-semibold text-white">Prospectus</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">Manage your prospects<br />with clarity</h1>
          <p className="text-base opacity-80 max-w-sm text-white">
            Streamline your workflow, track progress, and make data‑driven decisions — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {['CSV Upload', 'Real‑time Reports', 'Secure Auth'].map((feature) => (
              <span key={feature} className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white backdrop-blur-sm">
                {feature}
              </span>
            ))}
          </div>
        </div>
        <p className="absolute bottom-6 text-xs opacity-50 text-white">&copy; {new Date().getFullYear()} Prospectus</p>
      </div>

      {/* RIGHT PANEL (FORM) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          {/* Mobile header */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <LogoMark />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Prospectus</span>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-1.5 text-gray-800 dark:text-gray-100">Welcome back</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to your account to continue</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase mb-2 text-gray-600 dark:text-gray-400">Email address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-500"><MailIcon /></span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@company.com"
                  {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                  className="w-full rounded-lg py-3 pl-11 pr-4 text-sm border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
            </div>
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase mb-2 text-gray-600 dark:text-gray-400">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-500"><LockIcon /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                  className="w-full rounded-lg py-3 pl-11 pr-11 text-sm border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>}
            </div>
            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 text-white disabled:opacity-50 transition"
              >
                {isSubmitting && <Spinner />}
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>
          <p className="mt-12 text-center text-xs text-gray-500 dark:text-gray-400">Secured with end‑to‑end encryption</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
