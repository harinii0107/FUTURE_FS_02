import { useState } from 'react'
import api from '../api'

export default function ContactForm() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', source:'Website', message:'' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await api.post('/leads/submit', form); setSubmitted(true) }
    catch { alert('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  if (submitted) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.successIcon}>✓</div>
        <h2 style={s.title}>Message received</h2>
        <p style={s.sub}>Thank you for reaching out. We'll get back to you within 24 hours.</p>
        <button style={s.btn} onClick={() => setSubmitted(false)}>Send another</button>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoRow}><span style={s.logoIcon}>◈</span><span style={s.logoText}>Mini CRM</span></div>
        <h1 style={s.title}>Get in touch</h1>
        <p style={s.sub}>Fill out the form and we'll be in touch shortly.</p>
        <form onSubmit={handleSubmit} style={s.form}>
          {[
            { key:'name', label:'Full name', type:'text', required:true },
            { key:'email', label:'Email address', type:'email', required:true },
            { key:'phone', label:'Phone number', type:'tel' },
          ].map(({ key, label, type, required }) => (
            <div key={key} style={s.field}>
              <label style={s.label}>{label}{required && <span style={s.req}> *</span>}</label>
              <input style={s.input} type={type} required={required} value={form[key]} onChange={e => setForm({...form, [key]:e.target.value})} />
            </div>
          ))}
          <div style={s.field}>
            <label style={s.label}>How did you find us?</label>
            <select style={s.input} value={form.source} onChange={e => setForm({...form, source:e.target.value})}>
              {['Website','Referral','Social Media','Google','Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Message</label>
            <textarea style={{...s.input, height:100, resize:'vertical'}} value={form.message} onChange={e => setForm({...form, message:e.target.value})} placeholder="Tell us about your project…" />
          </div>
          <button type="submit" style={s.btn} disabled={loading}>{loading ? 'Sending…' : 'Send message'}</button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page:{ minHeight:'100vh', background:'#f8f9fb', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', fontFamily:'system-ui,-apple-system,sans-serif' },
  card:{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:'2.5rem', width:'100%', maxWidth:460 },
  logoRow:{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.5rem' },
  logoIcon:{ color:'#534AB7', fontSize:22 },
  logoText:{ fontWeight:600, fontSize:15 },
  title:{ fontSize:22, fontWeight:600, margin:'0 0 6px' },
  sub:{ fontSize:13, color:'#999', margin:'0 0 1.5rem' },
  form:{ display:'flex', flexDirection:'column', gap:'1rem' },
  field:{ display:'flex', flexDirection:'column', gap:6 },
  label:{ fontSize:13, fontWeight:500, color:'#444' },
  req:{ color:'#A32D2D' },
  input:{ padding:'10px 12px', border:'1px solid #eee', borderRadius:8, fontSize:14, outline:'none', background:'#f8f9fb', width:'100%', boxSizing:'border-box' },
  btn:{ padding:'11px', background:'#534AB7', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', marginTop:4 },
  successIcon:{ width:56, height:56, background:'#EAF3DE', color:'#3B6D11', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:600, margin:'0 auto 1.5rem' },
}