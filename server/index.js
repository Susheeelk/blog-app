import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import cors from 'cors'
import UserRouter from './routes/user.route.js'
import blogRoute from './routes/blog.route.js'
import commentRoute from './routes/comment.route.js'
import connectDB from './database/db.js'
dotenv.config()

const app = express()


// meddlewere here
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "https://blog-app-delta-taupe.vercel.app/",
    credentials: true
}))
// app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5001
// get route here
app.get('/', (req, res) => {
    res.send({ msg: 'jai shree krisna...' })
})

// al route define here
app.use('/api/v1/user', UserRouter)
app.use("/api/v1/blog", blogRoute)
app.use("/api/v1/comment", commentRoute)



app.listen(PORT, () => {
    console.log(`app running on http://localhost:${PORT}`)
    connectDB()
})