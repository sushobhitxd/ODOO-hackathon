
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique:true,
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
  
  members:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
