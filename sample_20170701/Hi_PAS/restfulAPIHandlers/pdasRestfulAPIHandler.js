/* PdAS Restful API Handler */
var dbManager = require('../utility/dbManager/commonDBManager');
var pdasDBManager = require('../utility/dbManager/pdasDBManager');

module.exports.PdAS = function (req, res) {
    res.render('./pdas/pdas', { title: 'PdAS' });
}

module.exports.DataAnalysis = function (req, res) {
    var period = req.body.period;

    pdasDBManager.FindCurrentData(1, setResponseData);

    function setResponseData(err, datas) {
        if (err) {
            //console.log(err.message);
            //res.status(500).send('Data find failure');
        }
        else {
            
        }
    }


    var responseData = {
        result : false,
        currentTrendData: {
            labels : [],
            dataSets : [{}]
        },
        performanceData : {},
        performanceTrendData : {},
        cycleData : {}       
    };
    responseData.result = true;
    responseData.currentTrendData.labels = ["January", "February", "March", "April", "May", "June", "July"];
    responseData.currentTrendData.dataSets = [{
        title: "first_element",
        data:[               
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor()
        ]
    },{
        title: "second_element",
        data:[
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor()        
        ]
    }];
    console.log(responseData);
    res.json(responseData);
}

module.exports.CurrentData = function (req, res) {
    var machineRealTimeDataJson = require("../models/pdas/machineRealTimeData.json");
    ///var date = new Date();
    machineRealTimeDataJson.properties.TimeStamp = Date();
    machineRealTimeDataJson.properties.SCNo = 1;
    var drivingMotor = [];
    var hoistingMotor = [];
    var forkMotor = [];
    for (var n = 0; n < 3; n++) {
        var dMotor = new Object();
        dMotor.current = (Math.random() * 20) + 1;
        drivingMotor.push(dMotor);
        var HMotor = new Object();
        HMotor.current = (Math.random() * 20) + 1;
        hoistingMotor.push(HMotor);
        var FMotor = new Object();
        FMotor.current = (Math.random() * 20) + 1;
        forkMotor.push(FMotor);
    }
    machineRealTimeDataJson.properties.DrivingMotor = drivingMotor;
    machineRealTimeDataJson.properties.HoistingMotor = hoistingMotor;
    machineRealTimeDataJson.properties.ForkMotor = forkMotor;

    if (!dbManager.insertMachineCycleData(machineRealTimeDataJson)) {
        console.log("machineRealTimeDataJson Save Fail.");
    }
    else {
        console.log("machineRealTimeDataJson Save Success.");
        res.send(machineRealTimeDataJson);
    }
}

module.exports.CycleData = function (req, res) {
    res.render('./pdas/pdas', { title: 'Cycle Data' });
}

var randomScalingFactor = function() {
    return Math.round(Math.random() * (30-20) + 20);
};
