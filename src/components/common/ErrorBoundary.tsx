import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from "next/link";
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-line p-8 text-center">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-secondary" />
            </div>
            
            <h1 className="text-3xl font-serif font-bold text-ink mb-4">Something went wrong</h1>
            <p className="text-muted mb-8 leading-relaxed">
              We're sorry for the inconvenience. An unexpected error occurred and the page couldn't be loaded.
            </p>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center space-x-2 bg-secondary text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Refresh Page</span>
              </button>
              
              <Link href="/"
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center justify-center space-x-2 bg-primary/10 text-primary px-8 py-4 rounded-full font-bold hover:bg-primary/20 transition-all"
              >
                <Home className="w-5 h-5" />
                <span>Go to Home</span>
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-red-50 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-600 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
