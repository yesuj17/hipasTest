/* DB Manager */
/// Regist Mongo DB Schema
var mongoose = require('mongoose');
var generateSchema = require('generate-schema');
var realTimeChartData = require('../../models/wems/realTimeChartData.json');

var modelNameList = [];

var wemsModelList = [['realTimeChartData', realTimeChartData]];
var pmsModelList;
var pdasModelList;

module.exports.registDBSchemas = function () {
    wemsModelList.forEach(registDBSchema);
}

/// Connect to Mongo DB
module.exports.connect = function () {
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;

    var db = mongoose.connection;
    db.on('error', console.error);
    db.once('open', function () {
        console.log("Connected to mongo server");
    });

    mongoose.connect('mongodb://localhost:27017/mongodb_hipas', function () { /* dummy function */ })
        .then(() => {
            registDBSchemas();
        })
        .catch(err => { /// mongoose connection error will be handled here
            console.error('App starting error:', err.stack);
            process.exit(1);
        });
}

/// Save to Mongo DB
module.exports.saveData = function (modelName, data) {
    if (data) {
        if (!modelNameList.find(modelName)) {
            registDBSchema(data);
        }

        var Model = mongoose.model(modelName);

        var model = new Model();
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
    if (wemsModelList) {
        wemsModelList.forEach(registDBSchema);
    }

    if (pmsModelList) {
        pmsModelList.forEach(registDBSchema);
    }

    if (pdasModelList) {
        pdasModelList.forEach(registDBSchema);
    }
}

/// Regist DB Schema
function registDBSchema(model) {
    var Schema = mongoose.Schema;
    var modelSchema = new Schema(generateSchema.mongoose(model[1]));
    module.exports = mongoose.model(model[0], modelSchema);

    modelNameList.push(model[0]);
}