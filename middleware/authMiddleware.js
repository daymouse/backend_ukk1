import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']

  // Cek apakah header ada dan formatnya benar
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan atau format salah' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verifikasi token dengan secret dari .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // simpan data user di req.user
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Token tidak valid atau sudah kadaluarsa' })
  }
}
