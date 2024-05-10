const mongoose = require('mongoose');

const device = new mongoose.Schema(
    {
        devicename: {type: String, required: true},
        devicetype: {type: String, required: true},
        devicestatus: {type: Boolean, required: true},
    },
    {collection: 'devices'}
)

const model = mongoose.model('DeviceData', device)

module.exports = model