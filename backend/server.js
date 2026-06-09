const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors') // Add this line
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
app.use(cors()) // Add this line - MUST be before routes
app.use(express.json())

// MongoDB connection
mongoose.set('bufferCommands', false)
mongoose.set('strictQuery', false)

mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'))
mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err))

// Lead Schema
const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  source: String,
  status: { type: String, default: 'new', enum: ['new', 'contacted', 'converted', 'lost'] },
  notes: [{ text: String, createdAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now }
})
const Lead = mongoose.model('Lead', leadSchema)
// Admin Schema - add this after leadSchema
const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String
})
const Admin = mongoose.model('Admin', adminSchema)

// Auth Routes - add these before your lead routes

// Register admin - run once to create your account
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body
    const exists = await Admin.findOne({ username })
    if (exists) return res.status(400).json({ message: 'Username taken' })
    
    const admin = new Admin({ username, password })
    await admin.save()
    res.json({ message: 'Admin created' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const admin = await Admin.findOne({ username })
    
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Simple token for now. Use JWT in production
    res.json({ 
      token: 'fake-jwt-token-123', 
      message: 'Login successful' 
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Route 1: Submit a new lead - this is Step 24
app.post('/api/leads/submit', async (req, res) => {
  try {
    const lead = new Lead(req.body)
    await lead.save()
    res.status(201).json({ message: 'Lead created', lead })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Route 2: Get all leads - for Dashboard
app.get('/api/leads', async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 })
  res.json(leads)
})

// Route 3: Update status
app.patch('/api/leads/:id/status', async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
  res.json(lead)
})

// Route 4: Add note
app.post('/api/leads/:id/notes', async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  lead.notes.push({ text: req.body.text })
  await lead.save()
  res.json(lead)
})

// Route 5: Delete lead
app.delete('/api/leads/:id', async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id)
  res.json({ message: 'Lead deleted' })
})

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
  } catch (error) {
    console.error('Failed to start:', error)
    process.exit(1)
  }
}

startServer()