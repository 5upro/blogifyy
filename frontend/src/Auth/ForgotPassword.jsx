import React, { useState } from 'react';
import { authAPI } from '../api';

const ForgotPassword = ({ onBackToLogin }) => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.forgotPassword(email);
      setMessage(response.data.message);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword({ email, otp, newPassword });
      setMessage(response.data.message);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/4 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <pre className="text-[5px] leading-[5px] font-mono text-indigo-400 mx-auto mb-5 text-center select-none" aria-hidden="true">{`
       +++++++
       ++++++++
       ++++++++
        +++++++
         ++++++
        +++++++
         ++++
     +++++++++++
      ++++++++++
     ++++  +++= 
      =++++++++
        ++++++
         ++++
          ++
          +
`}</pre>
          <h1 className="text-3xl font-bold text-white/95">
            {step === 'success' ? 'Password Reset!' : 'Reset Password'}
          </h1>
          <p className="text-white/40 mt-2 text-sm">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'otp' && 'Enter the OTP and your new password'}
            {step === 'success' && 'You can now sign in with your new password'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-300 text-sm font-medium flex-1">{error}</span>
          </div>
        )}

        {message && !error && step === 'otp' && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-emerald-300 text-sm font-medium flex-1">{message}</span>
          </div>
        )}

        {/* Step 1: Enter email */}
        {step === 'email' && (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-white/60 mb-2">
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all outline-none text-white placeholder:text-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_32px_-4px_rgba(99,102,241,0.5)]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending OTP...
                </>
              ) : 'Send Reset OTP'}
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP + new password */}
        {step === 'otp' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-3">Enter 6-digit OTP</label>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-4 border border-white/[0.08] bg-white/[0.04] rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 text-center text-3xl font-bold text-white placeholder:text-white/15 tracking-[0.3em] transition-all outline-none"
              />
              <p className="mt-3 text-sm text-white/30 text-center">
                Code sent to <strong className="text-white/60">{email}</strong>
              </p>
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-white/60 mb-2">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all outline-none text-white placeholder:text-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_32px_-4px_rgba(99,102,241,0.5)]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Resetting...
                </>
              ) : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setError(''); setOtp(''); setNewPassword(''); }}
              className="w-full py-2 text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              Didn't receive the code? Try again
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <svg className="w-16 h-16 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-emerald-300 font-medium">{message}</p>
            <button
              onClick={onBackToLogin}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold transition-all hover:shadow-[0_0_32px_-4px_rgba(99,102,241,0.5)]"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {step !== 'success' && (
          <div className="mt-8 text-center border-t border-white/[0.06] pt-6">
            <p className="text-sm text-white/30">
              Remember your password?{' '}
              <button onClick={onBackToLogin} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
