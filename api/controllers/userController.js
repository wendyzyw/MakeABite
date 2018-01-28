var mongoose = require('mongoose');
var User = mongoose.model('User');
var passport = require('passport');
//require('./config/passport');

var createAccount = function(req, res) {
    var user = new User({
        "img": req.body.img,
        "name": req.body.name,
		"password": req.body.password,
       "dob": req.body.dob,
        "email": req.body.email,
       "address": req.body.address,
       "phone": req.body.phone,
       "cuisine": req.body.cuisine,
       "meat": req.body.meat,
       "veg": req.body.veg,
       "sauce": req.body.sauce,
       "dairy": req.body.dairy,
       "method": req.body.method,
        "favourites": req.body.favourites
        // "commments": req.body.comments

    });
    user.save(function(err, newUser) {
        if (!err) {
            console.log(newUser);
            res.send(newUser);
        } else {
            res.sendStatus(400);
        }
    });
};

var loginAccount = function(req, res) {
    console.log(req.body);
        console.log(req.body.password);
        User.findOne({'email':req.body.email}, (err, user) => {
        if(err){
            res.sendStatus(400);
            console.log(err);
        }
        
        var messages = [];
        if(!user) {
            console.log('no user');
        }
        if(!user || !user.validPassword(req.body.password)){
            messages.push('Email Does Not Exist Or Password is Invalid')
            console.log('wrong password/email');
        }
        console.log('success');
        console.log(user);
        res.send(user);
        });

}

var getAllUsers = function(req, res) {
    User.find(function(err, users) {
        if (!err) {
            res.send(users);
        } else {
            res.sendStatus(404);
        }
    });
};

// var findUserDetails = function(req, res) {
//     var userInx = req.params._id;
//     User.findById(userInx, function(err, user) {
//         // User.find({"userid":req.params._id}, function(err, user) {
//         if (!err) {
//             res.send(user);
//         } else {
//             res.sendStatus(404);
//         }
//     });
// };

var findUserDetails = function(req, res) {
    var userInx = req.params._id;
    User.findById(userInx)
        .populate('favourites')
        .populate('favourites.restaurant')
        .exec(function(err, user) {
            // User.find({"userid":req.params._id}, function(err, user) {
            if (!err) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        });
};


var updateUserDetails = function(req, res) {
    var userInx = req.params._id;
    User.findByIdAndUpdate(userInx, req.body, function(err, user) {
        if (!err) {
            res.send(user);
        } else {
            res.sendStatus(400);
        }
    });
};

var deleteOneUser = function(req, res) {
    var userInx = req.params._id;
    User.findByIdAndRemove(userInx, function(err, user) {
        if (!err) {
            res.send(user);
        } else {
            res.sendStatus(400);
        }
    });
};




module.exports.createAccount = createAccount;
module.exports.loginAccount = loginAccount;
module.exports.getAllUsers = getAllUsers;
module.exports.findUserDetails = findUserDetails;
module.exports.deleteOneUser = deleteOneUser;
module.exports.updateUserDetails = updateUserDetails;