/* DB Manager */
var mongoose = require('mongoose');
var generateSchema = require('generate-schema');
var systemConfig = require('../../config/systemConfig');
var async = require('async');
// Connect to Mongo DB
module.exports.connect = function () {
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;

    var db = mongoose.connection;
    db.on('error', console.error);
    db.once('open', function () {
        console.log("Connected to mongo server");
    });

    mongoose
        .connect(systemConfig.db.urls, function () {
            /* Dummy Function */
        })
        .then(() => {
            return true;
        })
        .catch(err => {
            console.error('App starting error:', err.stack);
            console.error("Failed to Connect Mongo DB!");
            process.exit(1);
        });
}

// Insert to Mongo DB
module.exports.insertMachineCycleData = function (data) {
    if (data) {
        var collectionName = data.title;
        var Schema = mongoose.Schema;
        var modelSchema = generateSchema.mongoose(data);
        var mongooseSchema = new Schema(modelSchema);
        var Model = mongoose.model(collectionName, mongooseSchema);
        var model = new Model(data.properties);
        model.save(function (err) {
            if (err) {
                console.error(err);
                return false;
            }
        });

        return true;
    }
}

module.exports.BulkInsert = function (arrData, FnEnd) {
    if (!arrData || arrData.length < 1)
        return FnEnd('Error: Empty Data');

    var schemaName = arrData[0].title;
    var modelSchema = generateSchema.mongoose(arrData[0].properties);
    var Model;
    try {
        Model = mongoose.model(schemaName);
    } catch (err) {
        if (err.name == 'MissingSchemaError')
            Model = mongoose.model(schemaName, modelSchema);
    }
    console.log('Start bulk insert method for ' + schemaName);

    var bulk = Model.collection.initializeOrderedBulkOp();
    var count = 0;
    var remainCount = 0;
    var length = arrData.length;
    async.whilst(function () { return count < length; }, function (callback) {
        bulk.insert(arrData[count].properties);
        count++;
        remainCount++;
        if (count % 1000 === 0) {
            bulk.execute(function (err) {
                if (err) {
                    console.log('error in bulkExecute');
                    callback(err);
                }
                else {
                    console.log('Bulk execute count:' + count);
                    remainCount = 0;
                    bulk = Model.collection.initializeOrderedBulkOp();
                    callback();
                }
            });
        }
        else callback();
    }, function (err) {
        if (err) {
            console.log('error in bulk insert method');
            return FnEnd(err);
        }
        else {
            if (remainCount > 0) {
                bulk.execute(function (err) {
                    if (err) {
                        console.log('error in secondary bulkExecute');
                    }
                    else {
                        console.log('Bulk execute count:' + count);
                        return FnEnd(null, { Title: schemaName, Result: 'Success', DataCount: arrData.length });
                    }
                });
            }
            else
                return FnEnd(null, { Title: schemaName, Result: 'Success', DataCount: arrData.length });
        }
    });
}
// Update to Mongo DB
// Select from Mongo DB
// Delete from Mongo DB
