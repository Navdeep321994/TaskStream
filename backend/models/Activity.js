const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  user: { type: String, required: true },
  action: { type: String, required: true }, // e.g., "moved Ticket-21 from Backlog to Review"
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
