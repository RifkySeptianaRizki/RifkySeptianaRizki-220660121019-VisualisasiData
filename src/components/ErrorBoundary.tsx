import { Component, ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard error boundary', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="px-4 pb-16 pt-10 sm:px-6 lg:px-10">
          <div className="card glossy-fix mx-auto max-w-2xl space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <span className="text-2xl text-[var(--primary)]" aria-hidden="true">
                ⚠️
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Terjadi kesalahan</h2>
              <p className="text-sm text-white/70">
                Mohon segarkan halaman atau hubungi tim pengembang jika masalah berlanjut.
              </p>
            </div>
            {this.state.error?.message && (
              <p className="text-xs text-white/50">{this.state.error?.message}</p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
