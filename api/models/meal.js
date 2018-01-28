var mongoose = require('mongoose');

var mealSchema = mongoose.Schema(
    {
        name: {type: String, required: true},
        description: {type: String},
        category: {type: String},
        image: {type: String},
        rating: {type: String, default: '0.0'},
        likes: {type: Number, default: 0},
        price: {type: Number},
		sscore: {type: Number},
        is_popular: {type: Boolean},
        special: {
            is_gf: {type: Boolean},
            is_nf: {type: Boolean},
            is_spicy: {type: Boolean},
            is_vegan: {type: Boolean}
        }, 
        restaurant: {type: mongoose.Schema.ObjectId, ref: 'Restaurant', required: true},
		comments: [{type: mongoose.Schema.ObjectId, ref: 'Comment'}],
		keywords: [{type: String}]
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