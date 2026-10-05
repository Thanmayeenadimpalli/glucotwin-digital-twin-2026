import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-6 text-center max-w-md mx-auto my-8">
      <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <h3 className="text-base font-bold text-red-200">Digital Twin Telemetry Error</h3>
      <p className="text-xs text-red-300 mt-1 mb-4">{error || 'Unable to connect to Digital Twin backend service.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-attempt Connection
        </button>
      )}
    </div>
  );
}
