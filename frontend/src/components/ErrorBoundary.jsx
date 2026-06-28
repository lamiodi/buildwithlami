import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-32 pb-24 px-6 md:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300">
          <div className="max-w-6xl mx-auto">

            {/* Title — matching the star-flanked header style */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <svg className="w-8 h-8 text-gray-400 dark:text-white/50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
              <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight uppercase">
                SYSTEM ERROR
              </h1>
              <svg className="w-8 h-8 text-gray-400 dark:text-white/50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
            </div>

            {/* Bento card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* Main Error Card */}
              <div className="md:col-span-8 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-10 md:p-12 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden">
                <svg className="absolute top-10 left-10 w-8 h-8 text-gray-300 dark:text-white/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
                <div className="mt-12">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                    Something went <span className="text-accent">wrong.</span>
                  </h2>
                  <p className="text-gray-800 dark:text-gray-200 text-lg leading-[1.8] max-w-xl font-light mb-10">
                    An unexpected error occurred while rendering this page. 
                    This has been logged and will be looked into. You can try refreshing or head back home.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center justify-center bg-black text-white dark:bg-white dark:text-black font-bold px-7 py-3.5 text-xs uppercase tracking-widest hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-colors rounded-sm"
                    >
                      Refresh Page
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    </button>
                    <Link
                      to="/"
                      onClick={() => this.setState({ hasError: false, error: null })}
                      className="inline-flex items-center justify-center border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent text-black dark:text-white font-bold px-7 py-3.5 text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors rounded-sm"
                    >
                      Go Home
                    </Link>
                  </div>
                </div>
              </div>

              {/* Side Status Card */}
              <div className="md:col-span-4 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group hover:border-accent dark:hover:border-white/20 transition-colors">
                <div className="bg-gray-50 dark:bg-[#151515] w-full p-6 rounded-2xl border border-gray-200 dark:border-white/5 mb-6">
                  <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-4">Status</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-black dark:text-white">
                      <span className="text-accent">●</span>
                      Render error detected
                    </li>
                    <li className="flex items-center gap-2 text-sm text-black dark:text-white">
                      <span className="text-accent">●</span>
                      Error logged to console
                    </li>
                    <li className="flex items-center gap-2 text-sm text-black dark:text-white">
                      <span className="text-accent">●</span>
                      Recovery available
                    </li>
                  </ul>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">System</p>
                    <h4 className="text-xl font-heading font-bold">Diagnostics</h4>
                  </div>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
