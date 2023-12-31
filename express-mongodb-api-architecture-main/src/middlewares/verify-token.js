const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  if (token) {
    let checkBearer = 'Bearer ';
    if (token.startsWith(checkBearer)) {
      token = token.slice(checkBearer.length, token.length);
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        console.error('Error verifying token:', err);
        res.status(403).json({
          success: false,
          message: 'Failed to authenticate',
        });
      } else {
        req.decoded = decoded; // decoded is simply user {}
        console.log('Decoded Token:', decoded);
        next();
      }
    });
  } else {
    res.status(403).json({
      success: false,
      message: 'No token provided',
    });
  }
};
