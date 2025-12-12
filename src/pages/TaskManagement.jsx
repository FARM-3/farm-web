import React, { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import {
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Camera,
    Cloud,
    Sun,
    CloudRain,
    Wind,
    Eye,
    EyeOff,
    Search,
    Filter,
    Calendar,
    User,
    FileText,
    Upload,
    X,
    MapPin,
    TrendingUp,
    Activity,
    Zap,
    Timer,
    Play,
    Pause,
    Square,
    RotateCcw
} from 'lucide-react';
import { API_ENDPOINTS } from '../services/ApiConfig';

const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    DARK_BROWN: '#4A3423',
    BUTTON_BROWN: '#8B4513',
    LIGHT_BG: '#efebe9',
};

const TaskManagement = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'weekly-plan', 'tasks', 'exceptions'
    const [tasks, setTasks] = useState([]);
    const [exceptions, setExceptions] = useState([]);
    const [farmBlocks, setFarmBlocks] = useState([]);
    const [sopTemplates, setSopTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showExceptionModal, setShowExceptionModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editingException, setEditingException] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [draggedSop, setDraggedSop] = useState(null);
    const [slaTimers, setSlaTimers] = useState({});
    const [calendarEvents, setCalendarEvents] = useState([]);

    // Removed demo/mock data — data is fetched from backend endpoints

    // Task form state (fields to capture when creating a task)
    const [taskForm, setTaskForm] = useState({
        title: '',
        activity: '',
        custom_activity: '',
        assigned_to: '',
        description: '',
        time: '',
        priority: 'medium',
        date: selectedDate,
    });

    // Exception form state
    const [exceptionForm, setExceptionForm] = useState({
        title: '',
        description: '',
        severity: 'low',
        weather_conditions: [],
        evidence_files: [],
        reported_by: '',
        location: '',
        status: 'open'
    });

    // Weather conditions options
    const weatherOptions = [
        { value: 'sunny', label: 'Sunny', icon: Sun },
        { value: 'cloudy', label: 'Cloudy', icon: Cloud },
        { value: 'rainy', label: 'Rainy', icon: CloudRain },
        { value: 'windy', label: 'Windy', icon: Wind },
    ];

    // Fetch all data
    const fetchTasks = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.TASKS, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTasks(data.results || data);
            } else {
                console.error('Failed to fetch tasks, server responded with', response.status);
                setTasks([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        }
    }, []);

    const fetchFarmBlocks = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.FARM_BLOCKS, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFarmBlocks(data.results || data);
            } else {
                console.error('Failed to fetch farm blocks, server responded with', response.status);
                setFarmBlocks([]);
            }
        } catch (error) {
            console.error('Error fetching farm blocks:', error);
            setFarmBlocks([]);
        }
    }, []);

    const fetchSopTemplates = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.SOP_TEMPLATES, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSopTemplates(data.results || data);
            } else {
                console.error('Failed to fetch SOP templates, server responded with', response.status);
                setSopTemplates([]);
            }
        } catch (error) {
            console.error('Error fetching SOP templates:', error);
            setSopTemplates([]);
        }
    }, []);

    const fetchExceptions = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.EXCEPTIONS, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setExceptions(data.results || data);
            } else {
                console.error('Failed to fetch exceptions, server responded with', response.status);
                setExceptions([]);
            }
        } catch (error) {
            console.error('Error fetching exceptions:', error);
            setExceptions([]);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchTasks(), fetchExceptions(), fetchFarmBlocks(), fetchSopTemplates()]);
            setLoading(false);
        };
        fetchData();
    }, [fetchTasks, fetchExceptions, fetchFarmBlocks, fetchSopTemplates]);

    // SLA Timer effect for exceptions
    useEffect(() => {
        const updateSlaTimers = () => {
            const now = new Date();
            const newTimers = {};

            exceptions.forEach(exception => {
                if (exception.status === 'open') {
                    const createdAt = new Date(exception.created_at);
                    const timeDiff = now - createdAt;

                    // SLA: 2 hours for high priority, 4 hours for medium, 8 hours for low
                    const slaHours = exception.severity === 'high' ? 2 : exception.severity === 'medium' ? 4 : 8;
                    const slaMs = slaHours * 60 * 60 * 1000;
                    const remainingMs = slaMs - timeDiff;

                    newTimers[exception.id] = {
                        remaining: Math.max(0, remainingMs),
                        isExpired: remainingMs <= 0,
                        slaHours
                    };
                }
            });

            setSlaTimers(newTimers);
        };

        updateSlaTimers();
        const interval = setInterval(updateSlaTimers, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [exceptions]);

    // Task management functions
    const handleCreateTask = () => {
        setEditingTask(null);
        setTaskForm({
            title: '',
            activity: '',
            custom_activity: '',
            assigned_to: '',
            description: '',
            time: '',
            priority: 'medium',
            date: selectedDate,
        });
        setShowTaskModal(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title || '',
            activity: task.activity || '',
            custom_activity: task.custom_activity || '',
            assigned_to: task.assigned_to || '',
            description: task.description || '',
            time: task.time || '',
            priority: task.priority || 'medium',
            date: task.date ? new Date(task.date) : (task.due_date ? new Date(task.due_date) : selectedDate),
        });
        setShowTaskModal(true);
    };

    const handleSaveTask = async () => {
        try {
            const token = localStorage.getItem('token');
            const method = editingTask ? 'PUT' : 'POST';
            const url = editingTask
                ? `${API_ENDPOINTS.TASKS || `${API_ENDPOINTS.getApiBaseUrl()}/api/tasks/`}${editingTask.id}/`
                : (API_ENDPOINTS.TASKS || `${API_ENDPOINTS.getApiBaseUrl()}/api/tasks/`);

            // Ensure date is sent as YYYY-MM-DD
            const payload = {
                ...taskForm,
                date: taskForm.date instanceof Date ? taskForm.date.toISOString().split('T')[0] : taskForm.date,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchTasks();
                setShowTaskModal(false);
                alert(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
            } else {
                alert('Failed to save task');
            }
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Error saving task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.TASKS}${taskId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                await fetchTasks();
                alert('Task deleted successfully!');
            } else {
                alert('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task');
        }
    };

    // Delete exception
    const handleDeleteException = async (exceptionId) => {
        if (!window.confirm('Are you sure you want to delete this exception?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.EXCEPTIONS}${exceptionId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                await fetchExceptions();
                alert('Exception deleted successfully!');
            } else {
                alert('Failed to delete exception');
            }
        } catch (error) {
            console.error('Error deleting exception:', error);
            alert('Error deleting exception');
        }
    };

    // Exception management functions
    const handleCreateException = () => {
        setEditingException(null);
        setExceptionForm({
            title: '',
            description: '',
            severity: 'low',
            weather_conditions: [],
            evidence_files: [],
            reported_by: '',
            location: '',
            status: 'open'
        });
        setShowExceptionModal(true);
    };

    const handleEditException = (exception) => {
        setEditingException(exception);
        setExceptionForm({
            title: exception.title,
            description: exception.description,
            severity: exception.severity,
            weather_conditions: exception.weather_conditions || [],
            evidence_files: exception.evidence_files || [],
            reported_by: exception.reported_by,
            location: exception.location,
            status: exception.status
        });
        setShowExceptionModal(true);
    };

    const handleSaveException = async () => {
        try {
            const token = localStorage.getItem('token');
            const method = editingException ? 'PUT' : 'POST';
            const url = editingException
                ? `${API_ENDPOINTS.EXCEPTIONS || `${API_ENDPOINTS.getApiBaseUrl()}/api/exceptions/`}${editingException.id}/`
                : (API_ENDPOINTS.EXCEPTIONS || `${API_ENDPOINTS.getApiBaseUrl()}/api/exceptions/`);

            const formData = new FormData();
            Object.keys(exceptionForm).forEach(key => {
                if (key === 'evidence_files') {
                    exceptionForm.evidence_files.forEach(file => {
                        formData.append('evidence_files', file);
                    });
                } else if (key === 'weather_conditions') {
                    formData.append(key, JSON.stringify(exceptionForm[key]));
                } else {
                    formData.append(key, exceptionForm[key]);
                }
            });

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Token ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                await fetchExceptions();
                setShowExceptionModal(false);
                alert(editingException ? 'Exception updated successfully!' : 'Exception recorded successfully!');
            } else {
                alert('Failed to save exception');
            }
        } catch (error) {
            console.error('Error saving exception:', error);
            alert('Error saving exception');
        }
    };

    const handleWeatherToggle = (weatherType) => {
        setExceptionForm(prev => ({
            ...prev,
            weather_conditions: prev.weather_conditions.includes(weatherType)
                ? prev.weather_conditions.filter(w => w !== weatherType)
                : [...prev.weather_conditions, weatherType]
        }));
    };

    // Calendar drag and drop handlers
    const handleDrop = async (e, dayIndex, hourIndex) => {
        e.preventDefault();
        const sopData = JSON.parse(e.dataTransfer.getData('application/json'));

        if (sopData && sopData.type === 'sop-template') {
            // Calculate the date and time for the dropped SOP
            const dropDate = new Date(selectedDate);
            dropDate.setDate(selectedDate.getDate() - selectedDate.getDay() + dayIndex);
            dropDate.setHours(hourIndex + 6, 0, 0, 0); // Start from 6 AM

            // Create a new task from the SOP template
            const newTask = {
                title: sopData.template.name,
                description: `Scheduled ${sopData.template.name} - ${sopData.template.category}`,
                assigned_to: 'Unassigned',
                priority: sopData.template.priority,
                date: dropDate.toISOString().split('T')[0],
                time: `${dropDate.getHours().toString().padStart(2, '0')}:00`,
                status: 'pending'
            };

            try {
                // Try to save to backend first
                const token = localStorage.getItem('token');
                const response = await fetch(API_ENDPOINTS.TASKS, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                    body: JSON.stringify(newTask),
                });

                if (response.ok) {
                    const savedTask = await response.json();
                    setTasks(prev => [...prev, savedTask]);
                    alert(`Task "${sopData.template.name}" scheduled for ${dropDate.toLocaleDateString()} at ${dropDate.getHours()}:00`);
                } else {
                    throw new Error('Failed to save task');
                }
            } catch (error) {
                console.error('Error saving task:', error);
                // Fallback: Add to local state with temporary ID
                setTasks(prev => [...prev, {
                    ...newTask,
                    id: Date.now(), // Temporary ID
                    created_at: new Date().toISOString()
                }]);
                alert(`Task "${sopData.template.name}" scheduled locally for ${dropDate.toLocaleDateString()} at ${dropDate.getHours()}:00 (will sync when online)`);
            }
        }
    };

    const handleDragStart = (e, template) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'sop-template',
            template: template
        }));
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        setExceptionForm(prev => ({
            ...prev,
            evidence_files: [...prev.evidence_files, ...files]
        }));
    };

    const removeFile = (index) => {
        setExceptionForm(prev => ({
            ...prev,
            evidence_files: prev.evidence_files.filter((_, i) => i !== index)
        }));
    };

    // Filter functions
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.assigned_to.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const filteredExceptions = exceptions.filter(exception => {
        const matchesSearch = exception.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exception.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exception.reported_by.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || exception.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'open': return 'bg-red-100 text-red-800';
            case 'resolved': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-orange-100 text-orange-800';
            case 'low': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                            Task Management
                        </h1>
                        <p className="text-gray-600 mt-1">Manage tasks and record exceptions</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={activeTab === 'tasks' ? handleCreateTask : handleCreateException}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-white transition hover:shadow-xl"
                            style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
                        >
                            <Plus className="w-4 h-4" />
                            {activeTab === 'tasks' ? 'Create Task' : 'Record Exception'}
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6 bg-white rounded-2xl shadow-lg p-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2.5 rounded-xl transition-all font-medium text-center ${
                                activeTab === 'overview' ? 'shadow-md' : 'hover:bg-gray-50'
                            }`}
                            style={{
                                backgroundColor: activeTab === 'overview' ? '#8B4513' : 'transparent',
                                color: activeTab === 'overview' ? '#FFFFFF' : '#4A3423',
                            }}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('weekly-plan')}
                            className={`px-4 py-2.5 rounded-xl transition-all font-medium text-center ${
                                activeTab === 'weekly-plan' ? 'shadow-md' : 'hover:bg-gray-50'
                            }`}
                            style={{
                                backgroundColor: activeTab === 'weekly-plan' ? '#8B4513' : 'transparent',
                                color: activeTab === 'weekly-plan' ? '#FFFFFF' : '#4A3423',
                            }}
                        >
                            Weekly Plan
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`px-4 py-2.5 rounded-xl transition-all font-medium text-center ${
                                activeTab === 'tasks' ? 'shadow-md' : 'hover:bg-gray-50'
                            }`}
                            style={{
                                backgroundColor: activeTab === 'tasks' ? '#8B4513' : 'transparent',
                                color: activeTab === 'tasks' ? '#FFFFFF' : '#4A3423',
                            }}
                        >
                            Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab('exceptions')}
                            className={`px-4 py-2.5 rounded-xl transition-all font-medium text-center ${
                                activeTab === 'exceptions' ? 'shadow-md' : 'hover:bg-gray-50'
                            }`}
                            style={{
                                backgroundColor: activeTab === 'exceptions' ? '#8B4513' : 'transparent',
                                color: activeTab === 'exceptions' ? '#FFFFFF' : '#4A3423',
                            }}
                        >
                            Exceptions
                        </button>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:ring-brown-500 outline-none"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:ring-brown-500 outline-none"
                    >
                        <option value="all">All Status</option>
                        {activeTab === 'tasks' ? (
                            <>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </>
                        ) : (
                            <>
                                <option value="open">Open</option>
                                <option value="investigating">Investigating</option>
                                <option value="resolved">Resolved</option>
                            </>
                        )}
                    </select>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Farm Blocks Overview */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold mb-4" style={{ color: CoffeeColors.DARK_BROWN }}>
                                Farm Block Overview
                            </h2>

                            {/* Map Placeholder */}
                            <div className="bg-gray-100 rounded-xl h-64 mb-6 flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin size={48} className="mx-auto mb-2 text-gray-400" />
                                    <p className="text-gray-600">Interactive Map View</p>
                                    <p className="text-sm text-gray-500">Map integration would show block boundaries with color-coded condition scores</p>
                                </div>
                            </div>

                            {/* Block Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {farmBlocks.map(block => (
                                    <div key={block.id} className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-lg" style={{ color: CoffeeColors.DARK_BROWN }}>
                                                {block.name}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                block.condition_score >= 80 ? 'bg-green-100 text-green-800' :
                                                block.condition_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {block.condition_score}%
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Area:</span>
                                                <span className="font-semibold">{block.area} ha</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Crop:</span>
                                                <span className="font-semibold">{block.crop}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Open Tasks:</span>
                                                <span className="font-semibold text-orange-600">{block.open_tasks}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Last Inspection:</span>
                                                <span className="font-semibold">{block.last_inspection}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-600">Total Blocks</h3>
                                    <MapPin size={20} style={{ color: '#8B5A3C' }} />
                                </div>
                                <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{farmBlocks.length}</p>
                                <p className="text-xs text-gray-600 mt-2">Active farm blocks</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-600">Avg Condition</h3>
                                    <TrendingUp size={20} style={{ color: '#8B5A3C' }} />
                                </div>
                                <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>
                                    {farmBlocks.length ? Math.round(farmBlocks.reduce((sum, block) => sum + (block.condition_score || 0), 0) / farmBlocks.length) : 0}%
                                </p>
                                <p className="text-xs text-gray-600 mt-2">Overall farm health</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-600">Open Tasks</h3>
                                    <CheckCircle size={20} style={{ color: '#8B5A3C' }} />
                                </div>
                                <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>
                                    {farmBlocks.reduce((sum, block) => sum + block.open_tasks, 0)}
                                </p>
                                <p className="text-xs text-gray-600 mt-2">Pending actions</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-600">Active Alerts</h3>
                                    <AlertTriangle size={20} style={{ color: '#8B5A3C' }} />
                                </div>
                                <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>
                                    {exceptions.filter(e => e.status === 'open').length}
                                </p>
                                <p className="text-xs text-gray-600 mt-2">Require attention</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Weekly Plan Tab */}
                {activeTab === 'weekly-plan' && (
                    <div className="space-y-6">
                        {/* Calendar View */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Weekly Planning Calendar
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                                    >
                                        ← Previous Week
                                    </button>
                                    <button
                                        onClick={() => setSelectedDate(new Date())}
                                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm text-blue-700"
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                                    >
                                        Next Week →
                                    </button>
                                </div>
                            </div>

                            {/* Weekly Calendar Grid */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                {/* Calendar Header */}
                                <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
                                    <div className="p-3 font-semibold text-gray-700 border-r border-gray-200">Time</div>
                                    {Array.from({ length: 7 }, (_, i) => {
                                        const date = new Date(selectedDate);
                                        date.setDate(selectedDate.getDate() - selectedDate.getDay() + i);
                                        const isToday = date.toDateString() === new Date().toDateString();
                                        return (
                                            <div key={i} className={`p-3 text-center border-r border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}>
                                                <div className="font-semibold text-gray-700">
                                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                </div>
                                                <div className={`text-sm ${isToday ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                                                    {date.getDate()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Calendar Body */}
                                <div className="grid grid-cols-8" style={{ height: '600px' }}>
                                    {/* Time Column */}
                                    <div className="border-r border-gray-200">
                                        {Array.from({ length: 12 }, (_, i) => {
                                            const hour = i + 6; // Start from 6 AM
                                            return (
                                                <div key={i} className="h-12 border-b border-gray-100 p-2 text-xs text-gray-500 flex items-start">
                                                    {hour > 12 ? `${hour - 12} PM` : hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : '12 PM'}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Day Columns */}
                                    {Array.from({ length: 7 }, (_, dayIndex) => (
                                        <div key={dayIndex} className="border-r border-gray-200 relative">
                                            {Array.from({ length: 12 }, (_, hourIndex) => (
                                                <div
                                                    key={hourIndex}
                                                    className="h-12 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                                                    onDrop={(e) => handleDrop(e, dayIndex, hourIndex)}
                                                    onDragOver={(e) => e.preventDefault()}
                                                >
                                                    {/* Drop zone for SOP templates */}
                                                </div>
                                            ))}

                                            {/* Render scheduled tasks/events */}
                                            {tasks
                                                .filter(task => {
                                                    const taskDate = new Date(task.date || task.due_date);
                                                    const calendarDate = new Date(selectedDate);
                                                    calendarDate.setDate(selectedDate.getDate() - selectedDate.getDay() + dayIndex);
                                                    return taskDate.toDateString() === calendarDate.toDateString();
                                                })
                                                .map((task, index) => {
                                                    const taskDate = new Date(task.date || task.due_date);
                                                    const hour = task.time ? parseInt(task.time.split(':')[0], 10) : taskDate.getHours();
                                                    const topPx = ((hour - 6) * 50) + 5;
                                                    return (
                                                        <div
                                                            key={task.id}
                                                            className="absolute left-1 right-1 bg-blue-100 border border-blue-300 rounded p-1 text-xs"
                                                            style={{
                                                                top: `${topPx}px`,
                                                                height: '40px',
                                                                zIndex: 10
                                                            }}
                                                        >
                                                            <div className="font-semibold text-blue-800 truncate">{task.title}</div>
                                                            <div className="text-blue-600 truncate">{task.assigned_to}</div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Calendar Legend */}
                            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                                    <span>Scheduled Tasks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                                    <span>SOP Templates (Drag to Schedule)</span>
                                </div>
                            </div>
                        </div>

                        {/* SOP Templates */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold mb-4" style={{ color: CoffeeColors.DARK_BROWN }}>
                                SOP Templates
                            </h2>
                            <p className="text-gray-600 mb-6">Drag these templates onto the calendar to create scheduled tasks</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sopTemplates.map(template => (
                                    <div
                                        key={template.id}
                                        className="border border-gray-200 rounded-xl p-4 cursor-move hover:shadow-md transition-all hover:scale-105 bg-green-50 border-green-200"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, template)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-lg text-green-800">{template.name}</h3>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                template.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                template.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {template.priority}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3">{template.category}</p>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Duration:</span>
                                            <span className="font-semibold">{template.duration}</span>
                                        </div>

                                        <div className="mt-2 text-xs text-green-600 font-medium">
                                            💡 Drag to calendar to schedule
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Activity</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Assigned To</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Time</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Date</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Priority</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <Clock className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                                <p className="mt-2 text-gray-600">Loading tasks...</p>
                                            </td>
                                        </tr>
                                    ) : filteredTasks.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                No tasks found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTasks.map((task) => (
                                            <tr key={task.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{task.title}</p>
                                                        <p className="text-sm text-gray-600 truncate max-w-xs">{task.description}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {task.activity === 'other' ? task.custom_activity : task.activity}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{task.assigned_to}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{task.time || ''}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{task.date || task.due_date || ''}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleEditTask(task)} className="p-1 hover:bg-blue-50 rounded">
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </button>
                                                        <button onClick={() => handleDeleteTask(task.id)} className="p-1 hover:bg-red-50 rounded">
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Exceptions Tab */}
                {activeTab === 'exceptions' && (
                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Reported By</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Severity</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Weather</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">SLA Timer</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <Clock className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                                <p className="mt-2 text-gray-600">Loading exceptions...</p>
                                            </td>
                                        </tr>
                                    ) : filteredExceptions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                No exceptions found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredExceptions.map((exception) => {
                                            const slaTimer = slaTimers[exception.id];
                                            return (
                                                <tr key={exception.id} className={`hover:bg-gray-50 ${slaTimer?.isExpired ? 'bg-red-50' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start gap-3">
                                                            {slaTimer?.isExpired && (
                                                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-gray-800">{exception.title}</p>
                                                                <p className="text-sm text-gray-600 truncate max-w-xs">{exception.description}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700">{exception.reported_by}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(exception.severity)}`}>
                                                            {exception.severity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex gap-1 justify-center">
                                                            {exception.weather_conditions?.map(weather => {
                                                                const weatherOption = weatherOptions.find(w => w.value === weather);
                                                                const IconComponent = weatherOption?.icon || Cloud;
                                                                return <IconComponent key={weather} className="w-4 h-4 text-gray-600" />;
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {slaTimer && exception.status === 'open' ? (
                                                            <div className="text-center">
                                                                <div className={`text-sm font-semibold ${slaTimer.isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                                                                    {Math.floor(slaTimer.remaining / (1000 * 60 * 60))}:{Math.floor((slaTimer.remaining % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0')}:{Math.floor((slaTimer.remaining % (1000 * 60)) / 1000).toString().padStart(2, '0')}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    SLA: {slaTimer.slaHours}h
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(exception.status)}`}>
                                                                {exception.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => handleEditException(exception)} className="p-1 hover:bg-blue-50 rounded">
                                                                <Edit className="w-4 h-4 text-blue-600" />
                                                            </button>
                                                            <button onClick={() => handleDeleteException(exception.id)} className="p-1 hover:bg-red-50 rounded">
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Task Modal */}
                {showTaskModal && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingTask ? 'Edit Task' : 'Create Task'}
                                </h2>
                                <button
                                    onClick={() => setShowTaskModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={taskForm.title}
                                        onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter task title"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
                                        <select
                                            value={taskForm.activity}
                                            onChange={(e) => setTaskForm({...taskForm, activity: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select activity</option>
                                            <option value="harvest">Harvest</option>
                                            <option value="irrigation">Irrigation</option>
                                            <option value="pesticide">Pesticide Application</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {taskForm.activity === 'other' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Activity</label>
                                            <input
                                                type="text"
                                                value={taskForm.custom_activity}
                                                onChange={(e) => setTaskForm({...taskForm, custom_activity: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Describe custom activity"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                                        <input
                                            type="text"
                                            value={taskForm.assigned_to}
                                            onChange={(e) => setTaskForm({...taskForm, assigned_to: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter assignee name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={taskForm.description}
                                            onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="3"
                                            placeholder="Enter task description"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                            <input
                                                type="time"
                                                value={taskForm.time}
                                                onChange={(e) => setTaskForm({...taskForm, time: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={taskForm.date instanceof Date ? taskForm.date.toISOString().split('T')[0] : (taskForm.date || '')}
                                                onChange={(e) => setTaskForm({...taskForm, date: e.target.value ? new Date(e.target.value) : ''})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                        <select
                                            value={taskForm.priority}
                                            onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowTaskModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTask}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    {editingTask ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Exception Modal */}
                {showExceptionModal && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingException ? 'Edit Exception' : 'Record Exception'}
                                </h2>
                                <button
                                    onClick={() => setShowExceptionModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={exceptionForm.title}
                                        onChange={(e) => setExceptionForm({...exceptionForm, title: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter exception title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={exceptionForm.description}
                                        onChange={(e) => setExceptionForm({...exceptionForm, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="Describe the exception"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                                        <input
                                            type="text"
                                            value={exceptionForm.reported_by}
                                            onChange={(e) => setExceptionForm({...exceptionForm, reported_by: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={exceptionForm.location}
                                            onChange={(e) => setExceptionForm({...exceptionForm, location: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Location of incident"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                        <select
                                            value={exceptionForm.severity}
                                            onChange={(e) => setExceptionForm({...exceptionForm, severity: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={exceptionForm.status}
                                            onChange={(e) => setExceptionForm({...exceptionForm, status: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="open">Open</option>
                                            <option value="investigating">Investigating</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Weather Conditions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Weather Conditions</label>
                                    <div className="flex flex-wrap gap-2">
                                        {weatherOptions.map(({ value, label, icon: IconComponent }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => handleWeatherToggle(value)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                                    exceptionForm.weather_conditions.includes(value)
                                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                <IconComponent size={16} />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Evidence Files */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Files</label>
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,video/*,audio/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="evidence-upload"
                                        />
                                        <label
                                            htmlFor="evidence-upload"
                                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <Upload size={16} />
                                            Upload Evidence
                                        </label>

                                        {exceptionForm.evidence_files.length > 0 && (
                                            <div className="space-y-1">
                                                {exceptionForm.evidence_files.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                                        <span className="text-sm text-gray-700">{file.name}</span>
                                                        <button
                                                            onClick={() => removeFile(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowExceptionModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveException}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    {editingException ? 'Update Exception' : 'Record Exception'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </SideNav>
    );
};

export default TaskManagement;