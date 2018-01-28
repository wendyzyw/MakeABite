var mongoose = require('mongoose');
var Restaurant = mongoose.model('Restaurant');

var createRestaurant = function(req,res){
    var restaurant = new Restaurant({
        "name":req.body.name,
        "type":req.body.type,
        "description":req.body.description,
        "phone":req.body.phone,
        "cuisines":req.body.cuisines,
        "time": {
            "mon": req.body.time.mon,
            "tue": req.body.time.tue,
            "wed": req.body.time.wed,
            "thu": req.body.time.thu,
            "fri": req.body.time.fri,
            "sat": req.body.time.sat,
            "sun": req.body.time.sun
        },
        "location": {
            "address": req.body.location.address,
            "locality": req.body.location.locality,
            "zipcode": req.body.location.zipcode,
            "latitude": req.body.location.latitude,
            "longitude": req.body.location.longitude
        },
		"loc": req.body.loc,
        "url": req.body.url,
        "highlights": req.body.highlights,
        "image": req.body.image
    });
    restaurant.save(function(err,newRestaurant){
        if(!err){
            res.send(newRestaurant);
        }else{
            res.sendStatus(400);
        }
    });
};

var findAllRestaurants = function(req,res){
	var query = queryBuilder(req.query);
    Restaurant
		.find(query.query, query.select, query.cursor)
		.exec(function(err,restaurants){
        if(!err){
            res.send(restaurants);
        }else{
			console.log(err);
            res.sendStatus(404);
        }
    });
};

//Search Terms:
//q, type, cuisines, highlights, open(incomplete), near
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
	
	if (query.start) {
		output.cursor.skip = parseInt(query.start);
	}
	
	if (query.limit) {
		output.cursor.limit = parseInt(query.limit);
	}
	//console.log(output)
	return output;
}

var findOneRestaurant = function(req,res){
    var restaurantInx = req.params.id;
    Restaurant.findById(restaurantInx,function(err,restaurant){
        if(!err){
            res.send(restaurant);
        }else{
            res.sendStatus(404);
        }
    });
};

var updateOneRestaurant = function(req,res){
    var restaurantInx = req.params.id;
    Restaurant.findByIdAndUpdate(restaurantInx, req.body , function(err,restaurant){
        if(!err){
            res.send(restaurant);
        }else{
            res.sendStatus(400);
        }
    });
};

var deleteOneRestaurant = function(req,res){
    var restaurantInx = req.params.id;
    Restaurant.findByIdAndRemove(restaurantInx,function(err,restaurant){
        if(!err){
            res.send(restaurant);
        }else{
            res.sendStatus(400);
        }
    });
};

module.exports.createRestaurant = createRestaurant;
module.exports.findAllRestaurants = findAllRestaurants;
module.exports.findOneRestaurant = findOneRestaurant;
module.exports.updateOneRestaurant = updateOneRestaurant;
module.exports.deleteOneRestaurant = deleteOneRestaurant;
