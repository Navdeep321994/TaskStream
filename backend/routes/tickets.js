const express = require('express');
const Ticket = require('../models/Ticket');
const Activity = require('../models/Activity');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all tickets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('createdBy', 'username').populate('assignedTo', 'username');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create ticket
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, stage, assignedTo } = req.body;
    
    const ticket = new Ticket({
      title,
      description,
      priority,
      stage,
      assignedTo: assignedTo || null,
      createdBy: req.user.id
    });

    await ticket.save();
    
    const activity = new Activity({
      ticketId: ticket._id,
      user: req.user.username,
      action: `created the ticket in ${ticket.stage}`
    });
    await activity.save();

    const populatedTicket = await Ticket.findById(ticket._id).populate('createdBy', 'username').populate('assignedTo', 'username');

    // Emit event
    req.io.emit('ticketCreated', populatedTicket);

    res.status(201).json(populatedTicket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update ticket
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { __v, ...updates } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Concurrent Update Handling using version check
    if (__v !== undefined && ticket.__v !== __v) {
      return res.status(409).json({ 
        message: 'This ticket was modified by another user. Please refresh and try again.',
        currentTicket: ticket
      });
    }

    const oldStage = ticket.stage;
    const oldPriority = ticket.priority;

    Object.assign(ticket, updates);
    await ticket.save();

    let actionMsg = [];
    if (updates.stage && updates.stage !== oldStage) {
      actionMsg.push(`moved ticket from ${oldStage} to ${updates.stage}`);
    }
    if (updates.priority && updates.priority !== oldPriority) {
      actionMsg.push(`changed priority ${oldPriority} -> ${updates.priority}`);
    }
    if (updates.title && updates.title !== ticket.title) {
      actionMsg.push(`updated title`);
    }
    if (updates.description && updates.description !== ticket.description) {
      actionMsg.push(`updated description`);
    }

    if (actionMsg.length > 0) {
      const activity = new Activity({
        ticketId: ticket._id,
        user: req.user.username,
        action: actionMsg.join(', ')
      });
      await activity.save();
    }

    const populatedTicket = await Ticket.findById(ticket._id).populate('createdBy', 'username').populate('assignedTo', 'username');

    req.io.emit('ticketUpdated', populatedTicket);

    res.json(populatedTicket);
  } catch (error) {
    if (error.name === 'VersionError') {
      return res.status(409).json({ message: 'This ticket was modified by another user. Please refresh and try again.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete ticket
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    await Activity.deleteMany({ ticketId: req.params.id });

    req.io.emit('ticketDeleted', req.params.id);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
