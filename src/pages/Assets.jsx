import React from 'react';
import { SideNav } from '../components/SideNav';
import AssetsSettings from './settings/AssetsSettings';

export default function Assets() {
  return (
    <SideNav>
      <main className="p-6">
        <h1 className="text-2xl font-bold text-[#4A3423] mb-4">Assets</h1>
        <AssetsSettings />
      </main>
    </SideNav>
  );
}
