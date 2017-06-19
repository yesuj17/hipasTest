/* DB Manager */
/// Regist Mongo DB Schema
var mongoose = require('mongoose');
var generateSchema = require('generate-schema');
var systemConfig = require('../../config/systemConfig');

/// WEMS Model Schema
var realTimeChartDataSchema = generateSchema.mongoose(require('../../models/wems/realTimeChartData.json'));

/// PMS Model Schema
/// PdAS Model Schema

var modelSchemaList = [];

var wemsModelSchemaList = [['realTimeChartData', realTimeChartDataSchema]];
var pmsModelSchemaList;
var pdasModelSchemaList;

/// Connect to Mongo DB
module.exports.connect = function () {
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;

    var db = mongoose.connection;
    db.on('error', console.error);
    db.once('open', function () {
        console.log("Connected to mongo server");
    });

    mongoose.connect(systemConfig.db.urls, function () { /* dummy function */ })
        .then(() => {
            registDBSchemas();
            return true;
        })
        .catch(err => { /// mongoose connection error will be handled here
            console.error('App starting error:', err.stack);
            process.exit(1);
        });
}

/// Save to Mongo DB
module.exports.saveData = function (data) {
    if (data) {
        var modelSchema = generateSchema.mongoose(data);
        var collectionName = findCollectionName(modelSchema);

        if (!collectionName) {
            return false;
        }

        var Model = mongoose.model(collectionName);
        var model = new Model(data);
        model.save(function (err) {
            if (err) {
                console.error(err);
                return false;
            }
        });

        return true;
    }
}

/// Regist DB Schemas
function registDBSchemas() {
    if (wemsModelSchemaList) {
        wemsModelSchemaList.forEach(registDBSchema);
    }

    if (pmsModelSchemaList) {
        pmsModelSchemaList.forEach(registDBSchema);
    }

    if (pdasModelSchemaList) {
        pdasModelSchemaList.forEach(registDBSchema);
    }
}

/// Regist DB Schema
function registDBSchema(model) {
    var Schema = mongoose.Schema;
    var modelSchema = new Schema(model[1]);
    module.exports = mongoose.model(model[0], modelSchema);

    modelSchemaList.push(model[1]);
}

/// Fine Collection Name
function findCollectionName(modelSchema) {
    var collectionName;
    if (wemsModelSchemaList) {
        wemsModelSchemaList.forEach(function (data) {
            if (JSON.stringify(modelSchema) == JSON.stringify(data[1])) {
                collectionName = data[0];
                return;
            }
        });
    }

    if (pmsModelSchemaList) {
        pmsModelSchemaList.forEach(function (data) {
            if (JSON.stringify(modelSchema) == JSON.stringify(data[1])) {
                collectionName = data[0];
                return;
            }
        });
    }

    if (pdasModelSchemaList) {
        pdasModelSchemaList.forEach(function (data) {
            if (JSON.stringify(modelSchema) == JSON.stringify(data[1])) {
                collectionName = data[0];
                return;
            }
        });
    }

    return collectionName;
}