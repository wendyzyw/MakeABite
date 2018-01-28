var mongoose = require('mongoose');

var restaurantSchema = mongoose.Schema(
    {
        name: {type: String, required: true},
        type: {type: String},
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
        url: {type: String},
        highlights: [{type: String}],
        image: {type: String}
    }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
