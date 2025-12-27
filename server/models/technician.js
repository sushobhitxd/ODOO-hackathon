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
  password: { // just added
    type: String,
    required: true
  },

  role:{
    type:String,
    enum: ['Employee', 'Technician'],
    default: 'Employee'
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
