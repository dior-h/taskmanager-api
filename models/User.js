const mongoose = require('mongoose');
const { use } = require('../routes/root');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [{
        type: String,
        default: "Standard"
    }],
    active: {
        type: Boolean,
        default: true
    },
});

module.exports = mongoose.model('User', userSchema);