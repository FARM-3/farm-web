import React from 'react';
import LookupListSettings from './LookupListSettings';

export default function SaleItemsSettings() {
  return (
    <LookupListSettings
      category="sale_item"
      title="Sale Items"
      description="Products shown in the Sales item dropdown. Add each one independently."
      addLabel="Add Sale Item"
    />
  );
}
