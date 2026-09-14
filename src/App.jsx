import { createContext, useContext, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
const AuthContext = createContext(null)
const panel = { maxWidth: 1080, margin: '28px auto', padding: 20, fontFamily: 'system-ui, sans-serif' }

async function api(path, options = {}) {
  const response = await fetch(API_URL + path, { credentials: 'include', ...options, headers: options.body ? { 'Content-Type': 'application/json' } : undefined })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || data.errorMsg || 'Request failed')
  return data
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { api('/api/me').then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)) }, [])
  const login = async (email, password) => { await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setUser(await api('/api/me')) }
  const logout = async () => { try { await api('/api/auth/logout') } finally { setUser(null) } }
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

function Login() {
  const { user, login } = useContext(AuthContext); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('')
  if (user) return <Navigate to="/item" replace />
  const submit = async event => { event.preventDefault(); try { setError(''); await login(email, password) } catch (e) { setError(e.message) } }
  return <main style={{ ...panel, maxWidth: 380, marginTop: 90 }}><h1>Inventory Portal</h1><p>Sign in to manage items.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <p role="alert">{error}</p>}<button>Sign in</button></form></main>
}

function Shell({ children }) { const { user, logout } = useContext(AuthContext); const navigate = useNavigate(); return <><header style={{ background: '#172554', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between' }}><strong>Inventory Portal</strong><nav><button onClick={() => navigate('/item')}>Items</button>{user.id === '-1' && <button onClick={() => navigate('/user')}>Users</button>}<button onClick={async () => { await logout(); navigate('/login') }}>Logout</button></nav></header>{children}</> }

function Items() {
  const [items, setItems] = useState([]); const [form, setForm] = useState({ name: '', description: '', quantity: '0', price: '0' }); const [editing, setEditing] = useState(null); const [error, setError] = useState(''); const [message, setMessage] = useState('')
  const load = async () => { try { setItems((await api('/api/item')).items) } catch (e) { setError(e.message) } }
  useEffect(() => { load() }, [])
  const submit = async event => { event.preventDefault(); try { const data = { ...form, quantity: Number(form.quantity), price: Number(form.price) }; await api(editing ? '/api/item/' + editing : '/api/item', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(data) }); setMessage(editing ? 'Item updated.' : 'Item created.'); setEditing(null); setForm({ name: '', description: '', quantity: '0', price: '0' }); load() } catch (e) { setError(e.message) } }
  const edit = item => { setEditing(item._id); setForm({ name: item.name, description: item.description || '', quantity: String(item.quantity), price: String(item.price) }) }
  const remove = async id => { if (!window.confirm('Delete this item?')) return; try { await api('/api/item/' + id, { method: 'DELETE' }); setMessage('Item deleted.'); load() } catch (e) { setError(e.message) } }
  return <main style={panel}><h1>Items</h1><p>All item actions are protected and recorded in the audit log.</p>{error && <p role="alert">{error}</p>}{message && <p>{message}</p>}<form onSubmit={submit}><input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /><input placeholder="Quantity" type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /><input placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /><textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /><button>{editing ? 'Save item' : 'Create item'}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '', quantity: '0', price: '0' }) }}>Cancel</button>}</form><table><thead><tr><th>Name</th><th>Description</th><th>Quantity</th><th>Price</th><th /></tr></thead><tbody>{items.map(item => <tr key={item._id}><td>{item.name}</td><td>{item.description || '—'}</td><td>{item.quantity}</td><td>{'$' + Number(item.price).toFixed(2)}</td><td><button onClick={() => edit(item)}>Edit</button><button onClick={() => remove(item._id)}>Delete</button></td></tr>)}</tbody></table></main>
}

function Users() {
  const [users, setUsers] = useState([]); const [form, setForm] = useState({ username: '', email: '', firstname: '', lastname: '', password: '' }); const [target, setTarget] = useState(null); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [message, setMessage] = useState('')
  const load = async () => { try { setUsers((await api('/api/user')).users) } catch (e) { setError(e.message) } }
  useEffect(() => { load() }, [])
  const create = async event => { event.preventDefault(); try { await api('/api/user', { method: 'POST', body: JSON.stringify(form) }); setForm({ username: '', email: '', firstname: '', lastname: '', password: '' }); setMessage('User created.'); load() } catch (e) { setError(e.message) } }
  const changePassword = async event => { event.preventDefault(); try { await api('/api/user/' + target._id + '/password', { method: 'PUT', body: JSON.stringify({ password }) }); setTarget(null); setPassword(''); setMessage('Password changed successfully.') } catch (e) { setError(e.message) } }
  return <main style={panel}><h1>User management</h1><p>Only the administrator can access this page or change a password.</p>{error && <p role="alert">{error}</p>}{message && <p>{message}</p>}<form onSubmit={create}><input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required /><input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /><input placeholder="First name" value={form.firstname} onChange={e => setForm({ ...form, firstname: e.target.value })} /><input placeholder="Last name" value={form.lastname} onChange={e => setForm({ ...form, lastname: e.target.value })} /><input placeholder="Initial password" type="password" minLength="6" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /><button>Create user</button></form><table><thead><tr><th>Username</th><th>Email</th><th>Name</th><th /></tr></thead><tbody>{users.map(user => <tr key={user._id}><td>{user.username}</td><td>{user.email}</td><td>{[user.firstname, user.lastname].filter(Boolean).join(' ') || '—'}</td><td><button onClick={() => setTarget(user)}>Change password</button></td></tr>)}</tbody></table>{target && <form onSubmit={changePassword}><h2>Change password for {target.username}</h2><input type="password" minLength="6" value={password} onChange={e => setPassword(e.target.value)} required /><button>Save password</button><button type="button" onClick={() => setTarget(null)}>Cancel</button></form>}</main>
}

function Guard({ admin = false, children }) { const { user, loading } = useContext(AuthContext); if (loading) return <p>Loading session…</p>; if (!user) return <Navigate to="/login" replace />; if (admin && user.id !== '-1') return <Navigate to="/item" replace />; return <Shell>{children}</Shell> }

export default function App() { return <BrowserRouter><AuthProvider><Routes><Route path="/login" element={<Login />} /><Route path="/item" element={<Guard><Items /></Guard>} /><Route path="/user" element={<Guard admin><Users /></Guard>} /><Route path="*" element={<Navigate to="/item" replace />} /></Routes></AuthProvider></BrowserRouter> }
