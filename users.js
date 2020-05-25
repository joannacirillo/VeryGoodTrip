const mongoose = require('mongoose');
const userScheme = mongoose.Schema({
    username : String,
    password : String,
    user_id : String
});

module.exports = mongoose.model('users',userScheme,"users");
