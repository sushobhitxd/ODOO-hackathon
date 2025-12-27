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
