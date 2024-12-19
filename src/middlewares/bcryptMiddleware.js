//////////////////////////////////////////////////////
// REQUIRE BCRYPT MODULE
//////////////////////////////////////////////////////
const bcrypt = require("bcrypt");

//////////////////////////////////////////////////////
// SET SALT ROUNDS
//////////////////////////////////////////////////////
const saltRounds = 10;

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR COMPARING PASSWORD
//////////////////////////////////////////////////////
module.exports.comparePassword = (req, res, next) => {
  const data = {
    userId: res.locals.userId,
    login: res.locals.login
  }

    // Check password
    const callback = (err, isMatch) => {
      if (err) {
        console.error("Error bcrypt:", err);
        res.status(500).json(err);
      } else {
        if (isMatch && data.login == true) {
          res.locals.message = "Login successful"
          res.locals.userId = data.userId
          next()
        }
        else if (isMatch) {
          res.locals.userId = data.userId
          next();
        } 
        else {
          res.status(401).json({
            message: "Login Failed" 
          });
        }
      }
    };
    
    bcrypt.compare(req.body.password, res.locals.hash, callback);
};

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR HASHING PASSWORD
//////////////////////////////////////////////////////
module.exports.hashPassword = (req, res, next) => {
    const callback = (err, hash) => {
      if (err) {
        console.error("Error bcrypt:", err);
        res.status(500).json(err);
      } 
      else if (res.locals.register == true) {
        res.locals.username = res.locals.username
        res.locals.email = res.locals.email
        res.locals.password = res.locals.password
        res.locals.hash = hash
        next();
      }
      else {
        res.locals.user_id = res.locals.user_id
        res.locals.register = res.locals.register
        res.locals.hash = hash;
        next();
      }
    };
  
    if (req.body.password != undefined) {
      bcrypt.hash(req.body.password, saltRounds, callback);
    }
};