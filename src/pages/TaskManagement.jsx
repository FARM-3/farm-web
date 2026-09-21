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
    RotateCcw,
    ChevronDown,
    ChevronUp,
    Loader2
} from 'lucide-react';
import { API_ENDPOINTS, getApiBaseUrl } from '../services/ApiConfig';

const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    DARK_BROWN: '#4A3423',
    BUTTON_BROWN: '#8B4513',
    LIGHT_BG: '#efebe9',
};

const TaskManagement = () => {
    // Helper function to get auth token from localStorage or sessionStorage
    const getAuthToken = () => {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    };

    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'surveillance', 'weekly-plan'
    const [tasks, setTasks] = useState([]);
    const [taskSubmissions, setTaskSubmissions] = useState([]); // Submissions from mobile app
    const [exceptions, setExceptions] = useState([]);
    const [farmBlocks, setFarmBlocks] = useState([]);
    const [sopTemplates, setSopTemplates] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showExceptionModal, setShowExceptionModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editingException, setEditingException] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [draggedSop, setDraggedSop] = useState(null);
    const [calendarView, setCalendarView] = useState('week'); // 'week', 'month', 'year'
    const [selectedTask, setSelectedTask] = useState(null); // For task detail modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [slaTimers, setSlaTimers] = useState({});
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [expandedTaskIds, setExpandedTaskIds] = useState([]); // For expandable task rows
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Removed demo/mock data — data is fetched from backend endpoints

    // Task form state (fields to capture when creating a task)
    const [taskForm, setTaskForm] = useState({
        title: '',
        activity: '',
        custom_activity: '',
        assigned_to: [], // Array of staff IDs
        description: '',
        time: '',
        priority: 'medium',
        date: selectedDate,
    });

    // Dropdown state for staff selection
    const [showStaffDropdown, setShowStaffDropdown] = useState(false);
    const [staffSearchTerm, setStaffSearchTerm] = useState('');

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
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.TASKS, {
                headers: {
                    'Authorization': `Bearer ${token}`,
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
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.BLOCKS, {
                headers: {
                    'Authorization': `Bearer ${token}`,
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

    const fetchSurveillanceReports = useCallback(async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.SURVEILLANCE, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                const reports = data.results || data || [];
                setExceptions(reports.map(r => ({
                    id: r.id,
                    report_id: r.report_id,
                    title: r.title,
                    description: r.description,
                    severity: r.severity,
                    issue_type: r.issue_type,
                    location: r.location || r.block_id || '—',
                    reported_by: r.reported_by_display || r.reported_by_name || 'Mobile user',
                    created_at: r.created_at,
                    status: r.status,
                    weather_conditions: r.weather_conditions || [],
                    photo_url: r.photo_url,
                    block_id: r.block_id,
                })));
            } else {
                setExceptions([]);
            }
        } catch (error) {
            console.error('Error fetching surveillance reports:', error);
            setExceptions([]);
        }
    }, []);

    const fetchStaffMembers = useCallback(async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.STAFF, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStaffMembers(data.results || data);
            } else {
                console.error('Failed to fetch staff members, server responded with', response.status);
                setStaffMembers([]);
            }
        } catch (error) {
            console.error('Error fetching staff members:', error);
            setStaffMembers([]);
        }
    }, []);

    // Fetch task submissions from mobile app
    const fetchTaskSubmissions = useCallback(async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.TASK_SUBMISSIONS, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const submissions = data.results || data;
                setTaskSubmissions(submissions);
                console.log('[TaskManagement] Task submissions fetched:', submissions.length, 'submissions');
                if (submissions.length > 0) {
                    console.log('[TaskManagement] Sample submission:', submissions[0]);
                    console.log('[TaskManagement] All assigned_task_ids:', submissions.map(s => s.assigned_task_id));
                }
            } else {
                console.error('[TaskManagement] Failed to fetch task submissions, server responded with', response.status);
                setTaskSubmissions([]);
            }
        } catch (error) {
            console.error('Error fetching task submissions:', error);
            setTaskSubmissions([]);
        }
    }, []);

    // Helper function to get submission status for a task
    const getTaskSubmissionStatus = (taskId) => {
        const submission = taskSubmissions.find(s => s.assigned_task_id === taskId);
        return submission ? submission.status : null;
    };

    // Get status badge color
    const getSubmissionStatusColor = (status) => {
        switch (status) {
            case 'accepted': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    // Toggle expanded row
    const toggleExpandRow = (taskId) => {
        setExpandedTaskIds(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    // Get full submission details for a task
    const getTaskSubmission = (taskId) => {
        return taskSubmissions.find(s => s.assigned_task_id === taskId);
    };

    // Helper function to construct full photo URL
    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return '';
        // If it's already a full URL, return as is
        if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
            return photoPath;
        }
        // Otherwise, prepend the API base URL
        const baseUrl = getApiBaseUrl();
        // Remove leading slash from photoPath if present to avoid double slashes
        const path = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
        const fullUrl = `${baseUrl}/${path}`;
        console.log('[TaskManagement] Photo URL construction:', {
            original: photoPath,
            baseUrl: baseUrl,
            path: path,
            fullUrl: fullUrl
        });
        return fullUrl;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([
                fetchTasks(), fetchFarmBlocks(), fetchStaffMembers(),
                fetchTaskSubmissions(), fetchSurveillanceReports(),
            ]);
            setLoading(false);
        };
        fetchData();
    }, [fetchTasks, fetchFarmBlocks, fetchStaffMembers, fetchTaskSubmissions, fetchSurveillanceReports]);

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
            assigned_to: [],
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
            // Convert activity array back to single string for the form
            activity: Array.isArray(task.activity) ? (task.activity[0] || '') : (task.activity || ''),
            custom_activity: task.custom_activity || '',
            assigned_to: Array.isArray(task.assigned_to) ? task.assigned_to : [],
            description: task.description || '',
            time: task.time || '',
            priority: task.priority || 'medium',
            date: task.date ? new Date(task.date) : (task.due_date ? new Date(task.due_date) : selectedDate),
            block: task.block || null,
            season: task.season || null,
        });
        setShowTaskModal(true);
    };

    const handleSaveTask = async () => {
        try {
            const token = getAuthToken();

            // Check if token exists
            if (!token) {
                alert('You are not logged in. Please login again.');
                navigate('/login');
                return;
            }

            const method = editingTask ? 'PUT' : 'POST';
            const url = editingTask
                ? `${API_ENDPOINTS.TASKS || `${API_ENDPOINTS.getApiBaseUrl()}/api/tasks/`}${editingTask.id}/`
                : (API_ENDPOINTS.TASKS || `${API_ENDPOINTS.getApiBaseUrl()}/api/tasks/`);

            // Ensure date is sent as YYYY-MM-DD and activity is an array
            const payload = {
                title: taskForm.title,
                description: taskForm.description,
                activity: taskForm.activity ? [taskForm.activity] : [],
                custom_activity: taskForm.custom_activity || '',
                priority: taskForm.priority,
                assigned_to: taskForm.assigned_to,
                date: taskForm.date instanceof Date ? taskForm.date.toISOString().split('T')[0] : taskForm.date,
                time: taskForm.time || '',
                completed: false,
            };

            // Only include block and season if they have values
            if (taskForm.block) payload.block = taskForm.block;
            if (taskForm.season) payload.season = taskForm.season;

            console.log('Sending task payload:', payload);
            console.log('Auth token:', token ? 'Present' : 'Missing');

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchTasks();
                setShowTaskModal(false);
                setSuccessMessage(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
                setShowSuccessModal(true);
            } else {
                // Try to parse as JSON, but if it fails, get the text (HTML error page)
                const contentType = response.headers.get("content-type");
                let errorData;
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    errorData = await response.json();
                } else {
                    errorData = await response.text();
                }
                console.error('Backend error response:', errorData);
                console.error('Response status:', response.status);
                alert(`Failed to save task. Status: ${response.status}. Check console for details.`);
            }
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Error saving task: ' + error.message);
        }
    };

    const handleDeleteTask = (task) => {
        setTaskToDelete(task);
        setShowDeleteModal(true);
    };

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;
        setDeleting(true);

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_ENDPOINTS.TASKS}${taskToDelete.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await fetchTasks();
                setShowDeleteModal(false);
                setTaskToDelete(null);
                setSuccessMessage('Task deleted successfully!');
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 3000);
            } else {
                alert('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task');
        } finally {
            setDeleting(false);
        }
    };

    // Delete exception
    const handleDeleteException = async (exceptionId) => {
        if (!window.confirm('Are you sure you want to delete this exception?')) return;

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_ENDPOINTS.SURVEILLANCE}${exceptionId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await fetchSurveillanceReports();
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
            const token = getAuthToken();
            const method = editingException ? 'PUT' : 'POST';
            const url = editingException
                ? `${API_ENDPOINTS.SURVEILLANCE}${editingException.id}/`
                : API_ENDPOINTS.SURVEILLANCE;

            const formData = new FormData();
            if (!editingException) {
                formData.append('report_id', `SUR-${Date.now().toString().slice(-8)}`);
            }
            formData.append('title', exceptionForm.title);
            formData.append('description', exceptionForm.description);
            formData.append('severity', exceptionForm.severity);
            formData.append('status', exceptionForm.status || 'open');
            formData.append('location', exceptionForm.location);
            formData.append('block_id', exceptionForm.location);
            formData.append('reported_by_name', exceptionForm.reported_by || 'Web user');
            formData.append('issue_type', exceptionForm.issue_type || 'other');
            formData.append('weather_conditions', JSON.stringify(exceptionForm.weather_conditions || []));
            exceptionForm.evidence_files?.forEach(file => {
                formData.append('photo', file);
            });

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                await fetchSurveillanceReports();
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
                const token = getAuthToken();
                const response = await fetch(API_ENDPOINTS.TASKS, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
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

    // Calendar navigation helpers
    const navigateCalendar = (direction) => {
        const newDate = new Date(selectedDate);
        if (calendarView === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else if (calendarView === 'month') {
            newDate.setMonth(newDate.getMonth() + direction);
        } else if (calendarView === 'year') {
            newDate.setFullYear(newDate.getFullYear() + direction);
        }
        setSelectedDate(newDate);
    };

    const getCalendarTitle = () => {
        if (calendarView === 'week') {
            const start = new Date(selectedDate);
            start.setDate(selectedDate.getDate() - selectedDate.getDay());
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else if (calendarView === 'month') {
            return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else {
            return selectedDate.getFullYear().toString();
        }
    };

    // Filter functions
    const filteredTasks = tasks.filter(task => {
        // Handle assigned_to as array of staff IDs
        const assignedStaffNames = Array.isArray(task.assigned_to)
            ? task.assigned_to.map(staffId => {
                const staff = staffMembers.find(s => s.staff_id === staffId);
                return staff ? `${staff.first_name} ${staff.last_name}`.toLowerCase() : staffId.toLowerCase();
            }).join(' ')
            : '';

        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            assignedStaffNames.includes(searchTerm.toLowerCase());
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
                    {/* Show Create Task button only on Tasks tab */}
                    {activeTab === 'tasks' && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleCreateTask}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-white transition hover:shadow-xl"
                                style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
                            >
                                <Plus className="w-4 h-4" />
                                Create Task
                            </button>
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="mb-6 bg-white rounded-2xl shadow-lg p-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                            onClick={() => setActiveTab('surveillance')}
                            className={`px-4 py-2.5 rounded-xl transition-all font-medium text-center ${
                                activeTab === 'surveillance' ? 'shadow-md' : 'hover:bg-gray-50'
                            }`}
                            style={{
                                backgroundColor: activeTab === 'surveillance' ? '#8B4513' : 'transparent',
                                color: activeTab === 'surveillance' ? '#FFFFFF' : '#4A3423',
                            }}
                        >
                            Surveillance
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

                    {/* Show status filter only for surveillance tab */}
                    {activeTab === 'surveillance' && (
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:ring-brown-500 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    )}

                    {/* Show calendar view selector only for weekly-plan tab */}
                    {activeTab === 'weekly-plan' && (
                        <select
                            value={calendarView}
                            onChange={(e) => setCalendarView(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:ring-brown-500 outline-none"
                        >
                            <option value="week">Week View</option>
                            <option value="month">Month View</option>
                            <option value="year">Year View</option>
                        </select>
                    )}
                </div>

                {/* Surveillance Tab */}
                {activeTab === 'surveillance' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Farm Surveillance Reports
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Entries submitted by mobile app users during farm surveillance
                                </p>
                            </div>

                            <div className="p-6">
                                {exceptions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-500">No surveillance reports yet</p>
                                        <p className="text-sm text-gray-400 mt-2">Reports from mobile app will appear here</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {exceptions.map((report) => (
                                            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-gray-800">{report.title}</h3>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        report.severity === 'high' ? 'bg-red-100 text-red-800' :
                                                        report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                        {report.severity}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                    <span>Block: {report.block_id || report.location}</span>
                                                    <span className="capitalize">{report.issue_type?.replace('_', ' ') || 'issue'}</span>
                                                    <span>{report.reported_by}</span>
                                                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                                    <span className="capitalize px-2 py-0.5 rounded bg-gray-100">{report.status}</span>
                                                </div>
                                                {report.photo_url && (
                                                    <a href={report.photo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8B4513] mt-2 inline-block">View photo evidence</a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Weekly Plan Tab */}
                {activeTab === 'weekly-plan' && (
                    <div className="space-y-6">
                        {/* Calendar View */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                                        {calendarView === 'week' ? 'Weekly' : calendarView === 'month' ? 'Monthly' : 'Yearly'} Planning Calendar
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">{getCalendarTitle()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigateCalendar(-1)}
                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        onClick={() => setSelectedDate(new Date())}
                                        className="px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm text-blue-700 font-medium transition-colors"
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={() => navigateCalendar(1)}
                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>

                            {/* Week View Calendar Grid */}
                            {calendarView === 'week' && (
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
                                                            onClick={() => setSelectedTask(task)}
                                                            className="absolute left-1 right-1 bg-blue-100 border border-blue-300 rounded p-1 text-xs cursor-pointer hover:bg-blue-200 hover:shadow-md transition-all"
                                                            style={{
                                                                top: `${topPx}px`,
                                                                height: '40px',
                                                                zIndex: 10
                                                            }}
                                                        >
                                                            <div className="font-semibold text-blue-800 truncate">{task.title}</div>
                                                            <div className="text-blue-600 truncate">
                                                                {Array.isArray(task.assigned_to) && task.assigned_to.length > 0
                                                                    ? task.assigned_to.map(staffId => {
                                                                        const staff = staffMembers.find(s => s.staff_id === staffId);
                                                                        return staff ? `${staff.first_name} ${staff.last_name}` : staffId;
                                                                    }).join(', ')
                                                                    : 'Unassigned'
                                                                }
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            )}

                            {/* Month View Calendar Grid */}
                            {calendarView === 'month' && (
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                {/* Month Header - Days of Week */}
                                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="p-3 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Month Grid */}
                                <div className="grid grid-cols-7">
                                    {(() => {
                                        const year = selectedDate.getFullYear();
                                        const month = selectedDate.getMonth();
                                        const firstDay = new Date(year, month, 1);
                                        const lastDay = new Date(year, month + 1, 0);
                                        const startPadding = firstDay.getDay();
                                        const daysInMonth = lastDay.getDate();
                                        const totalCells = Math.ceil((startPadding + daysInMonth) / 7) * 7;

                                        return Array.from({ length: totalCells }, (_, i) => {
                                            const dayNumber = i - startPadding + 1;
                                            const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
                                            const date = isValidDay ? new Date(year, month, dayNumber) : null;
                                            const isToday = date && date.toDateString() === new Date().toDateString();

                                            const dayTasks = isValidDay ? tasks.filter(task => {
                                                const taskDate = new Date(task.date || task.due_date);
                                                return taskDate.toDateString() === date.toDateString();
                                            }) : [];

                                            return (
                                                <div
                                                    key={i}
                                                    className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                                                        !isValidDay ? 'bg-gray-50' : isToday ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
                                                    } transition-colors`}
                                                >
                                                    {isValidDay && (
                                                        <>
                                                            <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                                                                {dayNumber}
                                                            </div>
                                                            <div className="space-y-1">
                                                                {dayTasks.slice(0, 3).map(task => (
                                                                    <div
                                                                        key={task.id}
                                                                        onClick={() => setSelectedTask(task)}
                                                                        className="text-xs p-1 bg-blue-100 border border-blue-300 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                                                                    >
                                                                        <div className="font-semibold text-blue-800 truncate">{task.title}</div>
                                                                        {task.time && (
                                                                            <div className="text-blue-600 truncate">{task.time}</div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {dayTasks.length > 3 && (
                                                                    <div className="text-xs text-gray-500 px-1">
                                                                        +{dayTasks.length - 3} more
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                            )}

                            {/* Year View Calendar Grid */}
                            {calendarView === 'year' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {Array.from({ length: 12 }, (_, monthIndex) => {
                                    const year = selectedDate.getFullYear();
                                    const month = monthIndex;
                                    const firstDay = new Date(year, month, 1);
                                    const lastDay = new Date(year, month + 1, 0);
                                    const startPadding = firstDay.getDay();
                                    const daysInMonth = lastDay.getDate();
                                    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });

                                    const monthTasks = tasks.filter(task => {
                                        const taskDate = new Date(task.date || task.due_date);
                                        return taskDate.getFullYear() === year && taskDate.getMonth() === month;
                                    });

                                    return (
                                        <div key={monthIndex} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                            <div className="bg-gray-50 p-3 border-b border-gray-200">
                                                <h3 className="font-semibold text-gray-800 text-center">{monthName}</h3>
                                            </div>
                                            <div className="p-2">
                                                {/* Mini calendar grid */}
                                                <div className="grid grid-cols-7 gap-1 text-xs">
                                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                        <div key={i} className="text-center font-semibold text-gray-500 p-1">
                                                            {day}
                                                        </div>
                                                    ))}
                                                    {Array.from({ length: startPadding }, (_, i) => (
                                                        <div key={`pad-${i}`} className="p-1"></div>
                                                    ))}
                                                    {Array.from({ length: daysInMonth }, (_, i) => {
                                                        const dayNumber = i + 1;
                                                        const date = new Date(year, month, dayNumber);
                                                        const isToday = date.toDateString() === new Date().toDateString();
                                                        const dayTaskCount = monthTasks.filter(task => {
                                                            const taskDate = new Date(task.date || task.due_date);
                                                            return taskDate.getDate() === dayNumber;
                                                        }).length;

                                                        return (
                                                            <div
                                                                key={dayNumber}
                                                                className={`p-1 text-center rounded cursor-pointer transition-colors ${
                                                                    isToday ? 'bg-blue-500 text-white font-bold' :
                                                                    dayTaskCount > 0 ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                                                    'text-gray-700 hover:bg-gray-100'
                                                                }`}
                                                                onClick={() => {
                                                                    setSelectedDate(date);
                                                                    setCalendarView('month');
                                                                }}
                                                            >
                                                                {dayNumber}
                                                                {dayTaskCount > 0 && !isToday && (
                                                                    <div className="text-[8px] leading-none text-blue-600">●</div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-gray-200 text-center">
                                                    <span className="text-xs font-semibold text-gray-600">
                                                        {monthTasks.length} task{monthTasks.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            )}

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
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center">
                                                <Clock className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                                <p className="mt-2 text-gray-600">Loading tasks...</p>
                                            </td>
                                        </tr>
                                    ) : filteredTasks.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                No tasks found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTasks.map((task) => (
                                            <React.Fragment key={task.id}>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{task.title}</p>
                                                        <p className="text-sm text-gray-600 truncate max-w-xs">{task.description}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {task.activity === 'other' ? task.custom_activity : task.activity}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {Array.isArray(task.assigned_to) && task.assigned_to.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {task.assigned_to.map(staffId => {
                                                                const staff = staffMembers.find(s => s.staff_id === staffId);
                                                                return staff ? (
                                                                    <span
                                                                        key={staffId}
                                                                        className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                                                    >
                                                                        {staff.first_name} {staff.last_name}
                                                                    </span>
                                                                ) : (
                                                                    <span
                                                                        key={staffId}
                                                                        className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                                                    >
                                                                        {staffId}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-700">{task.time || ''}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{task.date || task.due_date || ''}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {(() => {
                                                        const status = getTaskSubmissionStatus(task.id);
                                                        return status ? (
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSubmissionStatusColor(status)}`}>
                                                                {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                                                                Pending
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        {(() => {
                                                            const submission = getTaskSubmission(task.id);
                                                            // Show chevron for ANY submission (not just completed or with photos)
                                                            return submission ? (
                                                                <button
                                                                    onClick={() => toggleExpandRow(task.id)}
                                                                    className="p-1 hover:bg-purple-50 rounded"
                                                                    title="View submission details"
                                                                >
                                                                    {expandedTaskIds.includes(task.id) ? (
                                                                        <ChevronUp className="w-4 h-4 text-purple-600" />
                                                                    ) : (
                                                                        <ChevronDown className="w-4 h-4 text-purple-600" />
                                                                    )}
                                                                </button>
                                                            ) : null;
                                                        })()}
                                                        <button onClick={() => handleEditTask(task)} className="p-1 hover:bg-blue-50 rounded">
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </button>
                                                        <button onClick={() => handleDeleteTask(task)} className="p-1 hover:bg-red-50 rounded" title="Delete Task">
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expandable row for submission details */}
                                            {expandedTaskIds.includes(task.id) && (() => {
                                                const submission = getTaskSubmission(task.id);
                                                if (!submission) return null;

                                                return (
                                                    <tr key={`${task.id}-expanded`}>
                                                        <td colSpan="8" className="px-6 py-4 bg-purple-50">
                                                            <div className="space-y-4">
                                                                <h4 className="font-semibold text-lg" style={{ color: CoffeeColors.DARK_BROWN }}>
                                                                    Submission Details
                                                                </h4>

                                                                {/* Timeline */}
                                                                <div className="flex gap-6 text-sm text-gray-600">
                                                                    {submission.accepted_at && (
                                                                        <div>
                                                                            <span className="font-medium">Accepted:</span>{' '}
                                                                            {new Date(submission.accepted_at).toLocaleString()}
                                                                        </div>
                                                                    )}
                                                                    {submission.started_at && (
                                                                        <div>
                                                                            <span className="font-medium">Started:</span>{' '}
                                                                            {new Date(submission.started_at).toLocaleString()}
                                                                        </div>
                                                                    )}
                                                                    {submission.completed_at && (
                                                                        <div>
                                                                            <span className="font-medium">Completed:</span>{' '}
                                                                            {new Date(submission.completed_at).toLocaleString()}
                                                                        </div>
                                                                    )}
                                                                    {submission.duration_minutes && (
                                                                        <div>
                                                                            <span className="font-medium">Duration:</span>{' '}
                                                                            {submission.duration_minutes} minutes
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Comment */}
                                                                {submission.completion_comment && (
                                                                    <div>
                                                                        <h5 className="font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                                                            Comment:
                                                                        </h5>
                                                                        <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">
                                                                            {submission.completion_comment}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* Photos */}
                                                                {submission.photos && submission.photos.length > 0 && (
                                                                    <div>
                                                                        <h5 className="font-medium mb-3" style={{ color: CoffeeColors.DARK_BROWN }}>
                                                                            Photos ({submission.photos.length}):
                                                                        </h5>
                                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                            {submission.photos.map((photo, index) => {
                                                                                const photoUrl = getPhotoUrl(photo);
                                                                                return (
                                                                                    <a
                                                                                        key={index}
                                                                                        href={photoUrl}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="block"
                                                                                    >
                                                                                        <img
                                                                                            src={photoUrl}
                                                                                            alt={`Task photo ${index + 1}`}
                                                                                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all bg-white"
                                                                                        />
                                                                                    </a>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Submitted by */}
                                                                {submission.user && (
                                                                    <div className="text-sm text-gray-600 pt-2 border-t border-gray-300">
                                                                        <span className="font-medium">Submitted by:</span>{' '}
                                                                        {submission.user.name || submission.user.phone || 'Unknown'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })()}
                                            </React.Fragment>
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
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <Clock className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                                <p className="mt-2 text-gray-600">Loading exceptions...</p>
                                            </td>
                                        </tr>
                                    ) : filteredExceptions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
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

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Assigned To
                                        </label>

                                        {/* Selected Staff Tags */}
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {taskForm.assigned_to.map(staffId => {
                                                const staff = staffMembers.find(s => s.staff_id === staffId);
                                                return staff ? (
                                                    <span
                                                        key={staffId}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm"
                                                    >
                                                        {staff.first_name} {staff.last_name}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setTaskForm({
                                                                    ...taskForm,
                                                                    assigned_to: taskForm.assigned_to.filter(id => id !== staffId)
                                                                });
                                                            }}
                                                            className="ml-1 hover:text-blue-900 font-bold text-lg leading-none"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>

                                        {/* Add Staff Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowStaffDropdown(!showStaffDropdown);
                                                setStaffSearchTerm('');
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        >
                                            <span className="text-gray-500">
                                                {taskForm.assigned_to.length === 0
                                                    ? 'Click to select staff member'
                                                    : 'Click to add more staff'}
                                            </span>
                                            <svg className={`w-4 h-4 transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Dropdown */}
                                        {showStaffDropdown && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                                                {/* Search Input */}
                                                <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                                                    <input
                                                        type="text"
                                                        value={staffSearchTerm}
                                                        onChange={(e) => setStaffSearchTerm(e.target.value)}
                                                        placeholder="Search staff..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        autoFocus
                                                    />
                                                </div>

                                                {/* Staff List */}
                                                <div className="overflow-y-auto max-h-48">
                                                    {staffMembers.length === 0 ? (
                                                        <div className="p-3 text-sm text-gray-500 text-center">
                                                            No staff members available
                                                        </div>
                                                    ) : (
                                                        staffMembers
                                                            .filter(staff => {
                                                                const searchLower = staffSearchTerm.toLowerCase();
                                                                return (
                                                                    staff.first_name.toLowerCase().includes(searchLower) ||
                                                                    staff.last_name.toLowerCase().includes(searchLower) ||
                                                                    staff.staff_id.toLowerCase().includes(searchLower)
                                                                );
                                                            })
                                                            .map((staff) => {
                                                                const isSelected = taskForm.assigned_to.includes(staff.staff_id);
                                                                if (isSelected) return null; // Don't show already selected staff

                                                                return (
                                                                    <button
                                                                        key={staff.staff_id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setTaskForm({
                                                                                ...taskForm,
                                                                                assigned_to: [...taskForm.assigned_to, staff.staff_id]
                                                                            });
                                                                            setShowStaffDropdown(false);
                                                                            setStaffSearchTerm('');
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0"
                                                                    >
                                                                        <span className="text-sm text-gray-700">
                                                                            {staff.first_name} {staff.last_name}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {staff.staff_id}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
                                    className="px-4 py-2 text-white rounded-lg transition-colors"
                                    style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
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

                {/* Task Detail Modal */}
                {selectedTask && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-800">Task Details</h2>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Task Title */}
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900">{selectedTask.title}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                            selectedTask.priority === 'high' ? 'bg-red-100 text-red-800' :
                                            selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {selectedTask.priority} Priority
                                        </span>
                                        {selectedTask.completed && (
                                            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                                ✓ Completed
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedTask.description && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedTask.description}</p>
                                    </div>
                                )}

                                {/* Activity */}
                                {Array.isArray(selectedTask.activity) && selectedTask.activity.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTask.activity.map((act, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                    {act}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Custom Activity */}
                                {selectedTask.custom_activity && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Activity</label>
                                        <p className="text-gray-700">{selectedTask.custom_activity}</p>
                                    </div>
                                )}

                                {/* Date and Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                        <p className="text-gray-900 font-medium">
                                            {new Date(selectedTask.date || selectedTask.due_date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    {selectedTask.time && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                            <p className="text-gray-900 font-medium">{selectedTask.time}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Assigned Staff */}
                                {Array.isArray(selectedTask.assigned_to) && selectedTask.assigned_to.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTask.assigned_to.map(staffId => {
                                                const staff = staffMembers.find(s => s.staff_id === staffId);
                                                return staff ? (
                                                    <div key={staffId} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                                                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                                            {staff.first_name[0]}{staff.last_name[0]}
                                                        </span>
                                                        <span className="text-gray-900">{staff.first_name} {staff.last_name}</span>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Block Information */}
                                {selectedTask.block_name && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Farm Block</label>
                                        <p className="text-gray-900">{selectedTask.block_name}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            handleEditTask(selectedTask);
                                            setSelectedTask(null);
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Edit Task
                                    </button>
                                    <button
                                        onClick={() => setSelectedTask(null)}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fadeIn">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                                <p className="text-gray-600 mb-6">{successMessage}</p>
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && taskToDelete && (
                <div
                    className="fixed inset-0 flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)',
                        zIndex: 1000,
                    }}
                    onClick={() => {
                        setShowDeleteModal(false);
                        setTaskToDelete(null);
                    }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                                Confirm Delete
                            </h3>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setTaskToDelete(null);
                                }}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete task:{' '}
                            <strong>{taskToDelete.title}</strong>?
                            <br />
                            <span className="text-sm text-gray-500">
                                This action cannot be undone.
                            </span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setTaskToDelete(null);
                                }}
                                className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteTask}
                                disabled={deleting}
                                className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center"
                                style={{
                                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                                }}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SideNav>
    );
};

export default TaskManagement;