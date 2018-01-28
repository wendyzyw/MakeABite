var mongoose = require('mongoose');

var commentSchema = mongoose.Schema(
    {
        "username": {type: String, default:"anonymous"},
        "time": String,
        "content": {type: String, default: ""},
        "rating": {type: String, required: true},
        "mealId": {type: mongoose.Schema.ObjectId, ref: 'Meal', required: true}
        // "archived": {type: Boolean, default: false}
    }
);
mongoose.model('Comment', commentSchema);