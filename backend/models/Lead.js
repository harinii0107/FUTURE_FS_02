const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  phone:   { type: String },
  source:  { type: String, default: 'Website' }, // e.g. Website, Referral, Social
  status:  { 
    type: String, 
    enum: ['new', 'contacted', 'converted', 'lost'],
    default: 'new' 
  },
  notes:   [{ 
    text: String, 
    createdAt: { type: Date, default: Date.now } 
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);