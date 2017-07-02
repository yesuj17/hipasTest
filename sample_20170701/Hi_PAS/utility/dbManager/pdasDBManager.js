var mongoose = require('mongoose');
var systemConfig = require('../../config/systemConfig');
// Insert to Mongo DB
// Update to Mongo DB
// Select from Mongo DB
// Delete from Mongo DB
module.exports.FindCurrentData = function (period, FnEnd) {
    var schema = new mongoose.Schema({
        TimeStamp: Date,
        SCNo: Number,
        DrivingMotor: [{ current: Number }],
        HoistingMotor: [{ current: Number }],
        ForkMotor: [{ current: Number }]
    });

    var Model;
    try {
        Model = mongoose.model('machineRealTimeData');
    } catch (err) {
        Model = mongoose.model('machineRealTimeData', schema);
    }

    var fromDate = new Date();
    var toDate = new Date();
    fromDate.setDate(fromDate.getDate() - period);

    Model.aggregate([
        { $match: { TimeStamp: { $gt: fromDate, $lte: new Date() } } },
        { $group: { _id: '$SCNo', } },
    ], function (err, resultData) {
        if (err) {
            return FnEnd(err);
        }
        else {
            //console.log(resultData)
            return FnEnd(null, resultData);
        }
    });
}

var modelSchema = function () {
    return {
        'TimeStamp': Date,
        'SCNo': Number,
        'DrivingMotor': [{ current: Number }],
        'HoistingMotor': [{ current: Number }],
        'ForkMotor': [{ current: Number }]
    };
}
