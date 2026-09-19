import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';

const Login = ({ onToggle, onForgotPassword }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

    const result = await login(formData);
    if (!result.success) {
      setError(result.message);
    } else {
      navigate('/profile');
    }
    setLoading(false);
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
          <h1 className="text-3xl font-bold text-white/95">Welcome back</h1>
          <p className="text-white/40 mt-2 text-sm">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-300 text-sm font-medium flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-white/60 mb-2">
              Email or Username
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              value={formData.identifier}
              onChange={handleChange}
              placeholder="you@email.com or username"
              className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all outline-none text-white placeholder:text-white/20"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-white/60">
                Password
              </label>
              <button type="button" onClick={onForgotPassword} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all outline-none text-white placeholder:text-white/20"
            />
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
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_32px_-4px_rgba(99,102,241,0.5)]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/[0.06] pt-6">
          <p className="text-sm text-white/30">
            Don't have an account?{' '}
            <button onClick={onToggle} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;