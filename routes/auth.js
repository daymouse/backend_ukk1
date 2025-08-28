import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../middleware/authMiddleware.js'
import { supabase } from '../supabaseClient.js'

const router = express.Router()

// REGISTER
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body

   var role = "user"

  // Cek jika field kosong
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Semua field harus diisi' })
  }

  // Cek apakah password & konfirmasi sama
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Ulangi!! Password Berbeda' })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Insert ke Supabase
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, email, password: hashedPassword, role }])

  if (error) return res.status(500).json({ error: error.message })

  res.json({ message: 'Registrasi berhasil', data })
})


// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password harus diisi' })
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) {
    return res.status(401).json({ error: 'Email tidak ditemukan' })
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return res.status(401).json({ error: 'Password salah' })
  }

  // Buat JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  res.json({
    message: 'Login berhasil',
    token, // kirim token ke Flutter
    user: { id: user.id, email: user.email, role: user.role }
  })
})


//PROFILE
router.get('/profile', verifyToken, async (req, res) => {
  const { id } = req.user // dari token

  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, role')
    .eq('id', id)
    .single()

  if (error || !user) {
    return res.status(404).json({ error: 'User tidak ditemukan' })
  }

  res.json({ user })
})

export default router
