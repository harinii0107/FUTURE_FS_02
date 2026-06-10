import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const statusColor = { new:'#185FA5', contacted:'#854F0B', converted:'#3B6D11', lost:'#A32D2D' }
const statusBg = { new:'#E6F1FB', contacted:'#FAEEDA', converted:'#EAF3DE', lost:'#FCEBEB' }

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/'); return }
    fetchLeads()
  }, [navigate])

  const fetchLeads = async (s=search, f=filter) => {
    try {
      const params = {}
      if (s) params.search = s
      if (f!== 'all') params.status = f
      const res = await api.get('/leads', { params })
      setLeads(res.data)
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('token'); navigate('/') }
    }
  }

  const logout = () => { localStorage.removeItem('token'); navigate('/') }

  const updateStatus = async (id, status) => {
    await api.patch(`/leads/${id}/status`, { status })
    fetchLeads()
    const res = await api.get('/leads')
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
    if (!window.confirm('Delete this lead?')) return
    await api.delete(`/leads/${id}`)
    setSelected(null); fetchLeads()
  }

  const handleSearch = e => { setSearch(e.target.value); fetchLeads(e.target.value, filter) }
  const handleFilter = f => { setFilter(f); fetchLeads(search, f) }

  return (
    <div style={s.app}>
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <span style={s.logoIcon}>◈</span> Mini CRM
        </div>
        <nav style={s.nav}>
          <div style={{...s.navItem,...s.navActive}}>
            <span style={s.navIcon}>⊞</span> Leads
          </div>
          <div style={s.navItem} onClick={() => navigate('/contact')} >
            <span style={s.navIcon}>⊡</span> Contact form
          </div>
        </nav>
        <div style={s.navItem} onClick={logout}>
          <span style={s.navIcon}>⇥</span> Sign out
        </div>
      </aside>

      <div style={s.main}>
        <div style={s.topbar}>
          <span style={s.topbarTitle}>Lead management</span>
          <span style={s.topbarSub}>{leads.length} lead{leads.length!== 1? 's' : ''}</span>
        </div>

        <div style={s.content}>
          <div style={s.toolbar}>
            <input
              style={s.search}
              placeholder="Search by name, email, source…"
              value={search}
              onChange={handleSearch}
            />
            <div style={s.filters}>
              {['all','new','contacted','converted','lost'].map(f => (
                <button
                  key={f}
                  onClick={() => handleFilter(f)}
                  style={{...s.filterBtn,...(filter === f? s.filterActive : {}) }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={s.grid}>
            <div style={s.listCol}>
              {leads.length === 0? (
                <div style={s.empty}>No leads found.</div>
              ) : leads.map(lead => (
                <div
                  key={lead._id}
                  onClick={() => setSelected(lead)}
                  style={{...s.card,...(selected?._id === lead._id? s.cardSelected : {}) }}
                >
                  <div style={s.cardTop}>
                    <span style={s.cardName}>{lead.name}</span>
                    <span style={{...s.badge, background: statusBg[lead.status], color: statusColor[lead.status] }}>
                      {lead.status}
                    </span>
                  </div>
                  <div style={s.cardMeta}>{lead.email} · {lead.source}</div>
                  <div style={s.cardDate}>{new Date(lead.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                  {lead.notes?.length > 0 && (
                    <div style={s.cardNote}>"{lead.notes[lead.notes.length-1].text}"</div>
                  )}
                </div>
              ))}
            </div>

            <div style={s.detailCol}>
              {!selected? (
                <div style={s.emptyDetail}>
                  <div style={s.emptyIcon}>⊡</div>
                  <p>Select a lead to view details</p>
                </div>
              ) : (
                <div style={s.detail}>
                  <div style={s.detailHeader}>
                    <div style={s.avatar}>{selected.name.charAt(0)}</div>
                    <div>
                      <h2 style={s.detailName}>{selected.name}</h2>
                      <p style={s.detailSub}>{selected.source}</p>
                    </div>
                    <span style={{...s.badge, background: statusBg[selected.status], color: statusColor[selected.status], marginLeft:'auto' }}>
                      {selected.status}
                    </span>
                  </div>

                  <div style={s.detailFields}>
                    <div style={s.field}><span style={s.fieldLabel}>Email</span><span style={s.fieldVal}>{selected.email}</span></div>
                    <div style={s.field}><span style={s.fieldLabel}>Phone</span><span style={s.fieldVal}>{selected.phone || '—'}</span></div>
                    <div style={s.field}><span style={s.fieldLabel}>Added</span><span style={s.fieldVal}>{new Date(selected.createdAt).toLocaleString()}</span></div>
                  </div>

                  <div style={s.section}>
                    <p style={s.sectionLabel}>Update status</p>
                    <div style={s.statusRow}>
                      {['new','contacted','converted','lost'].map(st => (
                        <button
                          key={st}
                          onClick={() => updateStatus(selected._id, st)}
                          style={{...s.statusBtn, background: selected.status === st? statusBg[st] : 'transparent', color: selected.status === st? statusColor[st] : '#888', borderColor: selected.status === st? statusColor[st] : '#ddd' }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={s.section}>
                    <p style={s.sectionLabel}>Follow-up notes</p>
                    <div style={s.noteInput}>
                      <input
                        style={s.noteField}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Add a note…"
                        onKeyDown={e => e.key === 'Enter' && addNote(selected._id)}
                      />
                      <button onClick={() => addNote(selected._id)} style={s.addBtn}>Add</button>
                    </div>
                    {selected.notes?.length === 0 && <p style={s.emptyNotes}>No notes yet.</p>}
                    {selected.notes?.slice().reverse().map((n, i) => (
                      <div key={i} style={s.noteItem}>
                        <p style={s.noteText}>{n.text}</p>
                        <p style={s.noteDate}>{new Date(n.createdAt || n.date).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => deleteLead(selected._id)} style={s.deleteBtn}>Delete lead</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  app:{ display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'100vh', fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fb', color:'#1a1a1a' },
  sidebar:{ background:'#fff', borderRight:'1px solid #f0f0f0', padding:'1.5rem 1rem', display:'flex', flexDirection:'column', gap:2 },
  logo:{ fontSize:15, fontWeight:600, padding:'0 8px', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:8, color:'#1a1a1a' },
  logoIcon:{ color:'#534AB7', fontSize:18 },
  nav:{ display:'flex', flexDirection:'column', gap:2, flex:1 },
  navItem:{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, fontSize:13, color:'#666', cursor:'pointer' },
  navActive:{ background:'#EEEDFE', color:'#534AB7', fontWeight:500 },
  navIcon:{ fontSize:16 },
  main:{ display:'flex', flexDirection:'column', minHeight:'100vh' },
  topbar:{ background:'#fff', borderBottom:'1px solid #f0f0f0', padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:12 },
  topbarTitle:{ fontSize:15, fontWeight:600 },
  topbarSub:{ fontSize:13, color:'#999' },
  content:{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' },
  toolbar:{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' },
  search:{ flex:1, minWidth:200, padding:'8px 12px', border:'1px solid #eee', borderRadius:8, background:'#fff', fontSize:13, outline:'none' },
  filters:{ display:'flex', gap:6 },
  filterBtn:{ padding:'6px 12px', borderRadius:20, fontSize:12, border:'1px solid #eee', background:'#fff', color:'#666', cursor:'pointer' },
  filterActive:{ background:'#EEEDFE', color:'#534AB7', borderColor:'#AFA9EC' },
  grid:{ display:'grid', gridTemplateColumns:'360px 1fr', gap:'1rem', alignItems:'start' },
  listCol:{ display:'flex', flexDirection:'column', gap:8 },
  card:{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:10, padding:'1rem', cursor:'pointer', transition:'border-color 0.15s' },
  cardSelected:{ borderColor:'#534AB7', borderWidth:1.5 },
  cardTop:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  cardName:{ fontSize:14, fontWeight:500 },
  badge:{ fontSize:11, padding:'3px 8px', borderRadius:20, fontWeight:500 },
  cardMeta:{ fontSize:12, color:'#999' },
  cardDate:{ fontSize:11, color:'#bbb', marginTop:4 },
  cardNote:{ fontSize:12, color:'#aaa', marginTop:6, fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  empty:{ textAlign:'center', color:'#bbb', padding:'3rem', fontSize:14 },
  emptyDetail:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, color:'#bbb', gap:12 },
  emptyIcon:{ fontSize:40 },
  detail:{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:12, padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' },
  detailHeader:{ display:'flex', alignItems:'center', gap:12 },
  avatar:{ width:44, height:44, borderRadius:'50%', background:'#EEEDFE', color:'#534AB7', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:18, flexShrink:0 },
  detailName:{ fontSize:16, fontWeight:600, margin:0 },
  detailSub:{ fontSize:12, color:'#999', margin:0 },
  detailFields:{ display:'flex', flexDirection:'column', gap:8, borderTop:'1px solid #f5f5f5', paddingTop:'1rem' },
  field:{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 },
  fieldLabel:{ color:'#999' },
  fieldVal:{ color:'#1a1a1a', fontWeight:500 },
  section:{ borderTop:'1px solid #f5f5f5', paddingTop:'1rem' },
  sectionLabel:{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.5px', color:'#bbb', marginBottom:10 },
  statusRow:{ display:'flex', gap:8 },
  statusBtn:{ flex:1, padding:'7px 0', borderRadius:8, fontSize:12, border:'1px solid', cursor:'pointer', fontWeight:500, transition:'all 0.15s' },
  noteInput:{ display:'flex', gap:8, marginBottom:10 },
  noteField:{ flex:1, padding:'8px 12px', border:'1px solid #eee', borderRadius:8, fontSize:13, outline:'none', background:'#f8f9fb' },
  addBtn:{ padding:'8px 16px', background:'#534AB7', color:'#fff', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:500 },
  emptyNotes:{ fontSize:13, color:'#bbb' },
  noteItem:{ background:'#f8f9fb', borderRadius:8, padding:'10px 12px', marginBottom:8 },
  noteText:{ fontSize:13, margin:0, marginBottom:4 },
  noteDate:{ fontSize:11, color:'#bbb', margin:0 },
  deleteBtn:{ padding:'10px', background:'#fff', color:'#A32D2D', border:'1px solid #F7C1C1', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:500, marginTop:'0.5rem' }
}
