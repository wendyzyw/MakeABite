'use strict';

angular.module('makeABiteApp')
    .constant("baseURL","http://localhost:3000/")
    .service('resultsFactory', ['$resource', '$stateParams', function($resource, $stateParams) {
        this.getDish = function(){
            return $resource("api/meal/:id",null,  {'update':{method:'PUT'}});
        };

        this.getAllDishes = function(){
            return $resource("api/meal",null, {'update':{method:'PUT'}});
        };

        this.getTopDishes = function(){
            return $resource("api/search?q=&sort=-likes&limit=5", null, {'update':{method:'PUT'}});
        };

        this.getDishes = function(){
            return $resource("api/search?q="+$stateParams.q+"&price="+$stateParams.price+"&sort="+$stateParams.sort+"&limit="+$stateParams.limit, null, {'search':{method: 'GET'}});
        };

        //for dishes you may like in meal page
        this.get4RandDishes = function() {
            return $resource("api/search/4", null, {'update': {method: 'PUT'}});
        }

        //for random meal generator

        this.getRandomDishes = function(){
            return $resource("api/search/9", null, {'update':{method:'PUT'}});
        };

        this.getARandDish = function(){
            return $resource("api/search/1", null, {'update':{method:'PUT'}});
        };

        this.getNearDishes = function(lat,lng){
            return $resource("api/search?near="+lng+','+lat+',2000', null, {'update':{method:'PUT'}});
        };

        this.getMoodDishes = function(){
            return $resource("api/mood/:id",null,  {'update':{method:'PUT'}});
        };

        this.updateMood = function() {
            return $resource("api/mood/:id", null, {'update':{method:'PUT'}});
        };

        this.getTrendings = function(){
            return $resource("trendings/:id",null,  {'update':{method:'PUT' }});
        };

        this.savedMealtype = "";
        this.set = function(mealtype){
            this.savedMealtype = mealtype;
        };

        this.get = function(){
            return this.savedMealtype;
        };
    }])

    .service('commentFactory', ['$resource', function($resource) {
        // Comment
        this.postComment = function() {
            return $resource("api/comment", null, {'save':{method:'POST'}});
        };

        this.getAllComments = function() {
            return $resource("api/comment", null, {'update':{method:'GET'}});
        };

    }])

    //for profile page
    .service('userFactory', ['$resource', function($resource){
        this.getUserData = function(){
            return $resource("api/user/:id", null, {'update':{method:'PUT'}});

        };

        this.updateUserData = function(){
            return $resource("api/user/:id", null, {'update':{method:'PUT'}});
        };

        this.createAccount = function(){
            return $resource("api/user", null, {'signup': {method: 'POST'}});
        };


        this.loginAccount = function(){
            return $resource("api/user/login", null, {'login': {method: 'POST'}});
        };


        this.getDish = function(){
            // return $resource(baseURL+"api/meal/:id",null,  {'update':{method:'PUT'}});
            return $resource("api/meal/:id",null,  {'query':{method:'GET'}});
        };
    }])
	
	.service('moodFactory', ['$resource', function($resource){
		this.getMoodMeals = function(id){
			console.log("in services: "+id);
			return $resource("api/mood/:moodId", {moodId: id}, {'find':{method:'GET'}});
		}
	}]);