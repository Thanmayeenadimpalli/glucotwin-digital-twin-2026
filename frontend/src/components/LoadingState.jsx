import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-3" />
      <p className="text-sm text-slate-300 font-medium">{message || 'Synchronizing Digital Twin State...'}</p>
      <p className="text-xs text-slate-400 mt-1">Fusing EHR, Wearables & CGM telemetry streams</p>
    </div>
  );
}
