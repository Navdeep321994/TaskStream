const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  stage: { type: String, enum: ['Backlog', 'In Progress', 'Review', 'Done'], default: 'Backlog' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, optimisticConcurrency: true }); // optimisticConcurrency uses __v for versioning

module.exports = mongoose.model('Ticket', ticketSchema);
