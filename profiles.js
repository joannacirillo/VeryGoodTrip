const mongoose = require('mongoose');
const userScheme = mongoose.Schema({

    user_id : String,
    username : String,
    interests : [String],
    culinary_pref : [String],
    historical : [String],
    disability : Boolean
});

module.exports = mongoose.model('profiles',userScheme);
