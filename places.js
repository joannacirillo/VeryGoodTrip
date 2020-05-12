const mongoose = require('mongoose');
const schema = mongoose.Schema({
    type : Object,
    properties : Object,
    geometry : Object
});

module.exports = mongoose.model('places',schema);