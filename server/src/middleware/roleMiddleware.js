/**
 * Enforces role-based authorization based on authenticated database user.
 * Never trusts role values sent by frontend requests.
 *
 * @param {'FARMER' | 'CONSUMER'} allowedRole
 */
export function requireRole(allowedRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${allowedRole.toLowerCase()} accounts only.`
      });
    }

    next();
  };
}
