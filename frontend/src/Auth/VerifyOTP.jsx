import React, { useState } from 'react';
import { authAPI } from '../api';

const VerifyOTP = ({ email, onVerified }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!otp || otp.length !== 6) {
        setError('OTP must be 6 digits');
        setLoading(false);
        return;
      }

      const response = await authAPI.verifyOTP({ email, otp });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setVerified(true);
      if (onVerified) setTimeout(() => onVerified(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <svg className="w-16 h-16 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white/90">Email Verified!</h2>
        <p className="text-white/40">Redirecting to blogs...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/60 mb-3">Enter 6-digit OTP</label>
        <input
          type="text"
          maxLength="6"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          className="w-full px-4 py-4 border border-white/[0.08] bg-white/[0.04] rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 text-center text-3xl font-bold text-white placeholder:text-white/15 tracking-[0.3em] transition-all outline-none"
          disabled={loading}
        />
        <p className="mt-3 text-sm text-white/30 text-center">
          Code sent to <strong className="text-white/60">{email}</strong>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-300 text-sm font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_32px_-4px_rgba(99,102,241,0.5)]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Verifying...
          </span>
        ) : 'Verify OTP'}
      </button>
    </form>
  );
};

export default VerifyOTP;
