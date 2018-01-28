var express = require('express');
var router = express.Router();

var mealController = require('../controllers/mealController.js');
var commentController = require('../controllers/commentController.js');
var restaurantController = require('../controllers/restaurantController.js');
//var userController = require('../controllers/userController.js');
var searchController = require('../controllers/searchController.js');
var userController = require('../controllers/userController.js');
var moodController = require('../controllers/moodController.js');
// Set Result page as entry point (for testing purpose)
/*
var path = require('path');
router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/../../public/home.html'));
    console.log('hello');
});*/

// Mood

// Create new mood
router.post('/api/mood',moodController.createMood);

// Find mood meals
router.get('/api/mood/:id',moodController.findMood);

// Get all mood
router.get('/api/mood',moodController.findAllMoods);

// Update mood
router.put('/api/mood/:id',moodController.updateMood);


// Meal

// Create new meal
router.post('/api/meal',mealController.createMeal);

// Find all meals
router.get('/api/meal',mealController.findAllMeals);

// Find one meal by id
router.get('/api/meal/:id',mealController.findOneMeal);

// Update one meal by id
router.put('/api/meal/:id',mealController.updateOneMeal);

// Delete one meal by id
router.delete('/api/meal/:id',mealController.deleteOneMeal);

// Restaurant

// Create new restaurant
router.post('/api/restaurant',restaurantController.createRestaurant);

// Find all restaurants
router.get('/api/restaurant',restaurantController.findAllRestaurants);

// Find one restaurant by id
router.get('/api/restaurant/:id',restaurantController.findOneRestaurant);

// Update one restaurant by id
router.put('/api/restaurant/:id',restaurantController.updateOneRestaurant);

// Delete one restaurant by id
router.delete('/api/restaurant/:id',restaurantController.deleteOneRestaurant);

// Search
router.get('/api/search', searchController.searchMeals);

// Random Search
router.get('/api/search/:n', searchController.randomsearchMeals);

// Similarity Search
router.post('/api/search', searchController.simsearchMeals);

// Comment

// Create new comment
router.post('/api/comment', commentController.postComment);

// Find all comments (for testing purpose)
router.get('/api/comment', commentController.getAllComments);

// Find one comment by mealId
router.get('/api/comment/:mealId', commentController.findMealComments);

//User

// Create new account
router.post('/api/usera', userController.createAccount);

router.post('/api/logina', userController.loginAccount);

// Find all users
router.get('/api/user', userController.getAllUsers);

// Find one user by userId
router.get('/api/user/:_id', userController.findUserDetails);

// Update one user by userId
router.put('/api/user/:_id', userController.updateUserDetails);

// Delete one user, for test purpose
router.delete('/api/user/:_id',userController.deleteOneUser);

module.exports = router;