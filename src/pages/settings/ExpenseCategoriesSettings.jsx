import React from 'react';
import LookupListSettings from './LookupListSettings';

export default function ExpenseCategoriesSettings() {
  return (
    <LookupListSettings
      category="expense_category"
      title="Expense Categories"
      description="Categories shown when recording expenses. Add each one independently."
      addLabel="Add Category"
    />
  );
}
