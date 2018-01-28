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
        "price":req.body.price,
        "is_popular":req.body.is_popular,
        "special": {
            "is_gf":req.body.special.is_gf,
            "is_nf":req.body.special.is_nf,
            "is_spicy":req.body.special.is_spicy,
            "is_vegan":req.body.special.is_vegan
        }, 
        "restaurant":req.body.restaurant,
		"comments":req.body.comments,
        "timestamps":req.body.timestamps
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
    Meal.find(function(err,meals){
        if(!err){
            res.send(meals);
        }else{
            res.sendStatus(404);
        }
    });
};

var findOneMeal = function(req,res){
    var mealInx = req.params.id;
    Meal
        .findById(mealInx)
        .populate('restaurant')
		.populate('comments')
        .exec(function(err,meal){
            if(!err){
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