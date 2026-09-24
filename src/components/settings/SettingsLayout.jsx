import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { SideNav } from '../SideNav';
import {
  Building2, DollarSign, Coffee, ListTree, ShoppingBag, Users, ScrollText, KeyRound, Sprout, Receipt, Truck,
} from 'lucide-react';

const CoffeeColors = { DARK_BROWN: '#4A3423', ACTIVE: '#8B5A3C', BG: '#FFF8F6' };

const sections = [
  {
    title: 'General',
    items: [
      { to: '/settings/company', label: 'Company', icon: Building2 },
      { to: '/settings/pricing', label: 'Pricing', icon: DollarSign },
    ],
  },
  {
    title: 'Farm Data',
    items: [
      { to: '/settings/coffee-types', label: 'Coffee Types', icon: Coffee },
      { to: '/settings/fertilizer-types', label: 'Fertilizer Types', icon: Sprout },
      { to: '/settings/sale-items', label: 'Sale Items', icon: ShoppingBag },
      { to: '/settings/expense-categories', label: 'Expense Categories', icon: Receipt },
      { to: '/settings/suppliers', label: 'Suppliers', icon: Truck },
      { to: '/settings/master-data', label: 'Farm Lists', icon: ListTree },
    ],
  },
  {
    title: 'Security',
    items: [
      { to: '/settings/users', label: 'Users', icon: Users },
      { to: '/settings/permissions', label: 'Permissions', icon: KeyRound },
      { to: '/settings/audit', label: 'Audit Logs', icon: ScrollText },
    ],
  },
];

export default function SettingsLayout() {
  const location = useLocation();

  return (
    <SideNav>
      <main className="p-4 sm:p-6 md:p-8 pt-6" style={{ backgroundColor: CoffeeColors.BG, minHeight: '100vh' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: CoffeeColors.DARK_BROWN }}>Settings</h1>
        <p className="text-sm text-gray-500 mb-6">Configure your farm — each section saves independently.</p>

        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="lg:w-56 shrink-0">
            {sections.map((sec) => (
              <div key={sec.title} className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-3 mb-2">{sec.title}</p>
                {sec.items.map(({ to, label, icon: Icon }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                        active ? 'text-white font-medium' : 'text-gray-700 hover:bg-white'
                      }`}
                      style={active ? { backgroundColor: CoffeeColors.ACTIVE } : {}}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </SideNav>
  );
}
