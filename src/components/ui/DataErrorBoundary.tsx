import React from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" style={{ padding: '1rem', border: '1px solid red', borderRadius: '4px', background: '#ffe6e6', color: 'red' }}>
      <p><strong>Something went wrong fetching data:</strong></p>
      <pre style={{ color: 'inherit' }}>{(error as Error).message || String(error)}</pre>
      <button onClick={resetErrorBoundary} style={{ marginTop: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem' }}>
        Try again
      </button>
    </div>
  );
}

interface DataErrorBoundaryProps {
  children: React.ReactNode;
}

export function DataErrorBoundary({ children }: DataErrorBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
