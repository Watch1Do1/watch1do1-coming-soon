import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Something went wrong</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              The application encountered an unexpected error. This usually happens when AI data doesn't match the expected format.
            </p>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-left overflow-auto max-h-40">
              <code className="text-xs text-rose-400 font-mono">
                {this.state.error?.message}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-[#7D8FED] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#6b7edb] transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
