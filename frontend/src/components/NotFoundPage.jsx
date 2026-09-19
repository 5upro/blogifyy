import React from 'react';

const NotFoundPage = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center">
        <div className="mb-8 relative">
          <div className="text-9xl font-bold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent animate-pulse">
            404
          </div>
          <div className="absolute inset-0 text-9xl font-bold text-indigo-500/10 blur-lg">404</div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white/90 mb-4">Page Not Found</h1>
        <p className="text-lg text-white/40 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-4">
          <button
            onClick={onGoHome}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)] w-full sm:w-auto"
          >
            Go Back Home
          </button>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1] px-6 py-3 rounded-xl font-medium transition-all"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1] px-6 py-3 rounded-xl font-medium transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600 rounded-full blur-[120px] opacity-10" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-600 rounded-full blur-[120px] opacity-10" />
      </div>
    </div>
  );
};

export default NotFoundPage;