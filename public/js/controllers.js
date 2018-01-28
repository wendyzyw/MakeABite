'use strict'

angular.module('makeABiteApp')
    .controller('ResultsController', ['$scope','$stateParams', '$location','resultsFactory', 'moodFactory', '$filter', 'localStorageService', function($scope, $stateParams, $location, resultsFactory, moodFactory, $filter, localStorageService) {
        $scope.showDishes = true;
        $scope.message = "Loading ...";
        $scope.noDishesMsg = "Oops~Your dishes do not exist!"
        $scope.dishes = [];
        $scope.filteredDishes = [];
        $scope.allDishes = [];
        $scope.dishArray = [];
        $scope.trendings = []; //array of size 5
        $scope.noDishesFound = false;
        $scope.bound = 110;
		
		$scope.queries = localStorageService.get('queries');

		$scope.path = $location.path();
		
		if ($scope.path === '/search'){ //from search url
			$scope.myPromise = resultsFactory.getDishes().query()
				.$promise.then(
					function(response){
						$scope.dishes = response;
						$scope.dishes = filterByMealtype($scope.dishes, $stateParams.mealtype);
						$scope.dishes = filterByCuisines($scope.dishes, $stateParams.cuisines);
						for (var i=0; i<$scope.dishes.length; i++)
							$scope.filteredDishes.push($scope.dishes[i]);

						$scope.showDishes = true;
						if ($scope.filteredDishes.length < 1){
							$scope.noDishesFound = true;
						} else {
							$scope.noDishesFound = false;
						}
					},
					function(response) {
						$scope.showDishes = false;
						$scope.message = "Error: "+response.status + " " + response.statusText;
					}

				);
		} else { //from mood page
			console.log("in mood page params:"+$stateParams.moodId);
			$scope.myPromise = moodFactory.getMoodMeals($stateParams.moodId).query()
				.$promise.then(
					function(response){
						$scope.filteredDishes = response;
						$scope.showDishes = true;
						if ($scope.filteredDishes.length < 1){
							$scope.noDishesFound = true;
						} else {
							$scope.noDishesFound = false;
						};
					},
					function(response) {
						$scope.showDishes = false;
						$scope.message = "Error: "+response.status + " " + response.statusText;
					}

				);
		};

        //get the top 5 trending dishes
        resultsFactory.getTopDishes().query()
            .$promise.then(
            function(response){
                $scope.trendings = response;
            },
            function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText;
            }
        );
        $scope.mealtype = resultsFactory.get();

        //sorting
        $scope.propertyName = 'likes';
        $scope.reverse = false;
        $scope.sortBy = function(propertyName){
            if (propertyName === 'price'){
                $scope.propertyName = propertyName;
                $scope.reverse = false;
            } else if (propertyName === 'pricerev'){
                $scope.propertyName = 'price';
                $scope.reverse = true;
            } else if (propertyName === 'likes'){
                $scope.propertyName = 'rating';
                $scope.reverse = false;
            } else {
                $scope.propertyName = 'rating';
                $scope.reverse = true;
            }
        };

        // filters
        $scope.mealoptions = {};
        $scope.mealoptions.is_spicy = "";
        $scope.mealoptions.is_vegan = "";
        $scope.mealoptions.is_gf = "";
        $scope.mealoptions.is_nf = "";

        $scope.restoptions = {};
        $scope.restoptions.outdoorseats = false;
        $scope.restoptions.smokingarea = false;
        $scope.restoptions.kids = false;
        $scope.restoptions.wheelchair = false;
        $scope.restoptions.delivery = false;
        $scope.restoptions.takeaway = false;
        $scope.restoptions.byo = false;
        $scope.restoptions.byow = false;
        $scope.restoptions.wifi = false;
        $scope.restoptions.fullbar = false;

        $scope.slider = {
            minValue: 0,
            maxValue: 200,
            options: {
                floor: 0,
                ceil: 200,
                step: 1,
                noSwitching: true,
                showSelectionBar: true,
                selectionBarGradient: {
                    from: 'white',
                    to: '#FC0'
                }
            }
        };

        $scope.filterDishes = function() {
            // console.log("filteredDishes length: "+$scope.filteredDishes.length);
            // console.log("dishes length: "+$scope.dishes.length);
            $scope.filteredDishes = [];
            for (var i=0; i<$scope.dishes.length; i++)
                $scope.filteredDishes.push($scope.dishes[i]);
            $scope.filteredDishes = filterByMealOptions($scope.filteredDishes, $scope.mealoptions);
            $scope.filteredDishes = filterByPrice($scope.filteredDishes, $scope.slider);
            $scope.filteredDishes = filterByRestOptions($scope.filteredDishes, $scope.restoptions);
            // console.log("after all filters: filtered "+$scope.filteredDishes.length);
            // console.log("after all filters: dishes "+$scope.dishes.length);
            // console.log($scope.filteredDishes);
        };

        // pagination
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.pageChangeHandler = function(num){
            console.log("meals page change to "+num);
        };
    }])

    .controller('PagerController', ['$scope', function($scope){
        $scope.pageChangeHandler = function(num){
            console.log("going to page "+num);
        }
    }])

    //for meal page
    .controller('DishDetailController', ['$scope', '$stateParams', 'resultsFactory','userFactory', '$mdDialog', '$state', 'localStorageService', function($scope, $stateParams, resultsFactory, userFactory, $mdDialog, $state, localStorageService){
        $scope.showDish = false;
        $scope.message="Loading ...";
        $scope.randDishes = [];
        $scope.dish = resultsFactory.getDish().get({id:$stateParams.id})
            .$promise.then(
                function(response){
                    $scope.dish = response;
                    $scope.showDish = true;

                    // Restaurant info (opening)
                    var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    var now = new Date();
                    var today = weekdays[now.getDay()];
                    var day_short = today.substring(0,3).toLowerCase();
                    var opening_info = $scope.dish.restaurant.time[day_short];
                    $scope.timeInfo = getTimeInfo(opening_info)[0];
                    $scope.timeStyle = getTimeInfo(opening_info)[1];

                    // map
                    var map = new GMaps({
                        el: '#map',
                        lat: $scope.dish.restaurant.location.latitude,
                        lng: $scope.dish.restaurant.location.longitude,
                        mapTypeControlOptions: {
                            mapTypeIds: ["hybrid", "roadmap", "satellite", "terrain", "osm"]
                        }
                    });
                    map.addMarker({
                        lat: $scope.dish.restaurant.location.latitude,
                        lng: $scope.dish.restaurant.location.longitude,
                        icon: 'img/map-marker-icon.png',
                    });
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );
        //dishes you may like
        resultsFactory.get4RandDishes().query()
            .$promise.then(
            function(response){
                $scope.randDishes = response;
                console.log($scope.randDishes);
            },
            function(response){
                $scope.message = "Error: "+response.status + " " + response.statusText;
            }
        );

		//get dish --> get user --> push to favourite list in user --> update user
        $scope.saveDish = function(){
			//get user
			userFactory.getUserData().get({id: localStorageService.get('userId')})
				.$promise.then(
					function(response){
						$scope.user = response;
						$scope.user.favourites.push($scope.dish);
						userFactory.updateUserData().update({id: localStorageService.get('userId')}, $scope.user).
							$promise.then(
								function(response){
									console.log($scope.user.favourites);
									$scope.alreadySaved = true;
								}, 
								function(response){
									console.log("Error: "+response);
								}
							);
					},
					function(response){
						console.log("Error: "+response);
					}
				);
        };

        $scope.showContactInfo = function(ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title($scope.dish.restaurant.name)
                .textContent($scope.dish.restaurant.description+'\n'+'phone: '+$scope.dish.restaurant.phone)
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Try it!')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                $scope.status = 'You decided to get rid of your debt.';
            }, function() {
                $scope.status = 'You decided to keep your debt.';
            });
        };

        $scope.goMeal = function(dishId){
            $state.go('app.dishdetail', {'id': dishId});
        };

    }])

    .controller('CommentController', ['$scope', '$stateParams', 'commentFactory', 'resultsFactory', function($scope, $stateParams, commentFactory, resultsFactory){
        $scope.newComment = {username:"", time:"", content:"", rating:0, mealId:""};
        $scope.showAlert = false;
        $scope.submitComment = function () {
            console.log("Submit button clicked");
            if ($scope.newComment.rating==0) {
                $scope.showAlert = true; // Rating is compulsory
            } else {
                var date = new Date();
                var theMonth = date.getMonth()+1;
                var month = (theMonth>9?"":"0")+theMonth;
                $scope.newComment.time = date.getFullYear() + "-"
                    + month + "-"
                    + (date.getDate()>9?"":"0")+date.getDate() + " "
                    + (date.getHours()>9?"":"0")+date.getHours() + ":"
                    + (date.getMinutes()>9?"":"0")+date.getMinutes() + ":"
                    + (date.getSeconds()>9?"":"0")+date.getSeconds();
                $scope.newComment.username = "anonymous";
                $scope.newComment.mealId = $scope.dish._id;
                // Save the comment to db
                commentFactory.postComment().save($scope.newComment)
                    .$promise.then(
                    function(response){
                        // update average rating and push new comment
                        var i;
                        var numOfComments = $scope.dish.comments.length;
                        var totalStars = 0;
                        for (i=0; i<numOfComments; i++) {
                            totalStars += parseFloat($scope.dish.comments[i].rating);
                        }
                        $scope.dish.comments.push(response._id);
                        totalStars += parseFloat(response.rating);
                        numOfComments ++;
                        $scope.dish.rating = (totalStars/numOfComments).toFixed(1).toString();
                        //console.log($scope.dish.rating);
                        resultsFactory.getDish().update({id:$scope.dish._id}, $scope.dish);
                    }
                );
                $scope.newComment = {username: "", time: "", content: "", rating: 0, mealId: ""};
                $scope.showAlert = false; // init
                location.reload();
            };
        };
    }])

    .controller('SearchController', ['$scope', 'resultsFactory', '$stateParams','$filter', 'localStorageService', function($scope, resultsFactory, $stateParams, $filter, localStorageService){

        $scope.queries = localStorageService.get('queries') || [];
        $scope.searchDishes = function(query){
            //store the keywords into local session
			$scope.queries.push(query);
			console.log($scope.queries);
			localStorageService.set('queries', $scope.queries);
        };

        $scope.cookingoptions = ['Baked', 'Deep-fried', 'Grilled', 'Steamed', 'Stewed', 'Stir-fried', 'Roasted'];
        $scope.cookinglabel = "select your favourite cooking methods";
        $scope.cookingbtn = "pink";

        $scope.cuisineoptions = ['Australian', 'Indian', 'Greek', 'Mexican', 'Turkish', 'Middle Eastern', 'Mediterranean',  'American', 'Asian', 'Vietnamese', 'Thai', 'Chinese', 'Japanese', 'Korean', 'Italian', 'Tapas', 'Pizza', 'Cafe', 'Desserts', 'Bar Food', 'Kebab', 'Seafood', 'BBQ', 'Burger', 'Healthy Food'];
        $scope.cuisinelabel = "select your favourite cuisines",

            $scope.meatoptions = ['Beef', 'Lamb', 'Pork', 'Chicken', 'Bacon/Ham', 'Fish', 'Prawn', 'Crab', 'Squid', 'No meat at all'];
        $scope.meatlabel = "select your favourite meat";

        $scope.vegieoptions = ['Tomato', 'Carrot', 'Potato', 'Broccoli', 'Cauliflower', 'Celery', 'Mushroom', 'Onion', 'Capsicum', 'Avocado','Eggplant'];
        $scope.vegielabel = "select your favourite vegetables";

        $scope.typeoptions = ['Cafe', 'Bar', 'Desert Parlour', 'Casual Dining', 'Fast Food', 'Delivery'];
        $scope.typelabel = "select your meal type";

        $scope.sauceoptions = ['BBQ', 'Mayo', 'Spicy', 'Sweet Chilli', 'Curry', 'Sour Cream', 'Teriyaki'];
        $scope.saucelabel = "select your favourite sauces";

        resultsFactory.set($scope.typeselection);

        $scope.submitFilter = function(){
        };

        $scope.slider = {
            minValue: 0,
            maxValue: 200,
            options: {
                floor: 0,
                ceil: 200,
                step: 1,
                noSwitching: true,
                showSelectionBar: true,
                selectionBarGradient: {
                    from: 'white',
                    to: '#FC0'
                }
            }
        };

    }])

    .controller('RmgController', ['$scope', 'resultsFactory', function($scope, resultsFactory){
        $scope.filters = [[['tabs', 'contains', 'home']]];
        $scope.rankers = null;
        $scope.cuisines = ['Australian', 'Indian', 'Greek', 'Mexican', 'Turkish', 'Middle Eastern', 'Mediterranean',  'American', 'Asian', 'Vietnamese', 'Thai', 'Chinese', 'Japanese', 'Korean', 'Italian', 'Tapas', 'Pizza', 'Cafe', 'Desserts', 'Bar Food', 'Kebab', 'Seafood', 'BBQ', 'Burger', 'Healthy Food'];
        $scope.categories = ['Entree', 'Appetizers', 'Sides', 'Mains', 'Burgers', 'Pizza', 'Desserts', 'Fries', 'Beverages', 'Combos', 'Tandoori Dishes', 'Chicken Dishes', 'Lamb Dishes', 'Vegetarian Dishes', 'Salads', 'Grills'];
        $scope.myStyle = {
            background: 'white'
        };

        $scope.isDropdownOpen = {
            orderBy: false,
            filter: false
        };

        /**
         * Update the filters array based on the given filter
         * $param filter: the name of a tab like 'work'
         */
        $scope.filter = function(filter){
            $scope.filters = [[['tabs', 'contains', filter]]];
        }

        $scope.isTabActive = function(tab){
            return $scope.filters && $scope.filters[0][0][2] === tab;
        }

        /**
         * Update the rankers array based on the given ranker
         * $param ranker: the name of a card's property or a custom function
         */
        $scope.orderBy = function(ranker){
            $scope.rankers = [[ranker, "ascDesc"]];
        }

        $scope.isRankerActive = function(ranker){
            return $scope.rankers && $scope.rankers[0][0] === ranker;
        }

        /**
         * Delete a given card
         * $param index: the index of the card in the cards array
         */
        $scope.deleteCard = function(id){
            var index = -1;
            for(var i in $scope.cards){
                if($scope.cards[i].id == id){
                    index = i;
                    break;
                }
            }
            if(index !== -1){
                $scope.cards.splice(index, 1);
            }
        }

        $scope.removeFirstCard = function(){
            $scope.deleteCard($scope.filteredItems[0].id)
        }

        var cardsToAdd = [];

        /**
         * Add a card to the main view
         * Takes a card from the pile of cardsToAdd and prepend it to the list of
         * cards. Take a card belonging to the selected tab
         */
        //grab another random dishes from the database and add it to cards
        $scope.addCard = function(){
            var item = {
                id: $scope.cards[$scope.cards.length-1].id+1,
                template : "../partials/dish-template.html",
                tabs : ["home", "work"],
                rating : 0,
				price : 0,
                data : {
                    "name" : '',
                    "description" : '',
                    "image" :'',
                    "price" : '',
                    "restaurant" : '',
                    "id" : ''
                },
                added : 1444871272105,
            };
            //add an item to cardstoadd
            cardsToAdd.push(item);
            var getCurrentTab = function(){
                return $scope.filters[0][0][2];
            };

            var getIndexOfNextCardInTab = function(tab){
                var i = -1;

                for(i in cardsToAdd){
                    if(cardsToAdd[i].tabs.indexOf(tab) !== -1){
                        index = i;
                        break;
                    }
                }
                return index;
            };

            var index =  getIndexOfNextCardInTab(getCurrentTab());

            resultsFactory.getARandDish().query()
                .$promise.then(
                function(response){
                    $scope.dish = response;
                    console.log($scope.dish);
                    cardsToAdd[index].data.name = $scope.dish[0].name;
                    cardsToAdd[index].data.description = $scope.dish[0].description;
                    cardsToAdd[index].data.image = $scope.dish[0].image;
                    cardsToAdd[index].data.restaurant = $scope.dish[0].restaurant.name;
                    cardsToAdd[index].data.id = $scope.dish[0]._id;
                    cardsToAdd[index].data.price = $scope.dish[0].price;
					cardsToAdd[index].price = $scope.dish[0].price;
                    cardsToAdd[index].tabs = cardsToAdd[index].tabs.concat($scope.dish[0].restaurant.cuisines).concat($scope.dish[0].category);
                    cardsToAdd[index].rating = $scope.dishes[0].rating;

                    if(index !== -1){
                        $scope.cards.unshift(cardsToAdd[index]);
                        cardsToAdd.splice(index, 1);
                    }
                },
                function(response){
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );

        }
        /**
         * The list of cards that show initialy
         */
        $scope.myPromise = resultsFactory.getRandomDishes().query()
            .$promise.then(
                function(response){
                    $scope.getdishes = response;
                    $scope.dishes = [];
                    for (var j=0; j<9; j++){
                        if (j<$scope.getdishes.length){$scope.dishes.push($scope.getdishes[j]);};
                    }
                    $scope.showDish = true;
                    for (var i in $scope.dishes){
                        if (i < $scope.cards.length){
                            $scope.cards[i].data.name = $scope.dishes[i].name;
                            $scope.cards[i].data.description = $scope.dishes[i].description;
                            $scope.cards[i].data.image = $scope.dishes[i].image;
                            $scope.cards[i].data.restaurant = $scope.dishes[i].restaurant.name;
                            $scope.cards[i].data.id = $scope.dishes[i]._id;
                            $scope.cards[i].data.price = $scope.dishes[i].price;
							$scope.cards[i].price = $scope.dishes[i].price;
                            $scope.cards[i].tabs = $scope.cards[i].tabs.concat($scope.dishes[i].restaurant.cuisines).concat($scope.dishes[i].category);
                            $scope.cards[i].rating = $scope.dishes[i].rating;
                            $scope.item = {
                                id: $scope.cards[i].id+1,
                                template : "../partials/dish-template.html",
                                tabs : ["home", "work"],
                                rating : 0,
								price : 0,
                                data : {
                                    "name" : '',
                                    "description" : '',
                                    "image" :'',
                                    "price" : '',
                                    "restaurant" : '',
                                    "id" : ''
                                },
                                added : 1444871272105,
                            };
                            if (i != $scope.dishes.length -1){
                                $scope.cards.push($scope.item);
                            }
                        }
                    };
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );

        $scope.cards = [
            {
                id: 0,
                template : "../partials/dish-template.html",
                tabs : ["home", "work"],
                rating : 0,
				price : 0,
                data : {
                    "name" : '',
                    "description" : '',
                    "image" :'',
                    "price" : '',
                    "restaurant" : '',
                    "id" : ''
                },
                added : 1444871272105,
            }];

    }])

    .controller('moodMealController', ['$scope', 'resultsFactory', '$stateParams', function($scope, resultsFactory, $stateParams){
        $scope.filters = [[['tabs', 'contains', 'home']]];
        $scope.rankers = null;
        $scope.cuisines = ['Australian', 'Indian', 'Greek', 'Mexican', 'Turkish', 'Middle Eastern', 'Mediterranean',  'American', 'Asian', 'Vietnamese', 'Thai', 'Chinese', 'Japanese', 'Korean', 'Italian', 'Tapas', 'Pizza', 'Cafe', 'Desserts', 'Bar Food', 'Kebab', 'Seafood', 'BBQ', 'Burger', 'Healthy Food'];
        $scope.categories = ['Entree', 'Appetizers', 'Sides', 'Mains', 'Burgers', 'Pizza', 'Desserts', 'Fries', 'Beverages', 'Combos', 'Tandoori Dishes', 'Chicken Dishes', 'Lamb Dishes', 'Vegetarian Dishes', 'Salads', 'Grills'];
        $scope.myStyle = {
            background: 'white'
        };

        $scope.isDropdownOpen = {
            orderBy: false,
            filter: false
        };

        /**
         * Update the filters array based on the given filter
         * $param filter: the name of a tab like 'work'
         */
        $scope.filter = function(filter){
            $scope.filters = [[['tabs', 'contains', filter]]];
        }

        $scope.isTabActive = function(tab){
            return $scope.filters && $scope.filters[0][0][2] === tab;
        }

        /**
         * Update the rankers array based on the given ranker
         * $param ranker: the name of a card's property or a custom function
         */
        $scope.orderBy = function(ranker){
            $scope.rankers = [[ranker, "dsc"]];
        }

        $scope.isRankerActive = function(ranker){
            return $scope.rankers && $scope.rankers[0][0] === ranker;
        }

        /**
         * Delete a given card
         * $param index: the index of the card in the cards array
         */
        $scope.deleteCard = function(id){
            var index = -1;
            for(var i in $scope.cards){
                if($scope.cards[i].id == id){
                    index = i;
                    break;
                }
            }
            if(index !== -1){
                $scope.cards.splice(index, 1);
            }
        }

        $scope.removeFirstCard = function(){
            $scope.deleteCard($scope.filteredItems[0].id)
        }

        var cardsToAdd = [];

        /**
         * Add a card to the main view
         * Takes a card from the pile of cardsToAdd and prepend it to the list of
         * cards. Take a card belonging to the selected tab
         */
        //grab another random dishes from the database and add it to cards
        $scope.addCard = function(){
            var item = {
                id: $scope.cards[$scope.cards.length-1].id+1,
                template : "../partials/dish-template-mood.html",
                tabs : ["home", "work"],
                rating : 0,
                data : {
                    "name" : '',
                    "description" : '',
                    "image" :'',
                    "price" : '',
                    "restaurant" : '',
                    "id" : ''
                },
                added : 1444871272105,
            };
            //add an item to cardstoadd
            cardsToAdd.push(item);
            var getCurrentTab = function(){
                return $scope.filters[0][0][2];
            };

            var getIndexOfNextCardInTab = function(tab){
                var i = -1;

                for(i in cardsToAdd){
                    if(cardsToAdd[i].tabs.indexOf(tab) !== -1){
                        index = i;
                        break;
                    }
                }
                return index;
            };

            var index =  getIndexOfNextCardInTab(getCurrentTab());

            resultsFactory.getARandDish().query()
                .$promise.then(
                function(response){
                    $scope.dish = response;
                    console.log($scope.dish);
                    cardsToAdd[index].data.name = $scope.dish[0].name;
                    cardsToAdd[index].data.description = $scope.dish[0].description;
                    cardsToAdd[index].data.image = $scope.dish[0].image;
                    cardsToAdd[index].data.restaurant = $scope.dish[0].restaurant.name;
                    cardsToAdd[index].data.id = $scope.dish[0]._id;
                    cardsToAdd[index].data.price = $scope.dish[0].price;
                    cardsToAdd[index].tabs = cardsToAdd[index].tabs.concat($scope.dish[0].restaurant.cuisines).concat($scope.dish[0].category);
                    cardsToAdd[index].rating = $scope.dishes[0].rating;

                    if(index !== -1){
                        $scope.cards.unshift(cardsToAdd[index]);
                        cardsToAdd.splice(index, 1);
                    }
                },
                function(response){
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );

        }
        /**
         * The list of cards that show initialy
         */
        $scope.myPromise = resultsFactory.getMoodDishes().query({id:$stateParams.id})
            .$promise.then(
                function(response){
                    $scope.getdishes = response;
                    $scope.dishes = [];
                    for (var j=0; j<12; j++){
                        if (j<$scope.getdishes.length){$scope.dishes.push($scope.getdishes[j]);};
                    }
                    $scope.showDish = true;
                    for (var i in $scope.dishes){
                        if (i < $scope.cards.length){
                            $scope.cards[i].data.name = $scope.dishes[i].name;
                            $scope.cards[i].data.description = $scope.dishes[i].description;
                            $scope.cards[i].data.image = $scope.dishes[i].image;
                            $scope.cards[i].data.restaurant = $scope.dishes[i].restaurant.name;
                            $scope.cards[i].data.id = $scope.dishes[i]._id;
                            $scope.cards[i].data.price = $scope.dishes[i].price;
                            $scope.cards[i].tabs = $scope.cards[i].tabs.concat($scope.dishes[i].restaurant.cuisines).concat($scope.dishes[i].category);
                            $scope.cards[i].rating = $scope.dishes[i].rating;
                            $scope.item = {
                                id: $scope.cards[i].id+1,
                                template : "../partials/dish-template-mood.html",
                                tabs : ["home", "work"],
                                rating : 0,
                                data : {
                                    "name" : '',
                                    "description" : '',
                                    "image" :'',
                                    "price" : '',
                                    "restaurant" : '',
                                    "id" : ''
                                },
                                added : 1444871272105,
                            };
                            if (i != $scope.dishes.length -1){
                                $scope.cards.push($scope.item);
                            }
                        }
                    };
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );

        $scope.cards = [
            {
                id: 0,
                template : "../partials/dish-template-mood.html",
                tabs : ["home", "work"],
                rating : 0,
                data : {
                    "name" : '',
                    "description" : '',
                    "image" :'',
                    "price" : '',
                    "restaurant" : '',
                    "id" : ''
                },
                added : 1444871272105,
            }];

    }])

    .controller('Work1Controller', ['$scope', '$rootScope', '$timeout',
        function($scope, $rootScope, $timeout) {
            $scope.showingMoreText = false;

            $scope.toggleText = function(){
                $scope.showingMoreText = !$scope.showingMoreText;
                // We need to broacast the layout on the next digest once the text
                // is actually shown
                // TODO: for some reason 2 a $timeout is here necessary
                $timeout(function(){
                    $rootScope.$broadcast("layout", function(){
                        // The layout animations have completed
                    });
                }, 20);
            }
        }])

    .controller('MapController', ['$scope', '$stateParams', 'resultsFactory', 'geoLocation', function($scope, $stateParams, resultsFactory, geoLocation){
        $scope.location = geoLocation;
        $scope.dishes = resultsFactory.getNearDishes($scope.location.lat,$scope.location.lng).query()
            .$promise.then(
                function(response){
                    $scope.dishes = response;
                    // map
                    console.log($scope.location)
                    var map = new GMaps({
                        el: '#map',
                        zoom: 16,
                        lat: $scope.location.lat,
                        lng: $scope.location.lng,
                        mapTypeControlOptions: {
                            mapTypeIds: ["hybrid", "roadmap", "satellite", "terrain", "osm"]
                        }
                    });

                    map.addMarkers(loadResults($scope.dishes));

                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );

    }])

    .controller('HeaderController', ['$scope', function($scope){
        $scope.keywords = "";
        $scope.search = function(){
            $scope.searchForm.$setPristine();
        };
    }])

    //user profile page
    .controller('UserController', ['$scope', 'userFactory', 'localStorageService', '$state', function($scope, userFactory, localStorageService, $state) {
        $scope.showUser = true;
        // $scope.message = "Loading...";

        // allergy values
        $scope.allergyoptions = ['Milk', 'Egg', 'Peanuts', 'Soy', 'Seafood'];
        $scope.allergylabel = "select your other allergies";

        $scope.hateoptions = ['Tomato', 'Carrot', 'Potato', 'Broccoli', 'Cauliflower', 'Celery', 'Mushroom', 'Onion', 'Capsicum', 'Avocado','Eggplant','Beef', 'Lamb', 'Pork', 'Chicken', 'Bacon/Ham', 'Fish', 'Prawn', 'Crab', 'Squid'];
        $scope.hatelabel = "select the ingredient you don't like";

        userFactory.getUserData().get({id: localStorageService.get('userId')}).$promise.then(
            function (response) {
				console.log(response);
                $scope.user = response;
                // console.log($scope.user);
                // console.log($scope.user.img);
                $scope.name =$scope.user.name;
                $scope.dob = $scope.user.dob;
                $scope.email = $scope.user.email;
                $scope.address = $scope.user.address;
                $scope.phone = $scope.user.phone;
				$scope.hasFav = ($scope.user.favourites.length > 0);
				
				console.log($scope.hasFav);
                // spicy display
                if($scope.user.spicy == "Yes"){
                    $scope.spicy = "Love spicy!";
                }
                else if($scope.user.spicy == "No"){
                    $scope.spicy = "Don't like spicy!";
                }
                else{
                    $scope.spicy = "Spicy food?";
                }
                // vegan display
                if($scope.user.vegan == "Yes"){
                    $scope.vegan = "Vegan!";
                }
                else if($scope.user.vegan == "No"){
                    $scope.vegan = "Not Vegan!";
                }
                else{
                    $scope.vegan = "Vegan?";
                }
                // gluten display
                if($scope.user.gluten == "Yes"){
                    $scope.gluten = "Gluten free!";
                }
                else if($scope.user.gluten == "No"){
                    $scope.gluten = "Okay with gluten!";
                }
                else{
                    $scope.gluten = "Gluten free?";
                }

                // nuts display
                if($scope.user.nuts == "Yes"){
                    $scope.nuts= "Nuts free!";
                }
                else if($scope.user.nuts == "No"){
                    $scope.nuts = "Okay with Nuts!";
                }
                else{
                    $scope.nuts = "Nuts free?";
                }

                // allergies display
                if($scope.user.allergies.length == 0){
                    $scope.allergies= "Any other allergies?";
                }
                else{
                	var allergies = "";
					for (var m in $scope.user.allergies){
						allergies = allergies + $scope.user.allergies[m] + " ";
					}
                    $scope.allergies = allergies;
                }

                // dislike display
                if($scope.user.hate.length == 0){
                    $scope.hate= "Any ingredients you hate?";
                }
                else{
                    var hate = "";
                    for (var m in $scope.user.hate){
                        hate = hate + $scope.user.hate[m] + " ";
                    }
                    $scope.hate = hate;
                }

            },
			function(response){
				console.log(localStorageService.get('userId'));
			}
        );


        $scope.saveProfile = function () {

            $scope.user.name = $scope.name;
            $scope.user.dob = $scope.dob;
            $scope.user.email = $scope.email;
            $scope.user.address = $scope.address;
            $scope.user.phone = $scope.phone;

            userFactory.updateUserData().update({id: localStorageService.get('userId')}, $scope.user).
				$promise.then(
					function(response){
						console.log("Done");
					}, 
					function(response){
						console.log("Error: "+response);
					}
				);
            // change this if js file location changes
            location.reload();
            // window.location.replace('../profileindexs.html');
            // document.write('<base href="' + document.location + '" /profile>');
        };

        $scope.saveProfileImg = function () {
            console.log($scope.new_img);
            if($scope.new_img != $scope.user.img){
                console.log("new profile selected");
                $scope.user.img = $scope.new_img;
                userFactory.updateUserData().update({id: localStorageService.get('userId')}, $scope.user).
				$promise.then(
					function(response){
						console.log("Done");
					}, 
					function(response){
						console.log("Error: "+response);
					}
				);
                console.log($scope.user.img);
                // location.reload();
            }
        };

        $scope.savePerfer = function(){
            console.log("saved");
            console.log($scope.user);
            userFactory.updateUserData().update({id: localStorageService.get('userId')}, $scope.user).
				$promise.then(
					function(response){
						console.log("Done");
					}, 
					function(response){
						console.log("Error: "+response);
					}
				);
            location.reload();
            //window.location.replace('../profileindex.html');
        };

        $scope.deleteFav = function(dish){
            $scope.user.favourites.splice($scope.user.favourites.indexOf(dish),1);
            userFactory.updateUserData().update({id: localStorageService.get('userId')}, $scope.user).
				$promise.then(
					function(response){
						console.log("Done");
						if ($scope.user.favourites.length < 1){
							$state.reload();
						}
					}, 
					function(response){
						console.log("Error: "+response);
					}
				);
        }
    }])

    .controller('HomeController', ['$scope', function($scope){

    }])

    .controller('LoginController', ['$scope', 'userFactory', '$state', 'localStorageService', '$mdDialog', function($scope, userFactory, $state, localStorageService, $mdDialog){
        $scope.currentUser = {password: "", email: "", rememberme: ""};
        $scope.username = '';
        $scope.password = '';
        $scope.message = '';
        $scope.signinuser = '';
        $scope.signinuserid = '';
		
		$scope.displayname = localStorageService.get('username');
		$scope.isLogin = localStorageService.get('flag');
		
        $scope.login = function(){
            userFactory.loginAccount().login($scope.currentUser).$promise.then(
                function(response){
                    console.log(response);
                    if(response._id) {
                        $scope.signinmessages = "- User login succesful!";
						$scope.isLogin = true;
                        $scope.signinuserid = response._id;
                        $scope.signinuser = response.name;
						if(localStorageService.isSupported) {
							localStorageService.set('username', $scope.signinuser);
							localStorageService.set('userId', $scope.signinuserid);
							localStorageService.set('flag', 'true');
						  };
						  $state.reload();
                    }
                    else if (response.errors) {
                        $scope.signinmessages = "- " + response.errors[0];
                        console.log('nothing');
                    }
                    else {
                        $scope.signinmessages = "- Email or password does not exist or is invalid."
                    }
                },
                function(response){
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                    console.log($scope.message);
                }
            );
        };
		
		$scope.logout = function(ev){
			$mdDialog.show(
			  $mdDialog.alert()
				.parent(angular.element(document.querySelector('#page-top')))
				.clickOutsideToClose(true)
				.title('Log Out')
				.textContent('Successfully logged out!')
				.ariaLabel('Alert Dialog Demo')
				.ok('Got it!')
				.targetEvent(ev)
			);
			localStorageService.clearAll();
			$scope.isLogin = false;
		}

        //sign up
        $scope.newUser = {name: "", password: "", email: ""};
        $scope.newrepeatedpw = '';
        $scope.pwvalidate = true;
        $scope.signup = function(){
            if ($scope.newrepeatedpw !== $scope.newUser.password){
                $scope.signupmessages = "Passwords do not match."
                $scope.pwvalidate = false;
            } else {
                userFactory.createAccount().signup($scope.newUser)
                    .$promise.then(
                    function(response){
                        if(response._id) {
                            console.log('user created');
                            $scope.signupmessages = "- User creation succesful!";
                        }
                        else if (response.errors) {
                            console.log('errors');
                            $scope.signupmessages = "- " + response.errors[0];
                        }
                        else {
                            console.log('user exists');
                            $scope.signupmessages = "- User already exists!";
                        }
                        console.log(response._id);
                        //console.log("new user created!");
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    }
                );
            };
        };
    }])

    .controller('DemoCtrl', DemoCtrl);

function DemoCtrl ($timeout, $q, $log, $http) {
    var self = this;

    self.simulateQuery = true;
    self.isDisabled    = false;
    self.options = ["Salad", "Burger"];
    // list of `state` value/display objects
    //self.states        = loadAll();
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;

	/* function querySearch (query) {
	 var results = query ? self.states.filter( createFilterFor(query) ) : self.states,
	 deferred;
	 if (self.simulateQuery) {
	 deferred = $q.defer();
	 $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
	 return deferred.promise;
	 } else {
	 return results;
	 }
	 } */

    function querySearch(query) {
        return $http.get("api/search?q="+query)
            .then(function(response) {
                var meals=response.data;
                //get all meals name into the array
                return meals.map(function(meal) {
                    return {
                        value: meal,
                        display: meal.name
                    };
                });
            });
    };

    function searchTextChange(text) {
    }

    function selectedItemChange(item) {
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };

    }
};

function filterByMealtype(dishes, mealtype) {
    var filteredDishes = [];
    //filter on restaurant type
    if ((typeof mealtype === 'undefined') || mealtype === ''){
        filteredDishes = dishes;
    } else {
        angular.forEach(dishes, function(dish){
            //console.log("dish name: "+dish.name+" -type- "+dish.restaurant.type);
            if (dish.restaurant.type[0] === mealtype){
                filteredDishes.push(dish);
            }
        });
    }
    //console.log("after mealtype "+filteredDishes.length);
    return filteredDishes;
}

function filterByCuisines(dishes, cuisines) {
    var filteredDishes = [];
    //filter on cuisines
    if (cuisines.length > 0){
        if (cuisines.length === 1){
            var cuisine1 = cuisines[0];
            angular.forEach(dishes, function(dish){
                if (dish.restaurant.cuisines.indexOf(cuisine1) !== -1){
                    filteredDishes.push(dish);
                };
            });
        } else if (cuisines.length === 2){
            var cuisine1 = cuisines[0];
            var cuisine2 = cuisines[1];
            angular.forEach(dishes, function(dish){
                if (dish.restaurant.cuisines.indexOf(cuisine1) !== -1 || dish.restaurant.cuisines.indexOf(cuisine2) !== -1){
                    filteredDishes.push(dish);
                };
            });
        } else {
            var cuisine1 = cuisines[0];
            var cuisine2 = cuisines[1];
            var cuisine3 = cuisines[2];
            angular.forEach(resultsDishes, function(dish){
                if (dish.restaurant.cuisines.indexOf(cuisine1) !== -1 || dish.restaurant.cuisines.indexOf(cuisine2) !== -1
                    || dish.restaurant.cuisines.indexOf(cuisine3) !== -1){
                    filteredDishes.push(dish);
                };
            });
        }
    } else {
        filteredDishes = dishes;
    }
    //console.log("after cuisines "+filteredDishes.length);
    return filteredDishes;
}

function filterByMealOptions(dishes, mealoptions) {
    var filteredDishes = dishes;
    for (var key in mealoptions) {
        if (mealoptions[key]!="") {
            for (var i=0; i<filteredDishes.length; i++) {
                var sp_val;
                if (key=="is_spicy") sp_val = filteredDishes[i].special.is_spicy;
                else if (key=="is_vegan") sp_val = filteredDishes[i].special.is_vegan;
                else if (key=="is_nf") sp_val = filteredDishes[i].special.is_nf;
                else if (key=="is_gf") sp_val = filteredDishes[i].special.is_gf;
                if ((!sp_val && mealoptions[key]=="yes")||
                    (sp_val && mealoptions[key]=="no")) {
                    //console.log("dishes "+dishes.length);
                    filteredDishes.splice(i, 1);
                    i -= 1;
                    // console.log("filtered "+filteredDishes.length);
                    // console.log("dishes "+dishes.length);
                }
            }
        }
    }
    //console.log("after meal options "+filteredDishes.length);
    return filteredDishes;
}

function filterByRestOptions(dishes, restOptions) {
    var filteredDishes = dishes;
    var rest_short = [ "byo", "byow", "delivery", "fullbar", "kids",
        "outdoorseats", "smokingarea", "takeaway", "wheelchair", "wifi"];
    var rest = ["BYO", "BYOW", "Home Delivery", "Full Bar Available", "Kids Friendly",
        "Outdoor Seating", "Smoking Area", "Takeaway Available", "Wheelchair Accessible", "Wifi"];
    for (var key in restOptions) {
        if (restOptions[key]) {
            for (var i=0; i<filteredDishes.length; i++) {
                var valid = false;
                //console.log(filteredDishes[i].restaurant.highlights);
                for (var amenity_i=0; amenity_i<filteredDishes[i].restaurant.highlights.length; amenity_i++) {
                    //console.log(filteredDishes[i].restaurant.highlights[amenity_i]);
                    if (rest.indexOf(filteredDishes[i].restaurant.highlights[amenity_i])==rest_short.indexOf(key)) {
                        //console.log(rest.indexOf(filteredDishes[i].restaurant.highlights[amenity_i])+" "+rest_short.indexOf(key));
                        valid = true;
                        break;
                    }
                }
                //console.log(valid);
                if (!valid) {
                    filteredDishes.splice(i, 1);
                    i -= 1;
                }
            }
        }
    }
    //console.log("after rest options "+filteredDishes.length);
    return filteredDishes;
}

function filterByPrice(dishes, price) {
    var filteredDishes = [];
    var lower = price.minValue;
    var upper = price.maxValue;
    for (var i=0; i<dishes.length; i++) {
        if (dishes[i].price <= upper && dishes[i].price >= lower)
            filteredDishes.push(dishes[i]);
    }
    //console.log("after price "+filteredDishes.length);
    return filteredDishes;
}

function getTimeInfo(opening_info) {
    var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var now = new Date();
    var today = weekdays[now.getDay()];
    var hour = now.getHours();
    var minutes = now.getMinutes();
    var suffix = hour >= 12 ? " PM" : " AM"; // add AM or PM
    if (minutes < 10) {
        minutes = "0" + minutes
    }

    var timeInfo = 'it\'s ' + today + ' ' + hour + ':' + minutes + suffix;
    var timeStyle;
    var opening = false;
    if (opening_info=="24 Hours") { // open all day
        opening = true;
    } else if (opening_info=="Closed") {
        opening = false;
    } else {
        var timeRanges = [];
        timeRanges.push(opening_info.split(', ')[0].split(' to '));
        if (opening_info.split(', ').length > 1) {
            timeRanges.push(opening_info.split(', ')[1].split(' to '));
        } // Assuming two time slots max
        for (var i = 0; i < timeRanges.length; i++) {
            for (var j = 0; j < timeRanges[i].length; j++) {
                var str = timeRanges[i][j];
                if (str.slice(-2) == "PM") {
                    if (str.match(/:/) == null) {
                        var newstr = (parseInt(str.match(/\d+/g)[0]) + 12).toString();
                        newstr += ":00";
                    } else {
                        var newstr = (parseInt(str.split(':')[0]) + 12).toString();
                        newstr += ":" + str.split(':')[1].match(/\d+/g)[0];
                    }
                    timeRanges[i][j] = newstr;
                } else if (str.slice(-2) == "on") { // NOON
                    timeRanges[i][j] = "12:00";
                } else if (str.slice(-2) == "AM") {
                    if (str.match(/:/) == null) {
                        timeRanges[i][j] = str.match(/\d+/g)[0] + ":00";
                    } else {
                        timeRanges[i][j] = str.split(':')[0] + ":" + str.split(':')[1].match(/\d+/g)[0];
                    }
                    if (timeRanges[i][j].length == 4) timeRanges[i][j] = "0" + timeRanges[i][j];
                } else {
                    timeRanges[i][j] = "00:00";
                }
            }
        }
    }

    if (hour < 10) {
        hour = "0" + hour;
    }
    var now_str = hour + ":" + minutes;
    if (typeof timeRanges != 'undefined') {
        for (var i = 0; i < timeRanges.length; i++) {
            if (timeRanges[i][0] < timeRanges[i][1]) {
                opening = (now_str > timeRanges[i][0] && now_str < timeRanges[i][1]) ? true : false;
            } else {
                opening = ((now_str > timeRanges[i][0] && now_str <= "23:59") || (now_str > "00:00" && now_str < timeRanges[i][1])) ? true : false;
            }
        }
    }
    if (opening) {
        timeInfo += ' - we\'re open!';
        timeStyle = 'resopen';
    } else {
        timeInfo += ' - we\'re closed!';
        timeStyle = 'resclosed';
    }

    // Highlight the opening hours information of today
    var currentDay = weekdays[now.getDay()];
    angular.element("#" + currentDay).addClass('today');

    return [timeInfo, timeStyle];
}

function loadResults(items) {
    var markers_data = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        markers_data.push({
            lat : item.restaurant.location.latitude,
            lng : item.restaurant.location.longitude,
            title : item.name,
            icon : {
                scaledSize : new google.maps.Size(55, 44),
                url : item.image
            },
            click: function(e) {
                window.location.href = '/#/meal/'+item._id;
            }
        });
    }
    return markers_data;
}