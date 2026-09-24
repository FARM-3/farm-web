import React from 'react';
import { SideNav } from '../components/SideNav';
import SuppliersSettings from './settings/SuppliersSettings';

export default function Suppliers() {
  return (
    <SideNav>
      <main className="p-6">
        <SuppliersSettings />
      </main>
    </SideNav>
  );
}
