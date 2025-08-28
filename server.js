import express from 'express'
import router from './routes/auth.js'
import Newpassword from './routes/UpdatePassword.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express()

// Middleware untuk parsing JSON
app.use(express.json())

// Jika ingin mendukung form-urlencoded juga:
app.use(express.urlencoded({ extended: true }))

// Gunakan router
app.use('/auth', router)
app.use('/Password', Newpassword)

app.listen(3000, '0.0.0.0', () => {
  console.log("Server running on port 3000")
});
