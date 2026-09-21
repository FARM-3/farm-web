import React from 'react';
import { FlaskConical } from 'lucide-react';

export default function PrototypeBanner({ title = 'Prototype Demonstration' }) {
  return (
    <div
      className="mb-6 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3"
      role="note"
    >
      <FlaskConical className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-900">{title}</p>
        <p className="text-sm text-amber-800 mt-1">
          Not production-certified. Shows planned export and compliance capabilities built on existing operational data.
        </p>
      </div>
    </div>
  );
}
