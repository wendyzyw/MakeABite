var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema(
    {
        img: {type: String},
        name: {type: String, required: true},
		password: {type: String},
        dob: {type: String},
        email: {type: String, required: true},
        address: {type: String},
        phone: {type: String},
        spicy: {type: String},
        vegan: {type: String},
        gluten: {type: String},
        nuts: {type: String},
        allergies: [{type: String}],
        hate: [{type: String}],
        favourites: [{type: mongoose.Schema.ObjectId, ref: 'Meal'}],
        passwordResetToken: {type: String, default: ''},
        passwordResetExpires: {type: Date, default: Date.now}
        
        // comments: [{tyoe:mongoose.Schema.ObjectId, ref:'Comment'}]
    }
);

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);