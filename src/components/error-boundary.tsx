'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Filter out common browser extension errors that don't affect functionality
    const isExtensionError = error.message.includes('message channel closed') ||
                           error.message.includes('Extension context invalidated') ||
                           error.message.includes('listener indicated an asynchronous response');
    
    if (isExtensionError) {
      console.warn('Browser extension error detected and handled:', error.message);
      // Reset error state for extension errors
      this.setState({ hasError: false });
    }
  }

  componentDidMount() {
    // Add global error handlers
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.addEventListener('error', this.handleError);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.removeEventListener('error', this.handleError);
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason;
    
    // Check if it's a browser extension related error
    if (error && typeof error === 'object' && error.message) {
      const isExtensionError = error.message.includes('message channel closed') ||
                             error.message.includes('Extension context invalidated') ||
                             error.message.includes('listener indicated an asynchronous response');
      
      if (isExtensionError) {
        console.warn('Browser extension promise rejection handled:', error.message);
        event.preventDefault(); // Prevent the error from being logged
        return;
      }
    }
    
    console.error('Unhandled promise rejection:', error);
  };

  handleError = (event: ErrorEvent) => {
    const isExtensionError = event.message.includes('message channel closed') ||
                           event.message.includes('Extension context invalidated') ||
                           event.message.includes('listener indicated an asynchronous response');
    
    if (isExtensionError) {
      console.warn('Browser extension error handled:', event.message);
      event.preventDefault();
      return;
    }
    
    console.error('Global error:', event.error);
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Please refresh the page to continue.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
