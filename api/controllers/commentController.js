var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');

var postComment = function(req, res) {
    var comment = new Comment({
        "username": req.body.username,
        "time": req.body.time,
        "content": req.body.content,
        "rating": req.body.rating,
        //"mealId": req.body.mealId
        "mealId": mongoose.Types.ObjectId(req.body.mealId)
    });
    comment.save(function(err, newComment) {
        if (!err) {
            res.send(newComment);
        } else {
            res.sendStatus(400);
        }
    });
};

var getAllComments = function(req, res) {
    Comment.find(function(err, comments) {
        if (!err) {
            res.send(comments);
        } else {
            res.sendStatus(404);
        }
    });
};

var findMealComments = function(req, res) {
    Comment.find({"mealId":req.params.mealId}, function(err, comment) {
        if (!err) {
            res.send(comment);
        } else {
            res.sendStatus(404);
        }
    });
};


module.exports.postComment = postComment;
module.exports.getAllComments = getAllComments;
module.exports.findMealComments = findMealComments;