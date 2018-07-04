var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');
var viewPath = path.join(__dirname, '/public');

// Set up express
var app = express();

mongoose.Promise = global.Promise;

app.use(express.static('public'));
app.engine('html', engine);
//app.set('views', './public')
app.set('views', viewPath);
app.set('view engine', 'html');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(validator());

app.use(session({
    secret: 'Thisismytestkey',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(flash());

// Database setup
require('./api/models/db.js');

require('./config/passport');

// Routes setup
var routes = require('./api/routes/routes.js');
app.use('/',routes);

app.use(passport.initialize());
app.use(passport.session());

require('./api/routes/user')(app, passport)

//app.get('/', function(req, res){
  //res.send('hello world');
//});

// Start the server
app.listen(process.env.PORT || 5000,function(req,res){
   console.log('Express listening on port 5000');
});


// Start the server
// app.listen('http://ec2-52-26-111-26.us-west-2.compute.amazonaws.com/api/', function(req,res){
//     console.log('Listening ...');
// });

