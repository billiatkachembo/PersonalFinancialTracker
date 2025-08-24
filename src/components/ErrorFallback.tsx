// src/components/ErrorFallback.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-4 text-center">
      <AlertTriangle className="w-16 h-16 text-red-600" />
      <h2 className="text-2xl font-bold text-red-600">Oops! Something went wrong.</h2>
      {error && (
        <pre className="bg-red-100 text-red-700 p-4 rounded max-w-lg overflow-auto whitespace-pre-wrap">
          {error.message}
        </pre>
      )}
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        aria-label="Retry"
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorFallback;
