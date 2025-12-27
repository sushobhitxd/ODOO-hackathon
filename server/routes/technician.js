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

