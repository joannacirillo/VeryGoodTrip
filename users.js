const mongoose = require('mongoose');
const userScheme = mongoose.Schema({
    userId : String,
    username : String,
    password : String
});

module.exports = mongoose.model('users',userScheme);