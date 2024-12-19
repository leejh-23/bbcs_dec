const model = require("../models/usersModel"); 

//////////////////////////////////////////////////////
// REQUIRE DOTENV MODULE
//////////////////////////////////////////////////////
require("dotenv").config();

//////////////////////////////////////////////////////
// REQUIRE JWT MODULE
//////////////////////////////////////////////////////
const jwt = require("jsonwebtoken");


//////////////////////////////////////////////////////
// SET JWT CONFIGURATION
//////////////////////////////////////////////////////
const secretKey = process.env.JWT_SECRET_KEY;
const tokenDuration = process.env.JWT_EXPIRES_IN;
const tokenAlgorithm = process.env.JWT_ALGORITHM;

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR GENERATING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.generateToken = (req, res, next) => {
    var payload = {
      userId: res.locals.userId,
      timestamp: new Date()
    }; 

  const options = {
    algorithm: tokenAlgorithm,
    expiresIn: tokenDuration
  };

  const token = jwt.sign(payload, secretKey, options);  
  const refreshToken = jwt.sign(payload, secretKey, {expiresIn: '1d'});  

  const data = {
    refreshToken: refreshToken,
    userId: res.locals.userId
  }

  const storeRefreshCallback = (error, results, fields) => {
    if (error) {
      console.error("Error storing refresh token:", error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.locals.token = token;
    res.locals.refreshToken = refreshToken;
    res.locals.message = "Logged in successfully."
    next();
  };

  // store refreshtoken in the database
  model.storeRefreshToken(data, storeRefreshCallback);
};

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR SENDING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.sendToken = (req, res, next) => {
    if (res.locals.register == true) { // user is registering
        res.status(200).json({
          message: `User ${res.locals.username} created successfully.`,
          token: res.locals.token,
          refreshToken: res.locals.refreshToken
        });
      }
      else { // user is logging in 
        res.status(200).json({ 
          message: res.locals.message,
          token: res.locals.token,
          refreshToken: res.locals.refreshToken
        });
    }
};

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR VERIFYING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // bearer means the user is the owner of the token they are providing

  const token = authHeader.substring(7);

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
        if (err.name === 'TokenExpiredError') {
          res.status(401).json({ error: 'Token expired' });
        }
        else {
            return res.status(401).json({error: 'Invalid token'});
        }
    } 
    else {
      res.locals.userId = decoded.userId;
      res.locals.tokenTimestamp = decoded.timestamp;
      next();
    }
  });
};

module.exports.refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  jwt.verify(refreshToken, secretKey, (err, decodedRefresh) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Check the refresh token against the database
    model.readRefreshTokenById({ user_id: decodedRefresh.userId }, (dbErr, results) => {
      if (dbErr) {
        return res.status(500).json({ error: 'Database error' });
      }

      const storedRefreshToken = results[0].refresh_token;

      if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      // Generate a new access token
      const newPayload = {
        userId: decodedRefresh.userId,
        timestamp: new Date()
      };

      const newAccessToken = jwt.sign(newPayload, secretKey, {
        algorithm: tokenAlgorithm,
        expiresIn: tokenDuration
      });

      res.status(200).json({ token: newAccessToken });
    });
  });
};

module.exports.sendDecodedToken = (req, res, next) => {
  res.status(200).json({
    userId: res.locals.userId,
    tokenTimestamp: res.locals.tokenTimestamp
  });
};

