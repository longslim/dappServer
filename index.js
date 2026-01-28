const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const bodyParser = require("body-parser")
const { connectDB } = require("./database/database")
const { adminRouter } = require("./routes/adminRoutes")
const { dataRouter } = require("./routes/dataRoutes")
const { adminModel } = require("./models/adminModel")



require("dotenv").config()

const app = express()
app.set("trust proxy", 1)
const port = process.env.PORT || 8080
const corsOptions = {
    origin: "https://dapp-client-green.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    optionsSuccessStatus: 204,
}


app.use(cors(corsOptions))
// app.options(/.*/, cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(bodyParser.json())
app.use("/uploads", express.static("uploads"))


app.use("/api/v1",adminRouter, dataRouter)


app.get("/", (req,res) => {
    res.send("✅ API is running")
})






async function server() {
    await connectDB()
    setInterval(async () => {
        try {
            const fiveMinutesAgo = new Date(Date.now() -5 * 60 * 1000)

            await adminModel.updateMany(
                {lastSeenAt: {$lt: fiveMinutesAgo}, isOnline: true},
                {isOnline: false}
            )
        } catch (err) {
            console.error("Presence cleanup error:", err.message)
        }
    }, 60 * 1000)
    app.listen(port, () => console.log(`server is running on port ${port}`))
}

server()