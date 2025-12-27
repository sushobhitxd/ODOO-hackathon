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

    console.log('Database seeded successfully!');
    console.log('Teams:', await Team.countDocuments());
    console.log('Technicians:', await Technician.countDocuments());
    console.log('Equipment:', await Equipment.countDocuments());
    console.log('Requests:', await Request.countDocuments());
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error); 
  }
};

seedDatabase();
