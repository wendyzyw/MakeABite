var mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

var mealSchema = mongoose.Schema(
    {
        name: {type: String, required: true},
        description: {type: String},
        category: {type: String},
        image: {type: String},
        rating: {type: String, min: 1, max: 5, default: 5},
        likes: {type: Currency, default: 0},
        price: {type: Number},
        is_popular: {type: String},
        special: {
            is_gf: {type: String},
            is_nf: {type: String},
            is_spicy: {type: String},
            is_vegan: {type: String}
        }, 
        restaurant: {type: mongoose.Schema.ObjectId, ref: 'Restaurant', required: true},
		comments: [{type: mongoose.Schema.ObjectId, ref: 'Comment'}]
    }, {
        timestamps: true
    }
);

mealSchema.index(
    {
        name: "text",
        description: "text"
    },
    {
        weights: {
            name: 2,
            description: 1
        },
        name: "TextIndex"
    });

module.exports = mongoose.model('Meal', mealSchema);
