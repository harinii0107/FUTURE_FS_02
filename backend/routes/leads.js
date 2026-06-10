
const express = require('express')
const router = express.Router()
const Lead = require('../models/Lead')
const auth = require('../middleware/auth')

// GET /api/leads - Get all leads. Protected, only for logged-in dashboard
router.get('/leads', auth, async (req, res) => {
  try {
    const { search, status } = req.query
    let query = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    const leads = await Lead.find(query).sort({ createdAt: -1 })
    res.json(leads)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/leads - Create lead from contact form. PUBLIC, no auth needed
router.post('/leads', async (req, res) => {
  try {
    const { name, email, phone, source, message } = req.body
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }

    const lead = new Lead({
      name,
      email,
      phone: phone || '',
      source: source || 'Website',
      message: message || '',
      status: 'new'
    })
    
    await lead.save()
    res.status(201).json(lead)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/leads/:id/status - Update status. Protected
router.patch('/leads/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body
    const lead = await Lead.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    )
    res.json(lead)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/leads/:id/notes - Add note. Protected
router.post('/leads/:id/notes', auth, async (req, res) => {
  try {
    const { text } = req.body
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text, createdAt: new Date() } } },
      { new: true }
    )
    res.json(lead)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/leads/:id - Delete lead. Protected
router.delete('/leads/:id', auth, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id)
    res.json({ message: 'Lead deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router