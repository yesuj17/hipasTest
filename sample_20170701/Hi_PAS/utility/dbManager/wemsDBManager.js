var MachineCycleDataSchema = require('../../models/dbSchema/MachineCycleDataSchema.js');
var async = require('async');

function WemsDBManager() {
}

// Insert to Mongo DB
// Update to Mongo DB
// Select from Mongo DB
WemsDBManager.prototype.getMachineCycleData = function(period, deviceID, next) {
    async.waterfall([
        function (next) {
            MachineCycleDataSchema.
                findOne().
                where('TotalStartTime').lt(period.startDate).
                where('SCNo').equals(deviceID).
                select('SCNo TotalStartTime TotalEndTime DrivingInfo HoistingInfo ForkInfo').
                sort('-TotalStartTime').
                exec(function (err, doc) {
                    if (err) {
                        console.error(err);
                        return false;
                    }

                    next(err, doc);
                });
        },
        function (doc, next) {
            MachineCycleDataSchema.
                find().
                where("TotalStartTime").gte(period.startDate).
                where("TotalEndTime").lte(period.endDate).
                where('SCNo').equals(deviceID).
                select('SCNo TotalStartTime TotalEndTime DrivingInfo HoistingInfo ForkInfo').
                sort('TotalStartTime').
                exec(function (err, docs) {
                    if (err) {
                        console.error(err);
                        return false;
                    }

                    next(err, doc, docs);
                });
        },
        function (doc, docs, next) {
            /* Post processing data */
            var machineCycleDataList = [];
            machineCycleDataList.push(doc);
            var resultMachineCycleDataList
                = machineCycleDataList.concat(docs);

            next(resultMachineCycleDataList);
        }
    ], next);
}

// Delete from Mongo DB

module.exports = WemsDBManager;
