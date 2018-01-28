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
    Restaurant.find(function(err,restaurants){
        if(!err){
            res.send(restaurants);
        }else{
            res.sendStatus(404);
        }
    });
};

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