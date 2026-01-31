const jwt = require("jsonwebtoken");
const { adminModel } = require("../models/adminModel");


// async function requireAuth (req, res, next)  {
//     const token = 
//     req.cookies?.signinToken ||
//     req.headers.authorization?.split(" ")[1];

//     if (!token) {return res.status(401).json({ success: false, message: "Unauthorized" })}
  
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET_MESSAGE);
//       const admin = await adminModel.findById(decoded.id)

//     if (!admin) {
//       return res.status(401).json({
//         success: false,
//         message: "Admin not found"
//       })
//     }

//     const now = new Date()

//     if (!admin.lastSeenAt || now - admin.lastSeenAt > 60_000) {
//       admin.lastSeenAt = now
//       admin.isOnline = true
//       await admin.save()
//     }
    

//     req.admin = admin
//     next();
//     } catch {
//       return res.status(401).json({ success: false,  message: "Invalid or expired token" });
//     }
// };




const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_MESSAGE);
    const admin = await adminModel.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    const now = new Date()

    if (!admin.lastSeenAt || now - admin.lastSeenAt > 60_000) {
      admin.lastSeenAt = now
      admin.isOnline = true
      await admin.save()
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}




function requireSuperAdmin  (req, res, next) {
    if(!req.admin) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    if (req.admin.role !== "super_admin") {
      return res.status(403).json({ success: false,  message: "Forbidden: Super admin only" });
    }
    next();
};


module.exports = {requireAuth, requireSuperAdmin}