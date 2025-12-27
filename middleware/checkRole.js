
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Unauthorized: User not identified' });
    }

    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = checkRole;