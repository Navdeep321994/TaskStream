const express = require('express');
const Activity = require('../models/Activity');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/:ticketId', authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ ticketId: req.params.ticketId }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
