import React, { useState } from 'react';
import LookupListSettings from './LookupListSettings';

const CATEGORIES = [
  { key: 'coffee_variety', title: 'Coffee Varieties', description: 'Species/variety on farmer registration (Arabica, Robusta). Separate from Coffee Types, which define processing batches.' },
  { key: 'fertilizer', title: 'Fertilizers', description: 'Fertilizer options for field activity logs' },
  { key: 'pesticide', title: 'Pesticides', description: 'Pesticide options — include "None" where applicable' },
  { key: 'standard_practice', title: 'Standard Practices', description: 'Farming practices checklist on block activities' },
  { key: 'seedling_type', title: 'Seedling Types', description: 'Nursery seedling codes when recording replanting — not the same as coffee species or processing types' },
  { key: 'grade', title: 'Grades', description: 'Coffee quality grades' },
  { key: 'spacing', title: 'Tree Spacing', description: 'Plant spacing options for block records' },
];

export default function MasterDataSettings() {
  const [active, setActive] = useState(CATEGORIES[0].key);
  const cat = CATEGORIES.find(c => c.key === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setActive(c.key)}
            className={`px-3 py-1.5 rounded-full text-sm border ${active === c.key ? 'bg-[#8B5A3C] text-white border-[#8B5A3C]' : 'bg-white text-gray-700'}`}>
            {c.title}
          </button>
        ))}
      </div>
      <LookupListSettings
        key={active}
        category={active}
        title={cat.title}
        description={cat.description}
        addLabel={`Add ${cat.title.replace(/s$/, '')}`}
      />
    </div>
  );
}
