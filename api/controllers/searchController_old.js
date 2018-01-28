var mongoose = require('mongoose');
var Meal = mongoose.model('Meal');

var searchMeals = function(req,res){
    Meal.find(
        {
            $text: { $search: req.query.q },
            price: { $lte: req.query.pricemax, $gte: req.query.pricemin },

        },
        { score: { $meta: "textScore" } })
        .sort( { score: { $meta: "textScore" } } )
		.populate('restaurant')
        .exec(function(err,meals){
            if(!err){
                res.send(meals);
            }else{
                res.sendStatus(404);
            }
        });
};

module.exports.searchMeals = searchMeals;