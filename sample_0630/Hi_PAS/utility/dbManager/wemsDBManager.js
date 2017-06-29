var mongoose = require('mongoose');
var generateSchema = require('generate-schema');
var createMongooseSchema = require('json-schema-to-mongoose');
var async = require('async');

// Insert to Mongo DB
// Update to Mongo DB
// Select from Mongo DB
module.exports.getMachineCycleData = getMachineCycleData;

// Delete from Mongo DB

// WEMS DB Manager Function
// Get Machine Cycle Data
function getMachineCycleData(period, deviceID, callback) {
    var machineCycleData = require("../../models/pdas/machineCycleData.json");
    var machineCycleDataSchema = createMongooseSchema(machineCycleData, machineCycleData);
    var MachineCycleData;
    try {
        MachineCycleData = mongoose.model(machineCycleData.title);
    } catch (err) {
        if (err.name == 'MissingSchemaError')
            MachineCycleData = mongoose.model(machineCycleData.title, machineCycleDataSchema);
    }

    async.waterfall([
        function (next) {
            MachineCycleData.
                findOne().
                where('TotalStartTime').lt(period.startDate).
                where('SC_No').equals(deviceID).
                select('SC_No TotalStartTime TotalEndTime DrivingInfo HoistingInfo ForkInfo').
                sort('-TotalStartTime').
                exec(next);
        },
        function (doc, next) {
            MachineCycleData.
                find().
                where("TotalStartTime").gte(period.startDate).
                where("TotalEndTime").lte(period.endDate).
                where('SC_No').equals(deviceID).
                select('SC_No TotalStartTime TotalEndTime DrivingInfo HoistingInfo ForkInfo').
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
    ], callback);

    /* XXX
    var machineCycleDataList = [];

    MachineCycleData.
        findOne().
        where('TotalStartTime').lt(period.startDate).
        sort('-TotalStartTime').
        exec(function (err, doc) {
            if (err) {
                console.error(err);
                return false;
            }

            machineCycleDataList.push(doc);

            MachineCycleData.
                find().
                where("TotalStartTime").gte(period.startDate).
                where("TotalEndTime").lte(period.endDate).
                sort('TotalStartTime').
                exec(function (err, docs) {
                    if (err) {
                        console.error(err);
                        return false;
                    }

                    machineCycleDataList.concat(docs);
                });
        });
    */
}
