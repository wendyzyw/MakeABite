var mongoose = require('mongoose');

var moodSchema = mongoose.Schema(
    {
        name: {type: String, required: true},
        ingredients: {}
    }, {
        timestamps: true
    }
);

module.exports = mongoose.model('Mood', moodSchema);