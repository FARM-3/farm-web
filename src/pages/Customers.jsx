import React from 'react';
import { SideNav } from '../components/SideNav';
import CustomersSettings from './settings/CustomersSettings';

export default function Customers() {
  return (
    <SideNav>
      <main className="p-6">
        <h1 className="text-2xl font-bold text-[#4A3423] mb-4">Customers</h1>
        <CustomersSettings />
      </main>
    </SideNav>
  );
}
