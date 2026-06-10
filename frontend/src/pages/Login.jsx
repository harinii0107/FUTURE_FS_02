
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [form, setForm] = useState({ username:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      navigate('/dashboard')
    } catch {
      setError('Invalid username or password.')
    } finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoRow}><span style={s.logoIcon}>◈</span><span style={s.logoText}>Mini CRM</span></div>
        <h1 style={s.title}>Welcome back</h1>
        <p style={s.sub}>Sign in to your admin dashboard</p>
        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Username</label>
            <input style={s.input} value={form.username} onChange={e => setForm({...form, username:e.target.value})} required autoFocus />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
          </div>
          {error && <div style={s.error}>{error}</div>}
          <button type="submit" style={s.btn} disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page:{ minHeight:'100vh', background:'#f8f9fb', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,-apple-system,sans-serif' },
  card:{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:'2.5rem', width:'100%', maxWidth:380 },
  logoRow:{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.5rem' },
  logoIcon:{ color:'#534AB7', fontSize:22 },
  logoText:{ fontWeight:600, fontSize:15 },
  title:{ fontSize:22, fontWeight:600, margin:'0 0 6px' },
  sub:{ fontSize:13, color:'#999', margin:'0 0 1.5rem' },
  form:{ display:'flex', flexDirection:'column', gap:'1rem' },
  field:{ display:'flex', flexDirection:'column', gap:6 },
  label:{ fontSize:13, fontWeight:500, color:'#444' },
  input:{ padding:'10px 12px', border:'1px solid #eee', borderRadius:8, fontSize:14, outline:'none', background:'#f8f9fb' },
  error:{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 12px', borderRadius:8, fontSize:13 },
  btn:{ padding:'11px', background:'#534AB7', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', marginTop:4 }
}