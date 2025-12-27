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

