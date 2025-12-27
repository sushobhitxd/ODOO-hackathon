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
