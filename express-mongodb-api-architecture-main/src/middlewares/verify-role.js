const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.decoded.role; 
      if (!allowedRoles.includes(userRole)) {
       return  res.status(403).json({ message: 'Access denied. You do not have the required role.' });
        
      }
      next(); 

    };
  };
  
  module.exports = verifyRole;
  