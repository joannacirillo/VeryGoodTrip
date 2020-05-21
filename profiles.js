const mongoose = require('mongoose');
const userScheme = mongoose.Schema({
    user_id : String,
    cluster : Array,
    interests : Array,
    cuisine : Array,
    historical : Array,
    disability : Boolean,
    previous : Array
});

module.exports = mongoose.model('profiles',userScheme,'profiles');
