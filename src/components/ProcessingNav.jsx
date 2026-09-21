import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Eye,
    ClipboardCheck,
    Settings,
    Wind,
    Package,
    Wheat
} from 'lucide-react';

const processingPages = [
    { path: '/processing/overview', name: 'Overview', icon: Eye },
    { path: '/processing/quality-control', name: 'Quality Control', icon: ClipboardCheck },
    { path: '/processing/processing-type', name: 'Processing Type', icon: Settings },
    { path: '/processing/drying', name: 'Drying', icon: Wind },
    { path: '/processing/hulling', name: 'Hulling (optional)', icon: Wheat },
    { path: '/processing/bagging', name: 'Bagging', icon: Package },
];

export const ProcessingNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="mb-6 bg-white rounded-2xl shadow-lg p-2">
            <div className="flex flex-wrap gap-2">
                {processingPages.map((page) => {
                    const isActive = currentPath === page.path;
                    const Icon = page.icon;

                    return (
                        <button
                            key={page.path}
                            onClick={() => navigate(page.path)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium ${
                                isActive
                                    ? 'shadow-md'
                                    : 'hover:bg-gray-50'
                            }`}
                            style={{
                                backgroundColor: isActive ? '#8B4513' : 'transparent',
                                color: isActive ? '#FFFFFF' : '#4A3423',
                            }}
                        >
                            <Icon size={16} />
                            <span className="text-sm whitespace-nowrap">{page.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ProcessingNav;
