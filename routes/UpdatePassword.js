import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../middleware/authMiddleware.js'
import { supabase } from '../supabaseClient.js'

const router = express.Router()

router.post('/cekpassword', verifyToken, async (req, res) => {
  const { id } = req.user;
  const { PasswordLama } = req.body;

  try {
    // Ambil password dari database
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', id)
      .single();

    if (fetchError || !data) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    // Bandingkan password lama
    const isPasswordValid = await bcrypt.compare(PasswordLama, data.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password lama salah.' });
    }

    return res.status(200).json({ message: 'Password lama benar.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

router.post('/gantipassword', verifyToken, async (req, res) => {
  const { id } = req.user;
  const { PasswordBaru, KonfirmasiPassword } = req.body;


  if (PasswordBaru !== KonfirmasiPassword){
    return res.status(400).json({ error: 'Ulangi!! Password Berbeda' })
  }
  
  try {
    // Hash password baru
    const hashedPassword = await bcrypt.hash(PasswordBaru, 10);

    // Update password di database
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ message: 'Gagal mengupdate password.' });
    }

    return res.status(200).json({ message: 'Password berhasil diperbarui.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});
export default router;
