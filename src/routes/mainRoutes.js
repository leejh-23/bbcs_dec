const express = require('express');
const router = express.Router();

// required modules
const jwtMiddleware = require('../middlewares/jwtMiddleware')
const bcryptMiddleware = require('../middlewares/bcryptMiddleware')

const userController = require('../controllers/usersController')

// authentication routes (for users)
router.post("/login", userController.login, bcryptMiddleware.comparePassword, jwtMiddleware.generateToken, jwtMiddleware.sendToken);

router.post("/register", userController.checkUsernameExists, bcryptMiddleware.hashPassword, userController.register, jwtMiddleware.generateToken, jwtMiddleware.sendToken);

router.get('/verify', jwtMiddleware.verifyToken, jwtMiddleware.sendDecodedToken)

// export router
module.exports = router;