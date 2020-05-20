const mongoose = require('mongoose');
const userScheme = mongoose.Schema({
    user_id : Number,
    username : String,
    interests : [String],
    culinary_pref : [String],
    historical : [String],
    disablity : Boolean
});

module.exports = mongoose.model('profiles',userScheme);