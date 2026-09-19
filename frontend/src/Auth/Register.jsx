import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import VerifyOTP from './VerifyOTP';
import ReCAPTCHA from 'react-google-recaptcha';

const Register = ({ onToggle }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!recaptchaToken) {
      setError('Please verify the reCAPTCHA');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    if (!result.success) {
      setError(result.message);
    } else if (result.requiresVerification) {
      setVerificationSent(true);
      setRegisteredEmail(formData.email);
    }
    setLoading(false);
  };

  const handleOTPVerified = () => {
    window.location.href = '/profile';
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-8 relative overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="w-full max-w-md relative z-10">
          <div className="mb-8 text-center">
            <pre className="text-[5px] leading-[5px] font-mono text-indigo-400 mx-auto mb-4 text-center select-none" aria-hidden="true">{`
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
            <h1 className="text-2xl font-bold text-white/95 mb-2">Verify Your Email</h1>
            <p className="text-white/40 text-sm">We've sent a 6-digit code to your inbox</p>
          </div>
          <VerifyOTP email={registeredEmail} onVerified={handleOTPVerified} />
          <div className="mt-8 text-center border-t border-white/[0.06] pt-6">
            <button onClick={onToggle} className="text-sm text-white/30 hover:text-white/60 transition-colors">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/4 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
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
          <h1 className="text-3xl font-bold text-white/95 mb-2">Create Account</h1>
          <p className="text-white/40 text-sm">Sign up to start sharing your stories</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-300 text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all outline-none text-white placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@email.com"
              className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all outline-none text-white placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Username</label>
            <input
              type="text"
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_.]{3,20}"
              value={formData.username}
              onChange={handleChange}
              placeholder="your_username"
              className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all outline-none text-white placeholder:text-white/20"
            />
            <p className="text-xs text-white/35 mt-1">3-20 chars, letters, numbers, underscore, dot.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all outline-none text-white placeholder:text-white/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m7.538-1.897a3.375 3.375 0 001-2.121M3 3l3.6 3.6m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <ReCAPTCHA
              sitekey="6LfebVAsAAAAAP4BNWw8kJ-eEfhs9ZWsGG4eYSHn"
              onChange={setRecaptchaToken}
              theme="dark"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_32px_-4px_rgba(99,102,241,0.5)]"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/25 leading-relaxed">
          Registration requires email verification. We'll never share your email.
        </p>
        <p>Please keep on this page until verification is complete.</p>

        <div className="mt-6 text-center border-t border-white/[0.06] pt-6">
          <p className="text-sm text-white/30">
            Already have an account?{' '}
            <button onClick={onToggle} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
