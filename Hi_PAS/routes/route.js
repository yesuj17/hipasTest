/* WEMS API */
var dbManager = require('../utility/dbManager/dbManager');
var RealTimeChartData = require('../models/wems/realTimeChartData');

var wemsRestfulAPIHandler = require('../restfulAPIHandlers/wemsRestfulAPIHandler');
var pdasRestfulAPIHandler = require('../restfulAPIHandlers/pdasRestfulAPIHandler');
var pmsRestfulAPIHandler = require('../restfulAPIHandlers/pmsRestfulAPIHandler');

/* WEMS Restful API Handler */
var wemsGETList = [['/', wemsRestfulAPIHandler.testChart]];
var wemsPOSTList;
var wemsPUTList;
var wemsDELETEList;

/* PdAS Restful API Handler */
var pdasGETList = [['/pdas', pdasRestfulAPIHandler.testPdAS]];
var pdasPOSTList;
var pdasPUTList;
var pdasDELETEList;

/* PMS Restful API Handler */
var pmsGETList = [['/pms', pmsRestfulAPIHandler.testPMS]];
var pmsPOSTList;
var pmsPUTList;
var pmsDELETEList;

var index = 0;
var refreshIntervalId = 0;

module.exports = function (app, io) {
    /* Restful API */
    /* Set WEMS Restful API Handler */
    if (wemsGETList) {
        wemsGETList.forEach(setGETHandler.bind(null, app));
    }

    if (wemsPOSTList) {
        wemsPOSTList.forEach(setPOSTHandler.bind(null, app));
    }

    if (wemsPUTList) {
        wemsPUTList.forEach(setPUTHandler.bind(null, app));
    }

    if (wemsDELETEList) {
        wemsDELETEList.forEach(setDELETEHandler.bind(null, app));
    }

    /* Set PdAS Restful API Handler */
    if (pdasGETList) {
        pdasGETList.forEach(setGETHandler.bind(null, app));
    }

    if (pdasPOSTList) {
        pdasPOSTList.forEach(setPOSTHandler.bind(null, app));
    }

    if (pdasPUTList) {
        pdasPUTList.forEach(setPUTHandler.bind(null, app));
    }

    if (pdasDELETEList) {
        pdasDELETEList.forEach(setDELETEHandler.bind(null, app));
    }

    /* Set PMS Restful API Handler */
    if (pmsGETList) {
        pmsGETList.forEach(setGETHandler.bind(null, app));
    }

    if (pmsPOSTList) {
        pmsPOSTList.forEach(setPOSTHandler.bind(null, app));
    }

    if (pmsPUTList) {
        pmsPUTList.forEach(setPUTHandler.bind(null, app));
    }

    if (pmsDELETEList) {
        pmsDELETEList.forEach(setDELETEHandler.bind(null, app));
    }

    /* Web Socket */
    io.on('connection', function (socket) {
        /// Start Draw Chart Handler
        socket.on('updateChartData', function () {
            /// Start Push Generated Random Data
            refreshIntervalId
                = setInterval(generateChartData, 1000, socket);
        });

        /// Stop Draw Chart Handler
        socket.on('stopChartDataUpdate', function () {
            clearInterval(refreshIntervalId);
            index = 0;
        });
    });
}

/* Restful API Handler */
function setGETHandler(app, data) {
    app.get(data[0], data[1]);
}

function setPOSTHandler(app, data) {
    app.post(data[0], data[1]);
}

function setPUTHandler(app, data) {
    app.put(data[0], data[1]);
}

function setDELETEHandler(app, data) {
    app.delete(data[0], data[1]);
}

/* Generate Chart Data */
function generateChartData(webSocket) {
    var realTimeChartData = require("../models/wems/realTimeChartData.json");
    realTimeChartData.label = index;
    realTimeChartData.point = Math.sin(index);

    if (!dbManager.saveData(realTimeChartData)) {
        console.log("MondoDB Save Fail.");
    }

    console.log("MondoDB Save Success.");

    /// Update Client Chart Data
    webSocket.emit('updateChartData', realTimeChartData);
    console.log("Update Client Chart Data.");

    index++;
}