const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,required: true,trim: true
  },
  serialNumber: {
    type: String,required: true,unique: true,trim: true
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
  department: {type: String,
    required: true,
    enum: ['Production', 'IT', 'Warehouse', 'Maintenance', 'Admin', 'Other']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Technician',
    required: true
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
  purchaseDate: {
    type: Date,
    required: true
  },
  warrantyExpiry: {
    type: Date,
    required: true
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

