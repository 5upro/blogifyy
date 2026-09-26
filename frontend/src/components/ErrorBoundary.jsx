import React from 'react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled interface error:', error);
    console.error('Component stack:', info?.componentStack);

    Sentry.captureException(error, {
      contexts: {
        react: { componentStack: info?.componentStack }
      }
    });
  }

  handleRetry() {
    this.setState({ error: null });
  }

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white/90 mb-3">Something went wrong</h1>
          <p className="text-sm text-white/50 leading-relaxed mb-5">
            The page hit an unexpected error and stopped rendering. Nothing was lost, and retrying usually clears it.
          </p>

          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-5">
            <p className="text-xs text-red-300/80 uppercase tracking-wider font-semibold mb-1">Error</p>
            <p className="text-sm text-red-200 font-mono break-words">{error.message || String(error)}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold transition-all hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)]"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.assign('/')}
              className="px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.1] font-medium transition-all"
            >
              Go to home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
