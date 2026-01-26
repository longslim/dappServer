const mongoose = require("mongoose")


const adminSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["super_admin", "admin"],
        default: "admin"
    },
    lastLoginAt: {
        type: Date
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeenAt: {
        type: Date
    },
    createdBy:{type: mongoose.Schema.Types.ObjectId, ref: "admin"}
},
    {timestamps: true}

)


const adminModel = mongoose.model("admin", adminSchema)

module.exports = {adminModel}