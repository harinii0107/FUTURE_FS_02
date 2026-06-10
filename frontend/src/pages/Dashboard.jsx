import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }
    fetchLeads()
  }, [navigate])

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads')
      setLeads(res.data)
    } catch (err) {
      console.error('Failed to fetch leads:', err)
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/')
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const updateStatus = async (id, status) => {
    await api.patch(`/leads/${id}/status`, { status })
    const res = await api.get('/leads')
    setLeads(res.data)
    setSelected(res.data.find(l => l._id === id))
  }

  const addNote = async (id) => {
    if (!note.trim()) return
    await api.post(`/leads/${id}/notes`, { text: note })
    setNote('')
    const res = await api.get('/leads')
    setLeads(res.data)
    setSelected(res.data.find(l => l._id === id))
  }

  const deleteLead = async (id) => {
    await api.delete(`/leads/${id}`)
    setSelected(null)
    fetchLeads()
  }

  const statusColor = {
    new: '#3b82f6',
    contacted: '#eab308',
    qualified: '#22c55e',
    lost: '#ef4444'
  }

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <h1 style={s.h1}>📋 Lead Dashboard</h1>
        <button onClick={logout} style={s.logoutBtn}>Logout</button>
      </header>

      <div style={s.grid}>
        <div style={s.list}>
          <h3 style={s.h3}>Leads ({leads.length})</h3>
          {leads.length === 0? (
            <p style={s.empty}>No leads found.</p>
          ) : (
            leads.map(lead => (
              <div
                key={lead._id}
                style={{...s.card, borderColor: selected?._id === lead._id? '#6366f1' : '#334155'}}
                onClick={() => setSelected(lead)}
              >
                <div style={s.cardTop}>
                  <strong>{lead.name}</strong>
                  <span style={{...s.badge, background: statusColor[lead.status]}}>{lead.status}</span>
                </div>
                <div style={s.meta}>{lead.email} · {lead.source}</div>
              </div>
            ))
          )}
        </div>

        <div style={s.detail}>
          {!selected? (
            <p style={s.empty}>Select a lead to view details</p>
          ) : (
            <>
              <h2 style={s.h2}>{selected.name}</h2>
              <p style={s.detailMeta}>{selected.email} · {selected.phone}</p>
              <p style={s.detailMeta}>Source: {selected.source}</p>

              <div style={s.btnRow}>
                {['new','contacted','qualified','lost'].map(st => (
                  <button
                    key={st}
                    onClick={() => updateStatus(selected._id, st)}
                    style={{...s.statusBtn, background: selected.status === st? statusColor[st] : '#334155'}}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div style={s.notes}>
                <h4 style={s.h4}>Notes</h4>
                <div style={s.noteInput}>
                  <input
                    style={s.input}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add a note..."
                    onKeyDown={e => e.key === 'Enter' && addNote(selected._id)}
                  />
                  <button onClick={() => addNote(selected._id)} style={s.addBtn}>Add</button>
                </div>
                {selected.notes?.slice().reverse().map((n,i) => (
                  <div key={i} style={s.noteItem}>
                    <div>{n.text}</div>
                    <div style={s.noteDate}>{new Date(n.date).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => deleteLead(selected._id)} style={s.deleteBtn}>🗑 Delete Lead</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#1e293b', borderBottom: '1px solid #334155' },
  h1: { margin: 0, fontSize: '1.5rem' },
  logoutBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1rem', padding: '1rem', height: 'calc(100vh - 73px)' },
  list: { background: '#1e293b', borderRadius: '8px', padding: '1rem', overflowY: 'auto' },
  h3: { margin: '0 0 1rem 0', color: '#cbd5e1' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: '2rem' },
  card: { background: '#0f172a', border: '2px solid #334155', borderRadius: '8px', padding: '12px', marginBottom: '8px', cursor: 'pointer' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  badge: { fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', color: 'white', textTransform: 'capitalize' },
  meta: { fontSize: '0.85rem', color: '#94a3b8' },
  detail: { background: '#1e293b', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto' },
  h2: { margin: '0 0 8px 0' },
  detailMeta: { color: '#94a3b8', margin: '4px 0' },
  btnRow: { display: 'flex', gap: '8px', margin: '1.5rem 0' },
  statusBtn: { flex: 1, padding: '8px', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', textTransform: 'capitalize' },
  notes: { marginTop: '2rem' },
  h4: { margin: '0 0 12px 0', color: '#cbd5e1' },
  noteInput: { display: 'flex', gap: '8px', marginBottom: '1rem' },
  input: { flex: 1, padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc' },
  addBtn: { padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  noteItem: { background: '#0f172a', padding: '10px', borderRadius: '6px', marginBottom: '8px' },
  noteDate: { fontSize: '0.75rem', color: '#64748b', marginTop: '4px' },
  deleteBtn: { marginTop: '2rem', width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
}