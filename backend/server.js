const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

// Middleware - MUST be before routes
app.use(cors()) 
app.use(express.json())

// MongoDB connection
mongoose.set('bufferCommands', false)
mongoose.set('strictQuery', false)

mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'))
mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err))

// Schemas
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

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String
})
const Admin = mongoose.model('Admin', adminSchema)

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mini CRM Backend API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`
  });
});

// Auth Routes
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const admin = await Admin.findOne({ username })
    
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    res.json({ 
      token: 'fake-jwt-token-123', 
      message: 'Login successful' 
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Lead Routes
app.post('/api/leads/submit', async (req, res) => {
  try {
    const lead = new Lead(req.body)
    await lead.save()
    res.status(201).json({ message: 'Lead created', lead })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/leads', async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 })
  res.json(leads)
})

app.patch('/api/leads/:id/status', async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
  res.json(lead)
})

app.post('/api/leads/:id/notes', async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  lead.notes.push({ text: req.body.text })
  await lead.save()
  res.json(lead)
})

app.delete('/api/leads/:id', async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id)
  res.json({ message: 'Lead deleted' })
})

// Start server only after DB connects
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  } catch (error) {
    console.error('Failed to start:', error)
    process.exit(1)
  }
}

startServer()
