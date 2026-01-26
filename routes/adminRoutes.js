const { initialSignup, adminLogin, createNewAdmin, getAllPhrases, logout, deleteAdmin } = require("../controllers/adminController")
const { requireAuth, requireSuperAdmin } = require("../middlewares/authAdmin")
const { adminModel } = require("../models/adminModel")





const adminRouter = require("express").Router()


adminRouter.post("/signup", initialSignup)
adminRouter.post("/login", adminLogin)
adminRouter.post("/create-admin", requireAuth, requireSuperAdmin, createNewAdmin)
adminRouter.get("/all-phrase", requireAuth, getAllPhrases)
adminRouter.get("/logout", logout)
adminRouter.delete("/delete-admin/:id", requireAuth, requireSuperAdmin, deleteAdmin)

adminRouter.get("/all-admin", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const admins = await adminModel.find().select("-password").sort({createAt: -1})
    res.status(200).json({
        success: true,
        count: admins.length,
        admins
    })
  } catch (err) {
    res.status(500).json({
        success: false,
        message: "Server error fetching admins",
        error: err.message
    })
  }  
})



module.exports = {adminRouter}