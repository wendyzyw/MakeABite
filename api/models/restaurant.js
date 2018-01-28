var mongoose = require('mongoose');

var restaurantSchema = mongoose.Schema(
    {
        name: {type: String, required: true},
        type: [{type: String}],
        description: {type: String},
        phone: {type: String},
        cuisines: [{type: String}],
        time: {
            mon: {type: String},
            tue: {type: String},
            wed: {type: String},
            thu: {type: String},
            fri: {type: String},
            sat: {type: String},
            sun: {type: String}
        }, 
        location: {
            address: {type: String},
            locality: {type: String},
            zipcode: {type: String},
            latitude: {type: String},
            longitude: {type: String}
        },
		loc: { 
			'type': {type: String, enum: "Point"}, 
			coordinates: { type: [Number]} 
		},
        url: {type: String},
        highlights: [{type: String}],
        image: {type: String}
    }
);

restaurantSchema.index(
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

restaurantSchema.index(
	{ loc : "2dsphere" }
)

module.exports = mongoose.model('Restaurant', restaurantSchema);