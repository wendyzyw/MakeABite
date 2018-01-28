// Create database
var mongoose = require('mongoose');

//var mongodb = 'mongodb://localhost/makeabite';
//var mongodb = 'mongodb://app:myPassword@localhost/makeabite';

var mongodb = 'mongodb://test:test@ds161584.mlab.com:61584/makeabite';
//var mongodb://<dbuser>:<dbpassword>@ds161584.mlab.com:61584/makeabite

//var mongodb = 'mongodb://localhost/MakeABite';

mongoose.connect(mongodb,function(err){
    if(!err){
        console.log('Connected to mongo');
    }else{
        console.log('Failed to connect to mongo');
    }
});

require('./meal.js');
require('./restaurant.js');
require('./comment.js');
require('./user.js');
require('./mood.js');
