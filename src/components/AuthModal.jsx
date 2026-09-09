import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, CheckCircle, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { authService, validateEmail, validatePassword } from '../services/authService';

// views: 'sign-in' | 'sign-up' | 'forgot-password' | 'verify-email'
export default function AuthModal({ onClose, onAuthSuccess }) {
  const [view, setView] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const emailRef = useRef(null);

  // Focus email input when modal opens or view changes
  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 80);
    setError('');
    setSuccess('');
    setFieldErrors({});
  }, [view]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // --- Validation ---
  function validateSignUpFields() {
    const errs = {};
    if (!displayName.trim()) errs.displayName = 'Display name is required.';
    if (!validateEmail(email)) errs.email = 'Enter a valid email address.';
    const pwErr = validatePassword(password);
    if (pwErr) errs.password = pwErr;
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateSignInFields() {
    const errs = {};
    if (!validateEmail(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // --- Handlers ---
  async function handleSignUp(e) {
    e.preventDefault();
    if (!validateSignUpFields()) return;
    setLoading(true);
    setError('');
    const result = await authService.signUp(email, password, displayName.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setView('verify-email');
    }
  }

  async function handleSignIn(e) {
    e.preventDefault();
    if (!validateSignInFields()) return;
    setLoading(true);
    setError('');
    const result = await authService.signIn(email, password);
    setLoading(false);
    if (result.error) {
      if (result.requiresVerification) {
        setView('verify-email');
        setError(result.error);
      } else {
        setError(result.error);
      }
    } else {
      onAuthSuccess?.(result.user);
      onClose();
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!validateEmail(email)) {
      setFieldErrors({ email: 'Enter a valid email address.' });
      return;
    }
    setLoading(true);
    setError('');
    const result = await authService.sendPasswordReset(email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Password reset email sent to ${email}. Check your inbox!`);
    }
  }

  async function handleResendVerification(e) {
    e.preventDefault();
    setLoading(true);
    const result = await authService.resendVerification();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Verification email resent! Check your inbox.');
    }
  }

  // --- Password strength indicator ---
  function getPasswordStrength(pw) {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: score, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { level: score, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { level: score, label: 'Good', color: '#10b981' };
    return { level: score, label: 'Strong', color: '#06b6d4' };
  }

  const pwStrength = view === 'sign-up' ? getPasswordStrength(password) : null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        {/* Ambient glows */}
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />

        {/* Close Button */}
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        {/* Logo */}
        <div className="auth-logo-row">
          <img src="/logo-blue.png" alt="Blip" style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.9))' }} />
          <span className="auth-brand">Blip</span>
          <span className="auth-brand-tag">nearby now</span>
        </div>

        {/* =================== SIGN IN =================== */}
        {view === 'sign-in' && (
          <>
            <div className="auth-heading-block">
              <h2 className="auth-title">Welcome back</h2>
              <p className="auth-subtitle">Sign in to sync your blips across devices.</p>
            </div>

            <form className="auth-form" onSubmit={handleSignIn} noValidate>
              <AuthInput
                ref={emailRef}
                type="email"
                label="Email address"
                icon={<Mail size={14} />}
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                error={fieldErrors.email}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <AuthInput
                type={showPassword ? 'text' : 'password'}
                label="Password"
                icon={<Lock size={14} />}
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                error={fieldErrors.password}
                placeholder="Your password"
                autoComplete="current-password"
                rightAddon={
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />

              {error && <AuthError message={error} />}

              <button type="button" className="auth-forgot-link" onClick={() => setView('forgot-password')}>
                Forgot your password?
              </button>

              <AuthSubmitBtn loading={loading} label="Sign In" icon={<ArrowRight size={16} />} />
            </form>

            <div className="auth-switch-row">
              <span>Don't have an account?</span>
              <button className="auth-switch-btn" onClick={() => setView('sign-up')}>Sign Up Free</button>
            </div>
          </>
        )}

        {/* =================== SIGN UP =================== */}
        {view === 'sign-up' && (
          <>
            <div className="auth-heading-block">
              <h2 className="auth-title">Create your account</h2>
              <p className="auth-subtitle">Join Blip to save spots and sync across devices.</p>
            </div>

            <form className="auth-form" onSubmit={handleSignUp} noValidate>
              <AuthInput
                ref={emailRef}
                type="text"
                label="Display name"
                icon={<Sparkles size={14} />}
                value={displayName}
                onChange={e => { setDisplayName(e.target.value); setFieldErrors(p => ({ ...p, displayName: '' })); }}
                error={fieldErrors.displayName}
                placeholder="e.g. UrbanFox"
                autoComplete="nickname"
              />
              <AuthInput
                type="email"
                label="Email address"
                icon={<Mail size={14} />}
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                error={fieldErrors.email}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <div>
                <AuthInput
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  icon={<Lock size={14} />}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                  error={fieldErrors.password}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  autoComplete="new-password"
                  rightAddon={
                    <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                />
                {password && (
                  <div className="auth-pw-strength">
                    <div className="pw-strength-bars">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="pw-strength-bar"
                          style={{ background: i <= pwStrength.level ? pwStrength.color : 'var(--border-light)' }}
                        />
                      ))}
                    </div>
                    <span style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                  </div>
                )}
              </div>
              <AuthInput
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm password"
                icon={<Lock size={14} />}
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); }}
                error={fieldErrors.confirmPassword}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                rightAddon={
                  <button type="button" className="auth-eye-btn" onClick={() => setShowConfirmPassword(p => !p)} tabIndex={-1}>
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />

              {error && <AuthError message={error} />}

              <AuthSubmitBtn loading={loading} label="Create Account" icon={<ArrowRight size={16} />} />
            </form>

            <div className="auth-switch-row">
              <span>Already have an account?</span>
              <button className="auth-switch-btn" onClick={() => setView('sign-in')}>Sign In</button>
            </div>
          </>
        )}

        {/* =================== FORGOT PASSWORD =================== */}
        {view === 'forgot-password' && (
          <>
            <div className="auth-heading-block">
              <h2 className="auth-title">Reset password</h2>
              <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
            </div>

            <form className="auth-form" onSubmit={handleForgotPassword} noValidate>
              <AuthInput
                ref={emailRef}
                type="email"
                label="Email address"
                icon={<Mail size={14} />}
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                error={fieldErrors.email}
                placeholder="you@example.com"
                autoComplete="email"
              />

              {error && <AuthError message={error} />}
              {success && <AuthSuccess message={success} />}

              {!success && <AuthSubmitBtn loading={loading} label="Send Reset Link" icon={<Mail size={16} />} />}
            </form>

            <div className="auth-switch-row">
              <button className="auth-back-btn" onClick={() => setView('sign-in')}>
                <ArrowLeft size={13} /> Back to Sign In
              </button>
            </div>
          </>
        )}

        {/* =================== VERIFY EMAIL =================== */}
        {view === 'verify-email' && (
          <div className="auth-verify-screen">
            <div className="auth-verify-icon">
              <Mail size={32} className="text-cyan-400" />
              <div className="auth-verify-ping" />
            </div>
            <h2 className="auth-title">Check your email</h2>
            <p className="auth-subtitle">
              We sent a verification link to <strong style={{ color: 'var(--accent-cyan)' }}>{email}</strong>.
              Click the link in the email to activate your account, then sign in.
            </p>

            {error && <AuthError message={error} />}
            {success && <AuthSuccess message={success} />}

            <div className="auth-verify-actions">
              <button className="auth-main-btn" onClick={() => setView('sign-in')}>
                <CheckCircle size={16} /> I've verified — Sign In
              </button>
              <button
                className="auth-ghost-btn"
                onClick={handleResendVerification}
                disabled={loading}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Resend verification email'}
              </button>
            </div>

            <div className="auth-switch-row" style={{ marginTop: 8 }}>
              <button className="auth-back-btn" onClick={() => setView('sign-up')}>
                <ArrowLeft size={13} /> Back to Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Trust footer */}
        <div className="auth-trust-footer">
          <ShieldCheck size={11} className="text-emerald-400" />
          <span>Secured by Firebase Authentication · End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components ----

const AuthInput = React.forwardRef(function AuthInput(
  { type, label, icon, value, onChange, error, placeholder, autoComplete, rightAddon },
  ref
) {
  return (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <div className={`auth-input-wrap ${error ? 'auth-input-error' : ''}`}>
        <span className="auth-input-icon">{icon}</span>
        <input
          ref={ref}
          type={type}
          className="auth-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        {rightAddon && <span className="auth-input-right">{rightAddon}</span>}
      </div>
      {error && (
        <p className="auth-field-error">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
});

function AuthSubmitBtn({ loading, label, icon }) {
  return (
    <button type="submit" className="auth-main-btn" disabled={loading}>
      {loading ? (
        <><Loader2 size={16} className="animate-spin" /> Hang tight...</>
      ) : (
        <>{icon}<span>{label}</span></>
      )}
    </button>
  );
}

function AuthError({ message }) {
  return (
    <div className="auth-error-banner">
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
}

function AuthSuccess({ message }) {
  return (
    <div className="auth-success-banner">
      <CheckCircle size={14} />
      <span>{message}</span>
    </div>
  );
}
