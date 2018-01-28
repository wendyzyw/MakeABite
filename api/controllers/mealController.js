var mongoose = require('mongoose');
var Meal = mongoose.model('Meal');

var createMeal = function(req,res){
    var meal = new Meal({
        "name":req.body.name,
        "description":req.body.description,
        "category":req.body.category,
        "image":req.body.image,
        "rating":req.body.rating,
        "likes":req.body.likes,
        "price":parseInt(req.body.price)*100,
        "is_popular":req.body.is_popular,
        "special": {
            "is_gf":req.body.special.is_gf,
            "is_nf":req.body.special.is_nf,
            "is_spicy":req.body.special.is_spicy,
            "is_vegan":req.body.special.is_vegan
        }, 
        "restaurant":mongoose.Types.ObjectId(req.body.restaurant),
		"comments":req.body.comments.map(mongoose.Types.ObjectId)
    });
    meal.save(function(err,newMeal){
        if(!err){
            res.send(newMeal);
        }else{
            res.sendStatus(400);
        }
    });
};

var findAllMeals = function(req,res){
	var query = queryBuilder(req.query);
    Meal
		.find(query.query, query.select, query.cursor)
		//.populate('restaurant')
		.exec(function(err,meals){
        if(!err){
			for (var i = 0; i < meals.length; i++) {
			    meals[i].price = meals[i].price/100;
			}
            res.send(meals);
        }else{
            res.sendStatus(404);
        }
    });
};

//Search Terms:
//q, category, special, price, likes, rating, restaurant
//fields
//start, limit, sort

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
	
	if (query.restaurant) {
		output.query.restaurant = mongoose.Types.ObjectId(query.restaurant);
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

var findOneMeal = function(req,res){
    var mealInx = req.params.id;
    Meal
        .findById(mealInx)
        .populate('restaurant')
		.populate('comments')
        .exec(function(err,meal){
            if(!err){
				meal.price = meal.price/100;
                res.send(meal);
            }else{
                res.sendStatus(404);
            }
        });
};

var updateOneMeal = function(req,res){
    var mealInx = req.params.id;
    Meal.findByIdAndUpdate(mealInx, req.body , function(err,meal){
        if(!err){
            res.send(meal);
        }else{
            res.sendStatus(400);
        }
    });
};

var deleteOneMeal = function(req,res){
    var mealInx = req.params.id;
    Meal.findByIdAndRemove(mealInx,function(err,meal){
        if(!err){
            res.send(meal);
        }else{
            res.sendStatus(400);
        }
    });
};

module.exports.createMeal = createMeal;
module.exports.findAllMeals = findAllMeals;
module.exports.findOneMeal = findOneMeal;
module.exports.updateOneMeal = updateOneMeal;
module.exports.deleteOneMeal = deleteOneMeal;
