import { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import {
    Scale, TrendingUp, Package, Eye, Loader2, RefreshCw,
    ChevronUp, Search, Edit, Trash2, ChevronDown
} from 'lucide-react';

// API Endpoints
const API_BASE_URL = 'http://142.93.94.236:8000/api';
const HARVESTS_API = `${API_BASE_URL}/harvests/harvests/`;
const BLOCKS_API = `${API_BASE_URL}/harvests/blocks/`;

// Coffee Colors
const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    ACTIVE_LINK_BG: '#efebe9',
    ACTIVE_LINK_TEXT: '#783A1E',
    DARK_BROWN: '#4A3423',
    MEDIUM_BROWN: '#795548',
    BUTTON_PRIMARY: '#8B4513',
    BUTTON_SECONDARY: '#efebe9',
    GRAY_TEXT: '#8D8D8D',
    SUCCESS_GREEN: '#34A853',
    ERROR_RED: '#EA4335',
};

// Format date helper
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Format number with 2 decimals
const formatNumber = (num) => {
    const number = parseFloat(num);
    if (isNaN(number)) return '0.00';
    return number.toFixed(2);
};

// KPI Card Component
const KPICard = ({ title, value, subtitle, icon: Icon, loading, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 flex items-center">
                <Icon className="w-4 h-4 mr-1" stroke={color || CoffeeColors.MEDIUM_BROWN} />
                {title}
            </p>
        </div>
        {loading ? (
            <div className="flex items-center gap-2 mt-2">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: CoffeeColors.MEDIUM_BROWN }} />
                <span className="text-sm text-gray-500">Loading...</span>
            </div>
        ) : (
            <>
                <p className="text-4xl font-extrabold text-gray-900 leading-none">{value}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>}
            </>
        )}
    </div>
);

// Expandable Row Component for Harvests
const ExpandableHarvestRow = ({ harvest, isExpanded, onToggle, blockDetails }) => {
    return (
        <>
            <tr className="border-b border-gray-100 transition-colors duration-150 hover:bg-light-coffee-brown/40">
                <td className="px-6 py-3 text-left font-medium text-gray-800 text-sm">{harvest.harvest_id || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600 text-sm">{harvest.worker_name || 'N/A'}</td>
                <td className="px-6 py-3 text-center text-gray-600 text-sm">{harvest.block_id || 'N/A'}</td>
                <td className="px-6 py-3 text-right text-gray-800 font-semibold text-sm">
                    {formatNumber(harvest.weight_on_delivery)} kg
                </td>
                <td className="px-6 py-3 text-center text-gray-600 text-sm">{formatDate(harvest.date_of_delivery)}</td>
                <td className="px-6 py-3 text-right text-gray-800 font-semibold text-sm">
                    UGX {parseFloat(harvest.amount_paid || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </td>
                <td className="px-6 py-3 text-center">
                    <button
                        onClick={onToggle}
                        className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-50 transition-colors relative group"
                        title={isExpanded ? "Hide Details" : "View Details"}
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                            {isExpanded ? "Hide Details" : "View Details"}
                        </span>
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-50">
                    <td colSpan="7" className="px-6 py-4">
                        <div className="space-y-4">
                            {/* Harvest Details */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase border-b pb-2">Harvest Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Harvest ID</p>
                                        <p className="text-sm text-gray-800">{harvest.harvest_id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Worker Name</p>
                                        <p className="text-sm text-gray-800">{harvest.worker_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Weight on Delivery</p>
                                        <p className="text-sm text-gray-800 font-semibold">{formatNumber(harvest.weight_on_delivery)} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Amount Paid</p>
                                        <p className="text-sm text-gray-800 font-semibold">
                                            UGX {parseFloat(harvest.amount_paid || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Date of Delivery</p>
                                        <p className="text-sm text-gray-800">{formatDate(harvest.date_of_delivery)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Paid By</p>
                                        <p className="text-sm text-gray-800">{harvest.paid_by || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Created At</p>
                                        <p className="text-sm text-gray-800">{formatDate(harvest.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Last Updated</p>
                                        <p className="text-sm text-gray-800">{formatDate(harvest.updated_at)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Block Details */}
                            {blockDetails && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase border-b pb-2">Block Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Block ID</p>
                                            <p className="text-sm text-gray-800">{blockDetails.block_id || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Altitude</p>
                                            <p className="text-sm text-gray-800">{blockDetails.altitude ? `${blockDetails.altitude}m` : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Tree Count</p>
                                            <p className="text-sm text-gray-800">{blockDetails.tree_count || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Acreage</p>
                                            <p className="text-sm text-gray-800">{blockDetails.acreage ? `${blockDetails.acreage} acres` : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Coffee Variety</p>
                                            <p className="text-sm text-gray-800">{blockDetails.coffee_variety || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Planting Date</p>
                                            <p className="text-sm text-gray-800">{formatDate(blockDetails.planting_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Soil Type</p>
                                            <p className="text-sm text-gray-800">{blockDetails.soil_type || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Shade Type</p>
                                            <p className="text-sm text-gray-800">{blockDetails.shade_type || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// Main Harvest Page Component
export function HarvestPage() {
    const [harvests, setHarvests] = useState([]);
    const [blocks, setBlocks] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBlock, setFilterBlock] = useState('');

    // Calculate KPIs
    const kpis = {
        totalHarvests: harvests.length,
        totalWeight: harvests.reduce((sum, h) => sum + parseFloat(h.weight_on_delivery || 0), 0),
        totalAmountPaid: harvests.reduce((sum, h) => sum + parseFloat(h.amount_paid || 0), 0),
    };

    // Fetch harvests
    const fetchHarvests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(HARVESTS_API);
            if (response.ok) {
                const data = await response.json();
                const results = data.results || data;
                setHarvests(Array.isArray(results) ? results : []);
            } else {
                console.error('Failed to fetch harvests');
                setHarvests([]);
            }
        } catch (error) {
            console.error('Error fetching harvests:', error);
            setHarvests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch blocks
    const fetchBlocks = useCallback(async () => {
        try {
            const response = await fetch(BLOCKS_API);
            if (response.ok) {
                const data = await response.json();
                const results = data.results || data;
                const blocksMap = {};
                if (Array.isArray(results)) {
                    results.forEach(block => {
                        blocksMap[block.block_id] = block;
                    });
                }
                setBlocks(blocksMap);
            }
        } catch (error) {
            console.error('Error fetching blocks:', error);
        }
    }, []);

    useEffect(() => {
        fetchHarvests();
        fetchBlocks();
    }, [fetchHarvests, fetchBlocks]);

    // Toggle row expansion
    const toggleRow = (harvestId) => {
        setExpandedRows(prev => ({
            ...prev,
            [harvestId]: !prev[harvestId]
        }));
    };

    // Get unique block IDs for filter
    const uniqueBlocks = [...new Set(harvests.map(h => h.block_id).filter(Boolean))];

    // Filter harvests
    const filteredHarvests = harvests.filter(harvest => {
        const matchesSearch =
            !searchTerm ||
            (harvest.worker_name && harvest.worker_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (harvest.harvest_id && harvest.harvest_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (harvest.block_id && harvest.block_id.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesBlock = !filterBlock || harvest.block_id === filterBlock;

        return matchesSearch && matchesBlock;
    });

    return (
        <SideNav>
            <main className="p-3 sm:p-4 md:p-6 pt-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#4A3423] mb-6">
                    Harvest Records Overview
                </h2>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <KPICard
                        title="Total Harvests"
                        value={kpis.totalHarvests}
                        subtitle={`${filteredHarvests.length} record(s)`}
                        icon={Package}
                        loading={loading}
                    />
                    <KPICard
                        title="Total Weight Delivered"
                        value={`${formatNumber(kpis.totalWeight)} kg`}
                        subtitle="All harvests combined"
                        icon={Scale}
                        loading={loading}
                        color={CoffeeColors.SUCCESS_GREEN}
                    />
                    <KPICard
                        title="Total Amount Paid"
                        value={`UGX ${kpis.totalAmountPaid.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                        subtitle="To all workers"
                        icon={TrendingUp}
                        loading={loading}
                        color={CoffeeColors.ERROR_RED}
                    />
                </div>

                {/* Action Bar & Filter */}
                <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex gap-3 items-center w-full sm:w-auto order-2 sm:order-1">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search by worker, harvest ID, or block..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="p-2 pl-10 text-sm w-full sm:w-64 border border-gray-300 rounded-xl focus:ring-accent-btn focus:border-accent-btn transition-colors shadow-lg"
                            />
                        </div>
                        <div className="relative inline-block text-left">
                            <select
                                value={filterBlock}
                                onChange={(e) => setFilterBlock(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-xl py-2 pl-4 pr-8 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-accent-btn focus:border-accent-btn shadow-lg transition duration-300 ease-in-out"
                            >
                                <option value="">All Blocks</option>
                                {uniqueBlocks.map(blockId => (
                                    <option key={blockId} value={blockId}>{blockId}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        <button
                            onClick={() => { fetchHarvests(); fetchBlocks(); }}
                            disabled={loading}
                            className="py-2 px-4 shadow-xl rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            style={{ backgroundColor: CoffeeColors.BUTTON_SECONDARY, color: CoffeeColors.ACTIVE_LINK_TEXT, border: 'none' }}
                        >
                            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                </div>

                {/* Harvests Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead style={{ backgroundColor: CoffeeColors.ACTIVE_LINK_BG }}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Harvest ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Worker Name
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Block ID
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Weight (kg)
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Delivery Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Amount Paid
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="w-8 h-8 animate-spin" style={{ color: CoffeeColors.MEDIUM_BROWN }} />
                                                <span className="ml-3 text-gray-600">Loading harvests...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredHarvests.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            No harvest records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHarvests.map((harvest) => (
                                        <ExpandableHarvestRow
                                            key={harvest.harvest_id}
                                            harvest={harvest}
                                            isExpanded={expandedRows[harvest.harvest_id]}
                                            onToggle={() => toggleRow(harvest.harvest_id)}
                                            blockDetails={blocks[harvest.block_id]}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </SideNav>
    );
}

export default HarvestPage;
