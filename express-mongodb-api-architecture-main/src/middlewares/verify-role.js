module.exports = function verifyRole(allowedRoles) {
  return function (req, res, next) {
    try {
      const userRole = req.decoded.role;
      console.log('User Role:', userRole); // For debugging

      if (!allowedRoles.includes(userRole)) {
        console.log('Access denied. Required roles:', allowedRoles);
        return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
      }

      console.log('Access granted');
      next();
    } catch (error) {
      console.error('Error verifying user role:', error);
      res.status(500).json({ error: 'An error occurred while verifying user role.' });
    }
  };
};
