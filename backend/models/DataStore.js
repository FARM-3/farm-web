const { v4: uuidv4 } = require('uuid');

// In-memory data storage
class DataStore {
  constructor() {
    this.tasks = [];
    this.exceptions = [];
    this.farmBlocks = [];
    this.sopTemplates = [];
    this.users = [];
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Sample Farm Blocks
    this.farmBlocks = [
      {
        id: 'FB001',
        name: 'North Block',
        area: 15.5,
        crop: 'Coffee',
        condition_score: 85,
        open_tasks: 3,
        last_inspection: '2024-12-10',
        location: { lat: 0.3476, lng: 32.5825 },
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'FB002',
        name: 'South Block',
        area: 22.3,
        crop: 'Coffee',
        condition_score: 72,
        open_tasks: 5,
        last_inspection: '2024-12-08',
        location: { lat: 0.3456, lng: 32.5805 },
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'FB003',
        name: 'East Block',
        area: 18.7,
        crop: 'Coffee',
        condition_score: 91,
        open_tasks: 1,
        last_inspection: '2024-12-11',
        location: { lat: 0.3486, lng: 32.5845 },
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Sample SOP Templates
    this.sopTemplates = [
      {
        id: 'SOP001',
        name: 'Harvest Monitoring',
        category: 'Harvest',
        priority: 'high',
        duration: '2 hours',
        description: 'Monitor coffee cherry ripeness and plan harvest schedule',
        steps: [
          'Walk through designated areas',
          'Check cherry color and firmness',
          'Record ripeness percentage',
          'Update harvest schedule'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 'SOP002',
        name: 'Pruning',
        category: 'Maintenance',
        priority: 'medium',
        duration: '4 hours',
        description: 'Prune coffee trees to improve yield and health',
        steps: [
          'Identify dead or diseased branches',
          'Remove suckers from base',
          'Prune to maintain proper height',
          'Clean and sanitize tools'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 'SOP003',
        name: 'Fertilizer Application',
        category: 'Nutrition',
        priority: 'high',
        duration: '3 hours',
        description: 'Apply organic fertilizer to coffee plants',
        steps: [
          'Calculate fertilizer requirements',
          'Apply fertilizer around drip line',
          'Water thoroughly after application',
          'Record application details'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 'SOP004',
        name: 'Pest Inspection',
        category: 'Pest Control',
        priority: 'medium',
        duration: '2.5 hours',
        description: 'Inspect coffee plants for pest and disease signs',
        steps: [
          'Check leaves for discoloration',
          'Look for pest insects',
          'Examine soil for disease signs',
          'Document findings and treatment needed'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 'SOP005',
        name: 'Weed Control',
        category: 'Maintenance',
        priority: 'low',
        duration: '3 hours',
        description: 'Remove weeds around coffee plants',
        steps: [
          'Identify weed species',
          'Remove weeds manually or with tools',
          'Apply mulch where appropriate',
          'Dispose of weeds properly'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 'SOP006',
        name: 'Quality Control Check',
        category: 'Quality',
        priority: 'high',
        duration: '1.5 hours',
        description: 'Conduct quality control inspection of harvested coffee',
        steps: [
          'Sample coffee cherries',
          'Check for defects and foreign matter',
          'Measure moisture content',
          'Grade quality level'
        ],
        created_at: new Date().toISOString()
      }
    ];

    // Sample Tasks
    this.tasks = [
      {
        id: uuidv4(),
        title: 'Morning Harvest Inspection',
        description: 'Check ripeness levels in North Block and plan today\'s harvest',
        assigned_to: 'John Kamau',
        priority: 'high',
        status: 'pending',
        due_date: '2024-12-12',
        farm_block: 'FB001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Fertilizer Application - South Block',
        description: 'Apply organic fertilizer to coffee plants in South Block',
        assigned_to: 'Mary Wanjiku',
        priority: 'medium',
        status: 'in_progress',
        due_date: '2024-12-13',
        farm_block: 'FB002',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Equipment Maintenance',
        description: 'Service and clean harvesting equipment',
        assigned_to: 'Peter Mwangi',
        priority: 'low',
        status: 'completed',
        due_date: '2024-12-11',
        farm_block: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Sample Exceptions
    this.exceptions = [
      {
        id: uuidv4(),
        title: 'Pest Infestation Detected',
        description: 'Found signs of coffee berry borer in East Block section 3',
        severity: 'high',
        status: 'open',
        weather_conditions: ['sunny', 'dry'],
        evidence_files: [],
        reported_by: 'Samuel Kiprotich',
        location: 'East Block - Section 3',
        farm_block: 'FB003',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Irrigation System Issue',
        description: 'Sprinkler system not working properly in South Block',
        severity: 'medium',
        status: 'investigating',
        weather_conditions: ['cloudy'],
        evidence_files: [],
        reported_by: 'Grace Achieng',
        location: 'South Block - Section 1',
        farm_block: 'FB002',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Generic CRUD operations
  getAll(collection) {
    return this[collection] || [];
  }

  getById(collection, id) {
    return this[collection].find(item => item.id === id);
  }

  create(collection, data) {
    const newItem = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this[collection].push(newItem);
    return newItem;
  }

  update(collection, id, data) {
    const index = this[collection].findIndex(item => item.id === id);
    if (index === -1) return null;
    
    this[collection][index] = {
      ...this[collection][index],
      ...data,
      updated_at: new Date().toISOString()
    };
    return this[collection][index];
  }

  delete(collection, id) {
    const index = this[collection].findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this[collection].splice(index, 1);
    return true;
  }

  search(collection, query, fields = ['title', 'description']) {
    const searchTerm = query.toLowerCase();
    return this[collection].filter(item =>
      fields.some(field => 
        item[field] && item[field].toLowerCase().includes(searchTerm)
      )
    );
  }
}

// Create singleton instance
const dataStore = new DataStore();

module.exports = dataStore;