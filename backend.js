// ============================================
// SERVER.JS - Main Express Server
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gearguard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Import Routes
const equipmentRoutes = require('./routes/equipment');
const teamRoutes = require('./routes/teams');
const technicianRoutes = require('./routes/technicians');
const requestRoutes = require('./routes/requests');
const reportRoutes = require('./routes/reports');

// Use Routes
app.use('/api/equipment', equipmentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'GearGuard API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// ============================================
// MODELS/EQUIPMENT.JS
// ============================================
const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Production', 'IT', 'Warehouse', 'Maintenance', 'Admin', 'Other']
  },
  assignedTo: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  warrantyExpiry: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Machinery', 'Electronics', 'Vehicles', 'Tools', 'Other']
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  defaultTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  status: {
    type: String,
    enum: ['Active', 'Under Maintenance', 'Scrapped', 'Inactive'],
    default: 'Active'
  },
  notes: String
}, {
  timestamps: true
});

// Index for faster searches
equipmentSchema.index({ department: 1, status: 1 });
equipmentSchema.index({ serialNumber: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);


// ============================================
// MODELS/TEAM.JS
// ============================================
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    enum: ['Mechanical', 'Electrical', 'IT', 'General', 'Other'],
    default: 'General'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);


// ============================================
// MODELS/TECHNICIAN.JS
// ============================================
const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  specialization: {
    type: [String],
    default: []
  },
  avatar: {
    type: String,
    default: function() {
      return this.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Technician', technicianSchema);


// ============================================
// MODELS/REQUEST.JS
// ============================================
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  type: {
    type: String,
    enum: ['Corrective', 'Preventive'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  stage: {
    type: String,
    enum: ['New', 'In Progress', 'Repaired', 'Scrap'],
    default: 'New'
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  category: String,
  createdBy: {
    type: String,
    required: true
  },
  notes: String,
  isOverdue: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual field to check if overdue
requestSchema.virtual('overdue').get(function() {
  if (this.stage === 'Repaired' || this.stage === 'Scrap') return false;
  return this.scheduledDate < new Date();
});

// Middleware to update isOverdue before save
requestSchema.pre('save', function(next) {
  if (this.stage !== 'Repaired' && this.stage !== 'Scrap') {
    this.isOverdue = this.scheduledDate < new Date();
  } else {
    this.isOverdue = false;
  }
  next();
});

// Indexes
requestSchema.index({ stage: 1, scheduledDate: 1 });
requestSchema.index({ equipment: 1 });
requestSchema.index({ assignedTechnician: 1 });

module.exports = mongoose.model('Request', requestSchema);


// ============================================
// ROUTES/EQUIPMENT.JS
// ============================================
const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const Request = require('../models/Request');

// Get all equipment
router.get('/', async (req, res) => {
  try {
    const { department, status, search } = req.query;
    let query = {};

    if (department && department !== 'All') query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { assignedTo: { $regex: search, $options: 'i' } }
      ];
    }

    const equipment = await Equipment.find(query)
      .populate('team', 'name')
      .populate('defaultTechnician', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single equipment
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('team', 'name specialization')
      .populate('defaultTechnician', 'name email avatar');
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get equipment maintenance history
router.get('/:id/requests', async (req, res) => {
  try {
    const requests = await Request.find({ equipment: req.params.id })
      .populate('assignedTechnician', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get open requests count for equipment
router.get('/:id/requests/count', async (req, res) => {
  try {
    const count = await Request.countDocuments({
      equipment: req.params.id,
      stage: { $nin: ['Repaired', 'Scrap'] }
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create equipment
router.post('/', async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();
    await equipment.populate('team', 'name');
    await equipment.populate('defaultTechnician', 'name avatar');
    
    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update equipment
router.patch('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('team', 'name')
    .populate('defaultTechnician', 'name avatar');

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete equipment
router.delete('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// ============================================
// ROUTES/TEAMS.JS
// ============================================
const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Technician = require('../models/Technician');

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true }).sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single team with members
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const members = await Technician.find({ team: req.params.id, isActive: true });
    
    res.json({ ...team.toObject(), members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create team
router.post('/', async (req, res) => {
  try {
    const team = new Team(req.body);
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update team
router.patch('/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete team
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// ============================================
// ROUTES/TECHNICIANS.JS
// ============================================
const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');

// Get all technicians
router.get('/', async (req, res) => {
  try {
    const { teamId } = req.query;
    let query = { isActive: true };
    
    if (teamId) query.team = teamId;

    const technicians = await Technician.find(query)
      .populate('team', 'name')
      .sort({ name: 1 });

    res.json(technicians);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single technician
router.get('/:id', async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.id)
      .populate('team', 'name specialization');
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json(technician);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create technician
router.post('/', async (req, res) => {
  try {
    const technician = new Technician(req.body);
    await technician.save();
    await technician.populate('team', 'name');
    
    res.status(201).json(technician);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update technician
router.patch('/:id', async (req, res) => {
  try {
    const technician = await Technician.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('team', 'name');

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json(technician);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete technician
router.delete('/:id', async (req, res) => {
  try {
    const technician = await Technician.findByIdAndDelete(req.params.id);
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json({ message: 'Technician deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// ============================================
// ROUTES/REQUESTS.JS
// ============================================
const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Equipment = require('../models/Equipment');

// Get all requests
router.get('/', async (req, res) => {
  try {
    const { stage, type, equipmentId, technicianId, startDate, endDate } = req.query;
    let query = {};

    if (stage) query.stage = stage;
    if (type) query.type = type;
    if (equipmentId) query.equipment = equipmentId;
    if (technicianId) query.assignedTechnician = technicianId;
    
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const requests = await Request.find(query)
      .populate('equipment', 'name serialNumber category')
      .populate('assignedTechnician', 'name avatar')
      .populate('team', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single request
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('equipment', 'name serialNumber category location')
      .populate('assignedTechnician', 'name email phone avatar')
      .populate('team', 'name specialization');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get preventive maintenance requests (for calendar)
router.get('/type/preventive', async (req, res) => {
  try {
    const requests = await Request.find({ type: 'Preventive' })
      .populate('equipment', 'name')
      .populate('assignedTechnician', 'name avatar')
      .sort({ scheduledDate: 1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create request with auto-fill logic
router.post('/', async (req, res) => {
  try {
    // Auto-fill logic: Get equipment details
    const equipment = await Equipment.findById(req.body.equipment)
      .populate('team', 'name');

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Auto-populate team and category from equipment
    const requestData = {
      ...req.body,
      team: equipment.team._id,
      category: equipment.category
    };

    const request = new Request(requestData);
    await request.save();
    
    await request.populate('equipment', 'name serialNumber');
    await request.populate('team', 'name');
    
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update request (includes stage changes, assignments, etc.)
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;

    // Auto-update completedDate when moved to Repaired
    if (updates.stage === 'Repaired' && !updates.completedDate) {
      updates.completedDate = new Date();
    }

    // When assigning technician, move to In Progress if in New stage
    const currentRequest = await Request.findById(req.params.id);
    if (updates.assignedTechnician && currentRequest.stage === 'New') {
      updates.stage = 'In Progress';
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('equipment', 'name serialNumber')
    .populate('assignedTechnician', 'name avatar')
    .populate('team', 'name');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update request stage (for drag & drop)
router.patch('/:id/stage', async (req, res) => {
  try {
    const { stage } = req.body;
    const updates = { stage };

    if (stage === 'Repaired') {
      updates.completedDate = new Date();
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    )
    .populate('equipment', 'name')
    .populate('assignedTechnician', 'name avatar');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Assign technician to request
router.patch('/:id/assign', async (req, res) => {
  try {
    const { technicianId } = req.body;
    
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.assignedTechnician = technicianId;
    if (request.stage === 'New') {
      request.stage = 'In Progress';
    }

    await request.save();
    await request.populate('equipment', 'name');
    await request.populate('assignedTechnician', 'name avatar');

    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete request
router.delete('/:id', async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// ============================================
// ROUTES/REPORTS.JS
// ============================================
const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Equipment = require('../models/Equipment');
const Team = require('../models/Team');

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const totalRequests = await Request.countDocuments();
    const newRequests = await Request.countDocuments({ stage: 'New' });
    const inProgressRequests = await Request.countDocuments({ stage: 'In Progress' });
    const completedRequests = await Request.countDocuments({ stage: 'Repaired' });
    const overdueRequests = await Request.countDocuments({ 
      isOverdue: true,
      stage: { $nin: ['Repaired', 'Scrap'] }
    });

    res.json({
      totalRequests,
      newRequests,
      inProgressRequests,
      completedRequests,
      overdueRequests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get requests by team
router.get('/by-team', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true });
    
    const teamStats = await Promise.all(teams.map(async (team) => {
      const count = await Request.countDocuments({ team: team._id });
      return {
        teamId: team._id,
        teamName: team.name,
        count
      };
    }));

    res.json(teamStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get requests by category
router.get('/by-category', async (req, res) => {
  try {
    const categories = await Request.distinct('category');
    
    const categoryStats = await Promise.all(categories.map(async (category) => {
      const count = await Request.countDocuments({ category });
      return {
        category,
        count
      };
    }));

    res.json(categoryStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get requests by stage
router.get('/by-stage', async (req, res) => {
  try {
    const stages = ['New', 'In Progress', 'Repaired', 'Scrap'];
    
    const stageStats = await Promise.all(stages.map(async (stage) => {
      const count = await Request.countDocuments({ stage });
      return {
        stage,
        count
      };
    }));

    res.json(stageStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get average completion time
router.get('/completion-time', async (req, res) => {
  try {
    const completedRequests = await Request.find({ 
      stage: 'Repaired',
      completedDate: { $exists: true }
    }).select('createdAt completedDate duration');

    const avgDuration = completedRequests.reduce((sum, req) => sum + req.duration, 0) / completedRequests.length || 0;

    res.json({
      averageDuration: avgDuration.toFixed(2),
      totalCompleted: completedRequests.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// ============================================
// PACKAGE.JSON
// ============================================
/*
{https://prod.liveshare.vsengsaas.visualstudio.com/join?CBD91BCBB0AFAC64F9FF4D72B8F27BEC8FA8
  "name": "gearguard-backend",
  "version": "1.0.0",
  "description": "GearGuard Maintenance Tracker Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
*/


// ============================================
// .ENV FILE TEMPLATE
// ============================================
/*
MONGODB_URI=mongodb://localhost:27017/gearguard
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
*/


// ============================================
// SEED.JS - Sample Data for Testing
// ============================================
const mongoose = require('mongoose');
const Team = require('./models/Team');
const Technician = require('./models/Technician');
const Equipment = require('./models/Equipment');
const Request = require('./models/Request');

mongoose.connect('mongodb://localhost:27017/gearguard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Team.deleteMany({});
    await Technician.deleteMany({});
    await Equipment.deleteMany({});
    await Request.deleteMany({});

    // Create Teams
    const mechanicsTeam = await Team.create({
      name: 'Mechanics',
      specialization: 'Mechanical',
      description: 'Handles all mechanical equipment repairs'
    });

    const itTeam = await Team.create({
      name: 'IT Support',
      specialization: 'IT',
      description: 'Manages IT equipment and systems'
    });

    const electriciansTeam = await Team.create({
      name: 'Electricians',
      specialization: 'Electrical',
      description: 'Handles electrical repairs and installations'
    });

    // Create Technicians
    const tech1 = await Technician.create({
      name: 'Tom Wilson',
      email: 'tom.wilson@company.com',
      phone: '555-0101',
      team: mechanicsTeam._id,
      specialization: ['CNC Machines', 'Heavy Machinery']
    });

    const tech2 = await Technician.create({
      name: 'Sarah Connor',
      email: 'sarah.connor@company.com',
      phone: '555-0102',
      team: mechanicsTeam._id,
      specialization: ['Forklifts', 'Vehicles']
    });

    const tech3 = await Technician.create({
      name: 'Alex Chen',
      email: 'alex.chen@company.com',
      phone: '555-0103',
      team: itTeam._id,
      specialization: ['Computers', 'Networking']
    });

    // Create Equipment
    const equipment1 = await Equipment.create({
      name: 'CNC Machine 001',
      serialNumber: 'CNC-2023-001',
      department: 'Production',
      assignedTo: 'John Doe',
      purchaseDate: new Date('2023-01-15'),
      warrantyExpiry: new Date('2025-01-15'),
      location: 'Factory Floor A',
      category: 'Machinery',
      team: mechanicsTeam._id,
      defaultTechnician: tech1._id
    });

    const equipment2 = await Equipment.create({
      name: 'Laptop Dell XPS',
      serialNumber: 'LPT-2023-045',
      department: 'IT',
      assignedTo: 'Jane Smith',
      purchaseDate: new Date('2023-06-20'),
      warrantyExpiry: new Date('2024-06-20'),
      location: 'Office 3rd Floor',
      category: 'Electronics',
      team: itTeam._id,
      defaultTechnician: tech3._id
    });

    const equipment3 = await Equipment.create({
      name: 'Forklift Toyota',
      serialNumber: 'FRK-2022-012',
      department: 'Warehouse',
      assignedTo: 'Mike Johnson',
      purchaseDate: new Date('2022-03-10'),
      warrantyExpiry: new Date('2025-03-10'),
      location: 'Warehouse B',
      category: 'Vehicles',
      team: mechanicsTeam._id,
      defaultTechnician: tech2._id
    });

    // Create Requests
    await Request.create({
      subject: 'Oil Leak Detected',
      description: 'Machine is leaking oil from the hydraulic system',
      equipment: equipment1._id,
      type: 'Corrective',
      priority: 'High',
      stage: 'New',
      scheduledDate: new Date('2024-12-28'),
      team: mechanicsTeam._id,
      createdBy: 'System Admin'
    });

    await Request.create({
      subject: 'Routine Inspection',
      description: 'Monthly preventive maintenance check',
      equipment: equipment3._id,
      type: 'Preventive',
      priority: 'Medium',
      stage: 'In Progress',
      scheduledDate: new Date('2024-12-29'),
      assignedTechnician: tech2._id,
      team: mechanicsTeam._id,
      createdBy: 'Maintenance Manager',
      duration: 2
    });

    await Request.create({
      subject: 'Screen Replacement',
      description: 'Laptop screen is cracked and needs replacement',
      equipment: equipment2._id,
      type: 'Corrective',
      priority: 'Low',
      stage: 'Repaired',
      scheduledDate: new Date('2024-12-26'),
      completedDate: new Date('2024-12-27'),
      assignedTechnician: tech3._id,
      team: itTeam._id,
      createdBy: 'Jane Smith',
      duration: 3
    });

    console.log('✅ Database seeded successfully!');
    console.log('Teams:', await Team.countDocuments());
    console.log('Technicians:', await Technician.countDocuments());
    console.log('Equipment:', await Equipment.countDocuments());
    console.log('Requests:', await Request.countDocuments());
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error); 
  }
};

seedDatabase();

