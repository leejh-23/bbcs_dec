const model = require("../models/usersModel.js"); 

module.exports.checkUsernameExists = (req, res, next) => {
    const data = {
        user_id: res.locals.userId,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }

    // data validation
    if (data.username == undefined || data.email == undefined || data.password == undefined) {
        res.status(400).json({message: "Error: username, email or password is undefined"});
        return;      
    }

    if ((data.username != undefined) && (data.username.length < 3 || data.username.length > 50)) {
        res.status(400).json({message: "Username must be between 3 and 50 characters long"});
        return; 
    }

    if ((data.password != undefined) && (data.password.length < 8)) {
        res.status(400).json({message: "Password must be at least 8 characters long"});
        return; 
    }

    if (data.email != undefined && !data.email.includes('@')) { // the email does not include @
        res.status(400).json({message: "Invalid email address"});
        return; 
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkUserExists:", error);
            res.status(500).json(error);
        } 
        else {
            if (results.length == 0) 
            {
                if (res.locals.userId == undefined) { // user is registering since they dont have any token atm
                    res.locals.username = data.username
                    res.locals.email = data.email
                    res.locals.password = data.password
                    next()
                }
                else {
                    res.locals.user_id = data.user_id
                    res.locals.username = data.username; 
                    res.locals.email = data.email
                    res.locals.password = data.password
                    res.locals.usernameExists = false
                    
                    next()
                }
            } 
            else {
                res.status(409).json({
                    "message": "Username already exists."
                });
                return
            }       
        }
    }

    if (data.username != undefined) {
        model.selectByUsername(data, callback);
    }
    else {
        res.locals.user_id = data.user_id
        res.locals.username = data.username; 
        res.locals.email = data.email
        res.locals.password = data.password
        next()
    }  
}    
    
module.exports.createNewUser = (req, res, next) =>
{
    const data = {
        username: res.locals.username
    }

    if (data.username == undefined)
    {
        res.status(400).send("Error: username is undefined");
        return;   
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewUser:", error);
            res.status(500).json(error);
        } else if (res.locals.usernameExists == false) {
            res.status(201).json({
                "user_id": results.insertId,
                "username": data.username,
                "points": data.points
            });
        }
    }

    model.insertSingle(data, callback);                  
}
    
module.exports.readUserById = (req, res, next) =>
{
    var data = {
        user_id: req.params.user_id,
        name: req.body.name
    }

    if (data.user_id == undefined) {
        data.user_id = res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readUserById:", error);
            res.status(500).json(error);  
        } else {
            if (results.length == 0) 
            {
                res.status(404).json({
                    message: "User not found" 
                });
            }
            else {
                res.status(200).json(results[0]); 
            }
        }
    }

    model.selectById(data, callback);          
}
    
//////////////////////////////////////////////////////
// CONTROLLER FOR LOGIN
//////////////////////////////////////////////////////
module.exports.login = (req, res, next) => {
    const data = {
        username: req.body.username,
        password: req.body.password
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error login:", error);
            res.status(500).json(error);
        } else {
            if (results.length == 0) 
            {
                res.status(404).json({
                    message: "User not found"
                });
            } 
            else {
                res.locals.username = data.username
                req.body.password = data.password // plain text given by the user
                res.locals.hash = results[0].password // hashed password from the database
                res.locals.userId = results[0].user_id
                res.locals.login = true
                next()
            }       
        }
    }

    model.selectByUsername(data, callback);                  
}

//////////////////////////////////////////////////////
// CONTROLLER FOR REGISTER
//////////////////////////////////////////////////////
module.exports.register = (req, res, next) => { // create new user
    const data = {
        username: res.locals.username,
        email: res.locals.email,
        password: res.locals.hash,
        register: res.locals.register
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error register:", error);
            res.status(500).json(error);
        } 
        else {
            res.locals.username = data.username // for the registration message
            res.locals.register = data.register
            next()
        }
    }

    model.insertSingle(data, callback);                                     
}
