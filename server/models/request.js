const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({

  subject: {type: String, required: true, trim: true
  },
  description: {type: String, trim: true
  },

  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },

  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },

  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: true
  },
  // some classification, figure out well
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

  //workflow
  stage: {
    type: String,
    enum: ['New', 'In Progress', 'Repaired', 'Scrap'],
    default: 'New'
  },

  scheduledDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  category: String,
  
  notes: String,
  isOverdue: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

requestSchema.virtual('overdue').get(function() {
  if (this.stage === 'Repaired' || this.stage === 'Scrap') return false;
  return this.scheduledDate < new Date();
});

requestSchema.pre('save', function(next) {
  if (this.stage !== 'Repaired' && this.stage !== 'Scrap') {
    this.isOverdue = this.scheduledDate < new Date();
  } else {
    this.isOverdue = false;
  }
  next();
});

requestSchema.index({ stage: 1, scheduledDate: 1 });
requestSchema.index({ equipment: 1 });
requestSchema.index({ assignedTechnician: 1 });

module.exports = mongoose.model('Request', requestSchema);

