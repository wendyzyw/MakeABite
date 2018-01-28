var mongoose = require('mongoose');
var Meal = mongoose.model('Meal');
var Mood = mongoose.model('Mood');

var createMood = function(req,res){
    var mood = new Mood({
        "name":req.body.name,
        "ingredients":req.body.ingredients,
    });
    mood.save(function(err,newMood){
        if(!err){
            res.send(newMood);
        }else{
            res.sendStatus(400);
        }
    });
};

var findMood = function(req,res){
    var moodInx = req.params.id;
    Mood.findById(moodInx)
        .exec(function(err,mood){
            if(!err){
				Meal
				.find()
				.exec(function(err,meals){
					if(!err){
				        for (var i = 0; i < meals.length; i++) {
							var score = 0;
							for (var key in mood.ingredients) {
								if (meals[i].keywords.indexOf(key) != -1) {
									score += mood.ingredients[key];
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
            }else{
                res.sendStatus(404);
            }
        });
};

var updateMood = function(req,res){
	var moodInx = req.params.id;
	Meal.findById(req.body.id)
        .exec(function(err,meal){
            if(!err){
			Mood.findById(moodInx)
		        .exec(function(err,mood){
		            if(!err){
						for (var i = 0; i < meal.keywords.length; i++) {
							if (meal.keywords[i] in mood.ingredients){
								mood.ingredients[meal.keywords[i]] += 1;
							} else {
								mood.ingredients[meal.keywords[i]] = 1;
							}
						}
					    Mood.findByIdAndUpdate(moodInx, {ingredients:mood.ingredients} , function(err,newmood){
					        if(!err){
					            res.send(newmood);
					        }else{
					            res.sendStatus(400);
					        }
					    });
				
		            }else{
		                res.sendStatus(404);
		            }
		        });
            }else{
                res.sendStatus(404);
            }
        });
		
	
    
};

var findAllMoods = function(req, res) {
    Mood.find(function(err, moods) {
        if (!err) {
            res.send(moods);
        } else {
            res.sendStatus(404);
        }
    });
};

module.exports.createMood = createMood;
module.exports.findMood = findMood;
module.exports.updateMood = updateMood;
module.exports.findAllMoods = findAllMoods;