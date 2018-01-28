var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var crypto = require('crypto');
var express = require('express');


//var User = require('../../api/models/user');
var secret = require('../../secret/secret');

module.exports = (app, passport) => {
    //app.use(express.static(__dirname + '/public'));
    var path = require('path');
    /*
    router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/../../public/home.html'));
})*/
    app.get('/', (req, res, next) => {
    //res.sendFile(path.join(__dirname+'/../../public/meal.html'));
    //res.sendFile(path.join(__dirname+'/../../public/meal.html'));
        //res.render('/', {title: 'Index'});
        console.log('hello');
        
        if(req.session.cookie.originalMaxAge != null){
            res.redirect('/indexnew');
        }else{
            console.log('why not rendering');
            res.render('index', {title: 'Index'});
        }
    });

    app.get('/signup', (req, res) => {
        console.log('signup route')
        var errors = req.flash('error');
        res.redirect('/');
        //res.render('/home', {title: 'Sign Up ', messages: errors, hasErrors: errors.length > 0});
    });

    
    app.post('/api/user', validate, passport.authenticate('local.signup', {
        //successRedirect: '/',
        failureRedirect: '/',
        failureFlash : true
    }), (req, res)=> {
        res.send(req.user);
    });
    
    app.post('/api/user/signup', (req, res) => {
        console.log('posted');
    });
    

    app.get('/login', (req, res) => {
        var errors = req.flash('error');
        res.render('user/login', {title: 'Login', messages: errors, hasErrors: errors.length > 0});
    });
    
    app.post('/api/login', (req, res) => {
        console.log(req.body);
        console.log(req.body.password);
        var loginpassword = req.user.password;
        User.findOne({'email':req.body.email}, (err, user) => {
        if(err){
            console.log(err);
            res.send(err);
            return;
        }
        
        var messages = [];
        var errorMsg = {};
        if(!user || !user.validPassword(req.body.password)){
            messages.push('Email Does Not Exist Or Password is Invalid');
            errorMsg.message = "invalid";
            res.send({message:messages});
        }else {
        res.send(user);
        }
    });
    });
    
    
    
    app.post('/api/user/login', loginValidation, passport.authenticate('local.login', {
       // successRedirect: '/',
        failureRedirect: '/',
        failureFlash : true
    }), (req, res) => {
        console.log(req.body.rememberme + 'hello');
        if(req.body.rememberme){
            //console.log('I AM REMEMBERED');
            req.session.cookie.maxAge = 30*24*60*60*1000; // 30 days
        }else{
            //console.log('not remembering');
            req.session.cookie.expires = null;
        }
        //console.log(req.user);
        res.send(req.user);
        //res.redirect('/indexnew');
    });
    
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
    
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));
    
    
    app.get('/indexnew', (req, res) => {
       // res.redirect('/home');
        //res.json(req.user);
       res.render('index', {title: 'Home ', user: req.user});
        console.log(req.user);
    });
    
    app.get('/forgot', (req, res) => {
        var errors = req.flash('error');
        
        var info = req.flash('info');
        
		res.render('user/forgot', {title: 'Request Password Reset', messages: errors, hasErrors: errors.length > 0, info: info, noErrors: info.length > 0});
	});
    
    app.post('/forgot', (req, res, next) => {
        async.waterfall([
            function(callback){
                crypto.randomBytes(20, (err, buf) => {
                    var rand = buf.toString('hex');
                    callback(err, rand);
                });
            },
            
            function(rand, callback){
                User.findOne({'email':req.body.email}, (err, user) => {
                    if(!user){
                        req.flash('error', 'No Account With That Email Exist Or Email is Invalid');
                        return res.redirect('/forgot');
                    }
                    
                    user.passwordResetToken = rand;
                    user.passwordResetExpires = Date.now() + 60*60*1000;
                    
                    user.save((err) => {
                        callback(err, rand, user);
                    });
                })
            },
            
            function(rand, user, callback){
                var smtpTransport = nodemailer.createTransport({
                    service: 'Hotmail',
                    auth: {
                        user: secret.auth.user,
                        pass: secret.auth.pass
                    }
                });
                
                var mailOptions = {
                    to: user.email,
                    from: 'MakeABite '+'<'+secret.auth.user+'>',
                    subject: 'MakeABite Application Password Reset Token',
                    text: 'You have requested for password reset token. \n\n'+
                        'Please click on the link to complete the process: \n\n'+
                        'http://localhost:3000/reset/'+rand+'\n\n'
                };
                
                smtpTransport.sendMail(mailOptions, (err, response) => {
                   req.flash('info', 'A password reset token has been sent to '+user.email);
                    return callback(err, user);
                });
            }
        ], (err) => {
            if(err){
                return next(err);
            }
            
            res.redirect('/forgot');
        })
    });
    
    app.get('/reset/:token', (req, res) => {
        
        User.findOne({passwordResetToken:req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {
            if(!user){
                req.flash('error', 'Password reset token has expired or is invalid. Enter your email to get a new token.');
                return res.redirect('/forgot');
            }
            var errors = req.flash('error');
            var success = req.flash('success');
            
            res.render('user/reset', {title: 'Reset Your Password', messages: errors, hasErrors: errors.length > 0, success:success, noErrors:success.length > 0});
        });
    });
    
    app.post('/reset/:token', (req, res) => {
        async.waterfall([
            function(callback){
                User.findOne({passwordResetToken:req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {
                    if(!user){
                        req.flash('error', 'Password reset token has expired or is invalid. Enter your email to get a new token.');
                        return res.redirect('/forgot');
                    }
                    
                    req.checkBody('password', 'Password is Required').notEmpty();
                    req.checkBody('password', 'Password Must Not Be Less Than 5').isLength({min:5});
                    req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
                    
                    var errors = req.validationErrors();
                    
                    if(req.body.password == req.body.cpassword){
                        if(errors){
                            var messages = [];
                            errors.forEach((error) => {
                                messages.push(error.msg)
                            })
                            
                            var errors = req.flash('error');
                            res.redirect('/reset/'+req.params.token);
                        }else{
                            user.password = user.encryptPassword(req.body.password);
                            user.passwordResetToken = undefined;
                            user.passwordResetExpires = undefined;
                            
                            user.save((err) => {
                                req.flash('success', 'Your password has been successfully updated.');
                                callback(err, user);
                            })
                        }
                    }else{
                        req.flash('error', 'Password and confirm password are not equal.');
                        res.redirect('/reset/'+req.params.token);
                    }
                    
//                    
                });
            },
            
            function(user, callback){
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: secret.auth.user,
                        pass: secret.auth.pass
                    }
                });
                
                var mailOptions = {
                    to: user.email,
                    from: 'MakeABite '+'<'+secret.auth.user+'>',
                    subject: 'Your password Has Been Updated.',
                    text: 'This is a confirmation that you updated the password for '+user.email
                };
                
                smtpTransport.sendMail(mailOptions, (err, response) => {
                    callback(err, user);
                    
                    var error = req.flash('error');
                    var success = req.flash('success');
                    
                    res.render('user/reset', {title: 'Reset Your Password', messages: error, hasErrors: error.length > 0, success:success, noErrors:success.length > 0});
                });
            }
        ]);
    });
    
    app.get('/logout', (req, res) => {
		req.logout();
		req.session.destroy((err) => {
	        res.redirect('/');
	    });
	})
}


function validate(req, res, next){
   req.checkBody('name', 'Fullname is Required').notEmpty();
   req.checkBody('name', 'Fullname too short, min. 5 characters').isLength({min:5});
   req.checkBody('email', 'Email is required').notEmpty();
   req.checkBody('email', 'Email is invalid').isEmail();
   req.checkBody('password', 'Password is Required').notEmpty();
   req.checkBody('password', 'Password too short, min. 5 characters').isLength({min:5});
   req.check("password", "Password must be alphanumeric").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
console.log('validation')
   var errors = req.validationErrors();
   if(errors){
       var messages = [];
       errors.forEach((error) => {
           messages.push(error.msg);
       });

       req.flash('error', messages);
    //console.log(req.errors);
       res.send({errors:messages});
   }else{
       return next();
   }
}

function loginValidation(req, res, next){
    
   req.checkBody('email', 'Email is required').notEmpty();
   req.checkBody('email', 'Email is invalid').isEmail();
   req.checkBody('password', 'Password is required').notEmpty();

   var loginErrors = req.validationErrors();
   if(loginErrors){
       var messages = [];
       loginErrors.forEach((error) => {
           messages.push(error.msg);
       });

       req.flash('error', messages);
    //console.log(req.errors);
       res.send({errors:messages});
   }else{
       return next();
   }
}


