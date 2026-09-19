import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
//import { Turnstile } from '@marsidev/react-turnstile';
//import HCaptcha from '@hcaptcha/react-hcaptcha';


export default function Contact() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ loading: false, submitted: false, error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, submitted: false, error: '' });

    try {
      const formData = new FormData(e.target);
      const apiKey = import.meta.env.VITE_WEB3_ACCESS_KEY;
      formData.append('access_key', apiKey);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ loading: false, submitted: true, error: '' });
        e.target.reset();

        setTimeout(() => {
          setStatus(prev => ({ ...prev, submitted: false }));
        }, 5000);
      } else {
        setStatus({
          loading: false,
          submitted: false,
          error: data.message || 'Oops! There was a problem submitting your form.'
        });
      }
    } catch (error) {
      setStatus({
        loading: false,
        submitted: false,
        error: 'Network error. Please check your connection and try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden font-sans text-white">

      <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

      <nav className="fixed w-full top-0 z-50 bg-[#050508]/40 backdrop-blur-xl border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/oldlogo.png" alt="Blogify" className="h-10 w-15 object-contain drop-shadow-lg" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                Blogify
              </span>
            </div>

            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-all duration-300"
            >
              <ArrowLeft size={16} className="text-white/60 group-hover:text-white group-hover:-translate-x-1 transition-all" />
              <span className="text-sm font-medium text-white/70 group-hover:text-white">Back</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
              Let's Connect
            </h1>
            <p className="text-lg text-white/50 font-light max-w-xl mx-auto">
              Have a question, feedback, or a suggestion? Drop us a message below and our team will get back to you.
            </p>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />

            {status.submitted && (
              <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="text-emerald-400" size={20} />
                <p className="text-emerald-200/90 text-sm font-medium">
                  Message sent successfully! We'll be in touch.
                </p>
              </div>
            )}

            {status.error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <AlertCircle className="text-red-400 min-w-[20px]" size={20} />
                <p className="text-red-200/90 text-sm font-medium">{status.error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-white/70 ml-1">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="w-full px-5 py-3.5 rounded-2xl border border-white/[0.08] bg-black/20 text-white placeholder:text-white/20 focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-white/70 ml-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    className="w-full px-5 py-3.5 rounded-2xl border border-white/[0.08] bg-black/20 text-white placeholder:text-white/20 focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                  />
                </div>

              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-white/70 ml-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  placeholder="How can we help?"
                  className="w-full px-5 py-3.5 rounded-2xl border border-white/[0.08] bg-black/20 text-white placeholder:text-white/20 focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-white/70 ml-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="5"
                  placeholder="Share your thoughts..."
                  className="w-full px-5 py-3.5 rounded-2xl border border-white/[0.08] bg-black/20 text-white placeholder:text-white/20 focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                />
              </div>

              {/* <Turnstile
                siteKey="null"
                options={{ theme: 'dark' }}
                className="my-4"
              /> */}
              <button
                type="submit"
                disabled={status.loading}
                className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-medium py-4 px-6 rounded-2xl transition-all disabled:opacity-50"
              >
                {status.loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-10 pt-8 border-t border-white/[0.06]">
              <p className="text-center text-white/50 text-sm">
                Prefer to email directly? Drop us a line at <br className="sm:hidden" />
                <a
                  href="mailto:blogify@email.com"
                  className="inline-block mt-2 sm:mt-0 ml-1 font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  blogify@email.com
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
