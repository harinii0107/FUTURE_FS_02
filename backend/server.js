const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

// CORS - Express 5 safe
const allowedOrigins = [
  'http://localhost:5173',
  'https://future-fs-02-flame-six.vercel.app',
  'https://future-fs-02-mlg5rt4xd-harini-s-projects12.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin like curl/postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())

// MongoDB connection
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

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mini CRM Backend API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
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
  try {
    const leads = await Lead.find().sort({ createdAt: -1 })
    res.json(leads)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.patch('/api/leads/:id/status', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    res.json(lead)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/leads/:id/notes', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    lead.notes.push({ text: req.body.text })
    await lead.save()
    res.json(lead)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete('/api/leads/:id', async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id)
    res.json({ message: 'Lead deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Start server + auto-seed admin
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')
    
    // Auto-create default admin if none exists
    const adminExists = await Admin.findOne({ username: 'admin' })
    if (!adminExists) {
      await Admin.create({ username: 'admin', password: 'admin123' })
      console.log('✅ Default admin created: admin / admin123')
    }
    
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  } catch (error) {
    console.error('Failed to start:', error)
    process.exit(1)
  }
}

startServer()