const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        required: true,
        default: Date.now,
        index: { expires: '1m' }
    }
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
