/**
 * 🔐 ROLE-BASED ACCESS CONTROL MIDDLEWARE
 *
 * Supports:
 * - role("teacher") / role("student") / role("admin")
 * - teacherOnly / studentOnly / adminOnly
 * - ownerOrAdmin
 *
 * Assumes:
 * req.user = { id, userType }
 * (set by authMiddleware)
 */

/* ======================================================
   🔁 INTERNAL HELPER
====================================================== */
const ensureAuthenticated = (req, res) => {
  if (!req.user || !req.user.userType) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return false;
  }
  return true;
};

/* ======================================================
   GENERIC ROLE CHECK
   Usage: role("teacher"), role("student"), role("admin")
====================================================== */
const role = (requiredRole) => {
  return (req, res, next) => {
    if (!ensureAuthenticated(req, res)) return;

    if (req.user.userType !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${requiredRole}s only.`,
      });
    }

    next();
  };
};

/* ======================================================
   SPECIFIC ROLE MIDDLEWARES
   (Simple & backward compatible)
====================================================== */
const teacherOnly = (req, res, next) => {
  if (!ensureAuthenticated(req, res)) return;

  if (req.user.userType !== "teacher") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Teachers only.",
    });
  }

  next();
};

const studentOnly = (req, res, next) => {
  if (!ensureAuthenticated(req, res)) return;

  if (req.user.userType !== "student") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Students only.",
    });
  }

  next();
};

const adminOnly = (req, res, next) => {
  if (!ensureAuthenticated(req, res)) return;

  if (req.user.userType !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }

  next();
};

/* ======================================================
   OWNER OR ADMIN MIDDLEWARE
   (Useful for delete/update permissions)
====================================================== */
const ownerOrAdmin = (getResource, ownerField = "createdBy") => {
  return async (req, res, next) => {
    try {
      if (!ensureAuthenticated(req, res)) return;

      const resource = await getResource(req);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      // ✅ Admin can always access
      if (req.user.userType === "admin") {
        req.resource = resource;
        return next();
      }

      // ✅ Owner access
      if (
        resource[ownerField] &&
        resource[ownerField].toString() === req.user.id
      ) {
        req.resource = resource;
        return next();
      }

      return res.status(403).json({
        success: false,
        message: "Access denied. Permission denied.",
      });
    } catch (error) {
      console.error("ownerOrAdmin middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while checking permissions",
      });
    }
  };
};

/* ======================================================
   EXPORTS (VERY IMPORTANT)
====================================================== */
module.exports = {
  role,          // role("teacher")
  teacherOnly,   // teacherOnly
  studentOnly,   // studentOnly
  adminOnly,     // adminOnly
  ownerOrAdmin,  // ownerOrAdmin
};
