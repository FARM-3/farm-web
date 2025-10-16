import React from 'react';
import { Menu, X, Home, DollarSign, ShoppingCart, Package, Users } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'Wages', icon: DollarSign, href: '/wages' },
  { name: 'Sales', icon: ShoppingCart, href: '/sales' },
  { name: 'Expenses', icon: Package, href: '/expenses' },
  { name: 'Staff', icon: Users, href: '/staff-management' },
];

const SideNav = ({ sidebarOpen, setSidebarOpen, children }) => {
  // Coffee Theme Colors from Login.jsx
  const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    LIGHT_BG: '#FEEFEA',
    DARK_BROWN: '#4A3423',
    BUTTON_BROWN: '#8B4513',
    MEDIUM_BROWN: '#795548',
    LIGHT_BROWN: '#BCAAA4',
    WHITE: '#FFFFFF',
    GRAY_TEXT: '#8D8D8D',
    ERROR_RED: '#D32F2F',
    SUCCESS_GREEN: '#4CAF50',
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: CoffeeColors.SCREEN_BG, fontFamily: 'Inter, sans-serif' }}>
      {/* Tailwind CSS CDN is added for full functionality */}
      <script src="https://cdn.tailwindcss.com"></script>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Collapsible on Mobile, Fixed on Desktop) */}
      <div
        // REMOVED md:translate-x-0 to allow collapsing on desktop
        className={`fixed top-0 left-0 h-full w-64 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 shadow-2xl`}
        style={{ backgroundColor: CoffeeColors.DARK_BROWN }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: CoffeeColors.MEDIUM_BROWN }}>
          <h2 className="text-xl font-bold" style={{ color: CoffeeColors.WHITE }}>
            Rugyeyo Farm
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden hover:opacity-75 transition-opacity p-1 rounded-lg"
            style={{ color: CoffeeColors.WHITE }}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="mt-6 flex flex-col space-y-2 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:translate-x-1"
                style={{
                  color: CoffeeColors.WHITE,
                  backgroundColor: item.name === 'Staff' ? CoffeeColors.MEDIUM_BROWN : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (item.name !== 'Staff') {
                    e.currentTarget.style.backgroundColor = CoffeeColors.MEDIUM_BROWN;
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.name !== 'Staff') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area - Dynamic margin added for desktop collapsing */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        {/* Fixed Header - Dynamic left position added */}
        <div className={`fixed top-0 right-0 left-0 z-30 p-4 shadow-md transition-all duration-300 ${sidebarOpen ? 'md:left-64' : 'md:left-0'}`} style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button (opens sidebar) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg shadow-sm"
              style={{ backgroundColor: CoffeeColors.WHITE }}
            >
              <Menu size={24} style={{ color: CoffeeColors.DARK_BROWN }} />
            </button>

            {/* Desktop Toggle Button (toggles sidebar) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block p-2 rounded-lg shadow-sm"
              style={{ backgroundColor: CoffeeColors.WHITE }}
            >
              {sidebarOpen ? (
                <X size={24} style={{ color: CoffeeColors.DARK_BROWN }} />
              ) : (
                <Menu size={24} style={{ color: CoffeeColors.DARK_BROWN }} />
              )}
            </button>

            <h1 className="text-lg font-bold md:text-xl" style={{ color: CoffeeColors.DARK_BROWN }}>
              Rugyeyo Farm Financial Management
            </h1>
            {/* Spacer for alignment on mobile */}
            <div className="w-10 md:w-0"></div>
          </div>
        </div>

        {/* Render children content */}
        <div className="pt-20 md:pt-24">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SideNav;