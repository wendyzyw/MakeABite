'use strict'

angular.module('makeABiteApp',['ui.router','ngRoute','ngResource','ngMaterial','LocalStorageModule', 'btorfs.multiselect', 'angularUtils.directives.dirPagination', 'rzModule', 'cgBusy', 'dynamicLayout'])
    .config(function($stateProvider, $urlRouterProvider, $routeProvider, localStorageServiceProvider){
		 localStorageServiceProvider
			.setPrefix('makeABiteApp')
			.setStorageType('sessionStorage');
			
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('app', {
                url : '/',
                views : {
                    'header' : {
                        templateUrl : 'header.html'
                    },
                    'content' : {
                        templateUrl : 'home.html',
                        controller : 'SearchController'
                    },
                    'footer' : {
                        templateUrl : 'footer.html'
                    }
                }
            })
           
            .state('app.dishdetail', {
                url : 'meal/:id',
                views : {
                    'content@' : {
                        templateUrl : 'meal.html',
                        controller : 'DishDetailController'
                    }
                }
            })
            .state('app.rmg', {
                url : 'rmg',
                views : {
                    'content@' : {
                        templateUrl : 'rmg.html',
                        controller : 'RmgController'
                    }
                }
            })
            .state('app.mood', {
                url : 'mood',
                views : {
                    'content@' : {
                        templateUrl : 'mood.html',
                        controller : 'ResultsController'
                    }
                }
            })
            .state('app.map', {
                url : 'map',
                views : {
                    'content@' : {
                        templateUrl : 'map.html',
                        controller : 'MapController',
                        resolve:{
                            geoLocation:['$q',function($q){
                                var defer = $q.defer();
                                var loc = [];
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(function (position) {
                                        loc.lat = String(position.coords.latitude);
                                        loc.lng = String(position.coords.longitude);
                                        defer.resolve(loc);
                                    }, function (err){
	                                    loc.lat = '-37.7963689';
	                                    loc.lng = '144.9589851';
	                                    defer.resolve(loc);
                                    }, {maximumAge: 50000, timeout: 20000, enableHighAccuracy: true});

                                } else {
                                    loc.lat = '-37.7963689';
                                    loc.lng = '144.9589851';
                                    defer.resolve(loc);
                                }
                                return defer.promise;
                            }]
                        }
                    }
                },
            })
            //user profile
            .state('app.profile', {
                url : 'myprofile',
                views : {
                    'content@' : {
                        templateUrl : 'profileindex.html',
                        controller : 'UserController'
                    },
                    'profilecontent@app.profile' : {
                        templateUrl : 'myprofile.html',
                        controller : 'UserController'
                    }
                }
            })
            .state('app.profile.preference', {
                parent : 'app.profile',
                url : '/preference',
                views : {
                    'profilecontent@app.profile' : {
                        templateUrl : 'mypreference.html',
                        controller : 'UserController'
                    }
                }
            })
            .state('app.profile.favourites', {
                parent : 'app.profile',
                url : '/favourites',
                views : {
                    'profilecontent@app.profile' : {
                        templateUrl : 'myfavourites.html',
                        controller : 'UserController'
                    }
                }
            })
            .state('app.profile.edit', {
                // parent : 'app.profile',
                // url : '/edit',
                // views : {
                // 	'profilecontent@app.profile' : {
                // 		templateUrl : 'editmyprofile.html',
                // 		controller : 'UserController'
                // 	}
                // }
                url : '/edit',
                views : {
                    'content@' : {
                        templateUrl : 'editmyprofile.html',
                        controller : 'UserController'
                    }
                }
            })
			//mood
			.state('app.moodmeal', {
				url : 'mood/:id',
				views : {
                    'content@' : {
                        templateUrl : 'moodmeal.html',
                        controller : 'moodMealController'
                    }
                }
			})
            //search
            .state('app.search', {
                url : 'search?q&price&mealtype&cuisines&sort&limit',
                params: {
                    q: {
                        type: 'string',
                        value: ''
                    },
                    price: {
                        type: 'int',
                        array: true,
                        value: []
                    },
                    mealtype: {
                        type: 'string'
                    },
                    cuisines: {
                        type: 'string',
                        array: true,
                        value: []
                    },
                    sort: {
                        type: 'string'
                    },
                    limit: {
                        type: 'int'
                    },
					special: {//special=-nf,-gf,spicy,vegan 
						type: 'string',
						array: true,
						value: []
					}, 
					fields: {//fields=name,image
						type: 'string',
						array: true,
						value: []
					}
                },
                views : {
                    'content@' : {
                        templateUrl : 'results.html',
                        controller : 'ResultsController'
                    }
                }
            });

		/* $routeProvider
		 // route for the userprofile page
		 .when('/profile', {
		 templateUrl: 'myprofile.html',
		 controller: 'UserController'
		 })
		 .when('/favourites', {
		 templateUrl: 'myfavourites.html',
		 controller: 'UserController'
		 })

		 .when('/preference', {
		 templateUrl: 'mypreference.html',
		 controller: 'UserController'
		 })

		 .when('/edit', {
		 templateUrl: 'editmyprofile.html',
		 controller: 'UserController'
		 });*/
    });