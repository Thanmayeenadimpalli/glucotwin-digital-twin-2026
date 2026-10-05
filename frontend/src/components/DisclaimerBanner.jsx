import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-950/60 border-b border-amber-700/40 text-amber-200 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>RESEARCH & EDUCATIONAL PROOF-OF-CONCEPT ONLY:</strong> Synthetic & anonymized data used exclusively. Not clinically validated for diagnostic or therapeutic medical use.
        </span>
      </div>
    </div>
  );
}
