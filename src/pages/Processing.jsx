import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import {
    Eye,
    ClipboardCheck,
    Settings,
    Wind,
    Package,
    Wheat
} from 'lucide-react';

const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    DARK_BROWN: '#4A3423',
    MEDIUM_BROWN: '#795548',
    BUTTON_BROWN: '#8B4513',
};

const FeatureButton = ({ icon: Icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center group"
    >
        <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
            style={{ backgroundColor: '#efebe9' }}
        >
            <Icon size={32} style={{ color: CoffeeColors.BUTTON_BROWN }} />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
            {title}
        </h3>
        <p className="text-sm text-gray-600">
            {description}
        </p>
    </button>
);

const Processing = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Eye,
            title: 'Overview',
            description: 'View processing insights, charts, and track harvest stages',
            path: '/processing/overview'
        },
        {
            icon: ClipboardCheck,
            title: 'Quality Control',
            description: 'Manage quality control checks and records',
            path: '/processing/quality-control'
        },
        {
            icon: Settings,
            title: 'Processing Type',
            description: 'Configure and manage processing types',
            path: '/processing/processing-type'
        },
        {
            icon: Wind,
            title: 'Drying',
            description: 'Track and manage drying processes',
            path: '/processing/drying'
        },
        {
            icon: Package,
            title: 'Bagging',
            description: 'Monitor bagging operations and inventory',
            path: '/processing/bagging'
        },
        {
            icon: Wheat,
            title: 'Hulling',
            description: 'Manage hulling operations and records',
            path: '/processing/hulling'
        },
    ];

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                        Processing Center
                    </h1>
                    <p className="text-gray-600">
                        Manage all coffee processing operations from a single dashboard
                    </p>
                </div>

                {/* Feature Buttons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureButton
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            onClick={() => navigate(feature.path)}
                        />
                    ))}
                </div>
            </main>
        </SideNav>
    );
};

export default Processing;
