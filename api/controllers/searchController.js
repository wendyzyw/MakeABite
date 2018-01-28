//Search Terms:
//q=<keyword> | keyword search for meal name and description
//category=entree | category of the meal, case insensative, regex match
//special=-nf,-gf,spicy,vegan | four options(nf,gf,spicy,vegan), seperated by comma, reverse selection by adding negative sign at the front (nf to -nf)
//rating=<min>,<max> | inclusive, if no min supplied will go from 0, vise versa for max
//likes=<min>,<max> | inclusive, if no min supplied will go from 0, vise versa for max
//price=<min>,<max> | inclusive, if no min supplied will go from 0, vise versa for max
//type=causal dining | restaurant type, seperated by comma, case sensative, exact match, OR operator (match any in the list)
//cuisines=Cafe,American | seperated by comma, case sensative, exact match, OR operator (match any in the list)
//highlights=Wheelchair Accessible,Outdoor Seating | seperated by comma, case sensative, exact match, AND operator (match all in the list)
//open(incomplete)
//near=<longitude>,<latitude>,<maxdistance(optional)>,<mindistance(optional)> | order is important, distance is measured in metres, from the point of interest
//fields=name,image | only for meals data, use negative sign after the equal sign (=-) if suppressing the fields
//start=5 | offset for returned meals
//limit | number of meals returned
//sort=name,-price | seperated by comma, sort by the order of the fields, default is ascending, use negative sign if descending

var mongoose = require('mongoose');
var Meal = mongoose.model('Meal');

var searchMeals = function(req,res){
	var query = queryBuilder(req.query);
	var rquery = RqueryBuilder(req.query).query;
    Meal.find(query.query, query.select, query.cursor)
	.populate('restaurant', null, rquery)
    .exec(function(err,meals){
        if(!err){
			for (var i = 0; i < meals.length; i++) {
				if (!meals[i].restaurant) {
					delete meals[i];
				} else {
					meals[i].price = meals[i].price = meals[i].price/100;
				}
			}
            res.send(meals);
        }else{
            res.sendStatus(404);
        }
    });
};

var queryBuilder = function(query){
	var output = {
	  query: {},
	  select: {},
	  cursor: {
		  sort: {}
	  }
	}
	
	if (query.q) {
		output.query['$text']= { $search: query.q.trim() };
		output.select.score = { $meta: "textScore" };
		output.cursor.sort.score = { $meta: "textScore" };
	}
	
	if (query.category) {
		output.query.category = new RegExp(query.category.trim(),"i");;
	}
	
	if (query.special) {
		var items = query.special.split(',');
		for (var i in items) {
			if (items[i].charAt(0) == '-') {
				item = 'special.is_'+items[i].trim().substring(1);
				output.query[item] = false;
			} else {
				item = 'special.is_'+items[i].trim();
				output.query[item] = true;
			}
		}
	}
	
	if (query.rating) {
		output.query.rating = {};
		var items = query.rating.split(',');
		if (items[0]) {
			output.query.rating['$gte'] = parseInt(items[0]);
		}
		if (items[1]) {
			output.query.rating['$lte'] = parseInt(items[1]);
		}
	}
	
	if (query.likes) {
		output.query.likes = {};
		var items = query.likes.split(',');
		if (items[0]) {
			output.query.likes['$gte'] = parseInt(items[0]);
		}
		if (items[1]) {
			output.query.likes['$lte'] = parseInt(items[1]);
		}
	}
	
	if (query.price) {
		output.query.price = {};
		var items = query.price.split(',');
		if (items[0]) {
			output.query.price['$gte'] = parseInt(items[0])*100;
		}
		if (items[1]) {
			output.query.price['$lte'] = parseInt(items[1])*100;
		}
	} 
	
	if (query.fields) {
		var sign = 1;
		if (query.fields.charAt(0) == '-') {
			sign = 0;
		}
		var items = query.fields.split(',');
		for (var i in items) {
			if (items[i].charAt(0) == '-') {
				item = [items[i].trim().substring(1)];
			} else {
				item = [items[i].trim()];
			}
			output.select[item] = sign;
		}	
	}
	
	if (query.sort) {
		var items = query.sort.split(',');
		for (var i in items) {
			item = items[i].trim();
			if (items[i].charAt(0) == '-') {
				item = [item.substring(1)];
				output.cursor.sort[item] = -1;
			} else {
				item = [item];
				output.cursor.sort[item] = 1;
			}
		}	
	}
	
	if (query.start) {
		output.cursor.skip = parseInt(query.start);
	}
	
	if (query.limit) {
		output.cursor.limit = parseInt(query.limit);
	}
	//console.log(output)
	return output;
}

var RqueryBuilder = function(query){
	var output = {
	  query: {},
	  select: {},
	  cursor: {
		  sort: {}
	  }
	}
	
	if (query.type) {
		var items = query.type.split(',');
		for (var i in items) {
			items[i] = items[i].trim();
		}
		output.query.type = {$in: items } 
	}
	
	if (query.cuisines) {
		var items = query.cuisines.split(',');
		for (var i in items) {
			items[i] = items[i].trim();
		}
		output.query.cuisines = {$in: items } 
	}
	
	if (query.highlights) {
		var items = query.highlights.split(',');
		for (var i in items) {
			items[i] = items[i].trim();
		}
		output.query.highlights = {$all: items } 
	}
	
	if (query.open) {
	}
	
	if (query.near) {
		var items = query.near.split(',');
		output.query.loc = { $near :{
            	$geometry: { type: "Point",  coordinates: [ parseFloat(items[0].trim()), parseFloat(items[1].trim()) ] },
         }};
		 if (items.length==3 && items[3]) {
			 output.query.loc['$near']['$maxDistance'] = parseInt(items[3].trim());
		 }
		 if (items.length==4 && items[4]) {
			 output.query.loc['$near']['$minDistance'] = parseInt(items[4].trim());
		 }
	   output.cursor.sort = {};
	}
	//console.log(output)
	return output;
}

var randomsearchMeals = function(req,res){
    var rand = req.params.n;
    Meal
        .aggregate({$sample:{size:parseInt(rand)}})
        .exec(function(err,meal){
            if(!err){
				Meal.populate(meal, { path: 'restaurant'}, function (err, meals) {
				    if(!err){
						for (var i = 0; i < meals.length; i++) {
							if (!meals[i].restaurant) {
								delete meals[i];
							} else {
								meals[i].price = meals[i].price = meals[i].price/100;
							}
						}
						res.send(meals);
					}else{
						res.sendStatus(404);
					}
				  });
            }else{
                res.sendStatus(404);
            }
        });
};

var simsearchMeals = function(req,res){
	Meal
	.find()
	.exec(function(err,meals){
		if(!err){
	        for (var i = 0; i < meals.length; i++) {
				var score = 0;
				for (var key in req.body) {
					if (meals[i].keywords.indexOf(key) != -1) {
						score += req.body[key];
					}
				}
				meals[i].sscore = score;
	        }
			meals.sort(function(a, b) {
			    return b['sscore']-a['sscore'];
			});
			Meal.populate(meals.slice(0,12), { path: 'restaurant'}, function (err, meals) {
			    if(!err){
					for (var i = 0; i < meals.length; i++) {
						if (!meals[i].restaurant) {
							delete meals[i];
						} else {
							meals[i].price = meals[i].price = meals[i].price/100;
						}
					}
					res.send(meals);
				}else{
					res.sendStatus(404);
				}
			  });			
        }else{
            res.sendStatus(404);
        }
    });
};

module.exports.searchMeals = searchMeals;
module.exports.randomsearchMeals = randomsearchMeals;
module.exports.simsearchMeals = simsearchMeals;