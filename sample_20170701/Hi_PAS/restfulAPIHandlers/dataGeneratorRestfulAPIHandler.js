﻿var dbManager = require('../utility/dbManager/dataGenDBManager.js');
var async = require('async');

var machineRealTimeDataJson = require("../models/machine/machineRealTimeData.json");
var machineCycleDataJson = require("../models/machine/machineCycleData.json");
var machineErrorDataJson = require("../models/machine/machineErrorData.json");
var simpleCycleDataJson = require("../models/DataGenerator/simpleCycleData.json");

module.exports.DataGenerator = function (req, res) {
    res.render('./dataGenerator', { title: 'Generate dummy data' });
}

module.exports.GenerateDummyData = function (req, res) {
    // Todo: 동일 기간내 데이터 삭제
    var arrMCRealTimeData = [];
    var arrMachineCycleData = [];
    var arrErrorData = [];
    async.series([
        function (callback) {
            GenerateMachineRealTimeData(req, arrMCRealTimeData);
            dbManager.MachineInfoBulkInsert(arrMCRealTimeData, callback);
        },
        function (callback) {
            GenerateMachineCycleData(req, arrMachineCycleData, arrErrorData);
            dbManager.MachineCycleDataBulkInsert(arrMachineCycleData, callback);
        },
        function (callback) {
            if (arrErrorData.length > 0)
                dbManager.MachineErrorDataBulkInsert(arrErrorData, callback);
            else callback();
        }
    ], function (err, result) {
        if (err) {
            console.log(err.message);
            res.status(500).send(err.message);
        }
        else {
            console.log(result);
            res.json(result);
        }
    });
}

var AddSeconds = function (currTime, addSeconds) {
    currTime.setTime(currTime.getTime() + (addSeconds * 1000));
}

var GenerateMachineRealTimeData = function (req, arrMCRealTimeData) {
    const baseWorkHour = 2;

    var periodFrom = new Date(req.body.periodFrom + "T08:00:00Z");  //작업시작시간 초기화
    var periodTo = new Date(req.body.periodTo);
    var SCCnt = req.body.SCCnt;

    for (var tmpDate = new Date(periodFrom); tmpDate <= periodTo; tmpDate.setDate(tmpDate.getDate() + 1)) {
        var timeStamp = new Date(tmpDate);
        for (var cnt = 1; cnt < (baseWorkHour * 3600); cnt += 2) {  // 한번에 2건(초)의 전류 Data 가 들어온다 가정 
            // dummy data 생성
            var machineRealTimeData = JSON.parse(JSON.stringify(machineRealTimeDataJson));
            AddSeconds(timeStamp, 2);    //time-stamp 2초씩 증가.
            machineRealTimeData.TimeStamp = new Date(timeStamp);
            machineRealTimeData.SCNo = Math.floor(Math.random() * SCCnt + 1);
            var drivingMotor = [];
            var hoistingMotor = [];
            var forkMotor = [];
            for (var n = 0; n < 2; n++) {
                var dMotor = {
                    current: (Math.random() * (40 - 21)) + 20
                };
                drivingMotor.push(dMotor);
                var HMotor = {
                    current: (Math.random() * (40 - 21)) + 20
                };
                hoistingMotor.push(HMotor);
                var FMotor = {
                    current: (Math.random() * (40 - 21)) + 20
                };
                forkMotor.push(FMotor);
            }
            machineRealTimeData.DrivingMotor = drivingMotor;
            machineRealTimeData.HoistingMotor = hoistingMotor;
            machineRealTimeData.ForkMotor = forkMotor;
            arrMCRealTimeData.push(machineRealTimeData);
        }
    }
}

var GenerateMachineCycleData = function (req, arrMachineCycleData, arrErrorData) {
    var workLoad = req.body.workLoad;
    var SCCnt = req.body.SCCnt;
    var errRate = req.body.errRate;

    var periodFrom = new Date(req.body.periodFrom + "T08:00:00Z");  //작업시작시간 초기화
    var periodTo = new Date(req.body.periodTo);
    // 각 호기별 일일작업 정보 저장
    var arrTmpMachineCycleData = [];
    for (var cnt = 1; cnt <= SCCnt; cnt++) {
        var tmpMachineCycleData = JSON.parse(JSON.stringify(simpleCycleDataJson));
        tmpMachineCycleData.scNo = cnt;
        var arrMotorCycleInfo = [];
        for (var n = 0; n < 4; n++) {
            var motorCycleInfo = new Object();
            motorCycleInfo.type = n;
            motorCycleInfo.MoveStartTime = "";
            motorCycleInfo.MoveEndTime = "";
            motorCycleInfo.MoveDistance = 0;
            motorCycleInfo.MotorBreakCount = 0;
            motorCycleInfo.BreakDiscCount = 0;
            motorCycleInfo.BreakMCCount = 0;
            motorCycleInfo.BreakRollerCount = 0;
            motorCycleInfo.BreakRectifierCount = 0;
            motorCycleInfo.PowerConsumption = 0;
            arrMotorCycleInfo.push(motorCycleInfo);
        }
        tmpMachineCycleData.MotorCycleInfo = arrMotorCycleInfo;
        arrTmpMachineCycleData.push(tmpMachineCycleData);
    }

    for (var tmpDate = new Date(periodFrom); tmpDate <= periodTo; tmpDate.setDate(tmpDate.getDate() + 1)) {
        //일간 작업정보 초기화
        var dailyWorkLoad = workLoad;
        for (cnt = 0; cnt < SCCnt; cnt++) {
            arrTmpMachineCycleData[cnt].workLoad = 0;
            arrTmpMachineCycleData[cnt].jobID = 1;
            arrTmpMachineCycleData[cnt].currTime = new Date(tmpDate);
        }
        // 하루 물동량만큼 cycle date 생성
        while (dailyWorkLoad > 0) {
            // 물동량이 가장 적게 할당된 호기 선택
            var byWorkLoad = arrTmpMachineCycleData.slice(0);
            byWorkLoad.sort(function (a, b) { return a.workLoad - b.workLoad; });
            var targetSC = byWorkLoad[0];
            // Dummy data 생성
            var machineCycleData = JSON.parse(JSON.stringify(machineCycleDataJson));
            machineCycleData.JobID = targetSC.jobID++;
            machineCycleData.JobType = targetSC.JobType == 0 ? 1 : 0;
            machineCycleData.SCNo = targetSC.scNo;

            var cycleTime = 0;
            if (targetSC.JobType = 0)
                cycleTime = Math.floor((Math.random() * (118 - 72)) + 71);
            else
                cycleTime = Math.floor((Math.random() * (135 - 84)) + 83);

            var startTime = new Date(targetSC.currTime);
            var endTime = new Date(startTime);
            AddSeconds(endTime, cycleTime);
            // ErrData 생성.
            if (Math.random() < errRate) {
                arrErrorData.push(GenerateErrorData(targetSC));
                continue;
            }
            var arrDrivingInfo = [];
            var arrUpperDrivingInfo = [];
            var arrHoistingInfo = [];
            var arrForkInfo = [];
            for (var PatternCnt = 0; PatternCnt < 2; PatternCnt++) {
                // 주행
                targetSC.MotorCycleInfo[0].PowerConsumption += Math.floor((Math.random() * (2500 - 2001)) + 2000);
                var drivingInfo = {
                    MoveStartTime: targetSC.currTime,
                    MoveEndTime: "",
                    MoveDistance: targetSC.MotorCycleInfo[0].MoveDistance + 5000, //단위 cm
                    MotorPowerConsumption: targetSC.MotorCycleInfo[0].PowerConsumption, //단위w
                    MotorBreakCount: ++targetSC.MotorCycleInfo[0].MotorBreakCount
                };
                AddSeconds(targetSC.currTime, 20);  //20초 증가
                drivingInfo.MoveEndTime = targetSC.currTime;
                arrDrivingInfo.push(drivingInfo);
                // 주행상부
                var upperDrivingInfo = {
                    BreakDiscCount: ++targetSC.MotorCycleInfo[3].BreakDiscCount,
                    BreakRollerCount: ++targetSC.MotorCycleInfo[3].BreakRollerCount,
                    BreakMCCount: ++targetSC.MotorCycleInfo[3].BreakMCCount,
                    BreakRectifierCount: ++targetSC.MotorCycleInfo[3].BreakRectifierCount
                };
                arrUpperDrivingInfo.push(upperDrivingInfo);
                // 승강
                targetSC.MotorCycleInfo[1].PowerConsumption += Math.floor((Math.random() * (2700 - 2301)) + 2300);
                var hoistingInfo = {
                    MoveStartTime: targetSC.currTime,
                    MoveEndTime: "",
                    MoveDistance: targetSC.MotorCycleInfo[1].MoveDistance + 1500,
                    MotorPowerConsumption: targetSC.MotorCycleInfo[1].PowerConsumption,
                    MotorBreakCount: ++targetSC.MotorCycleInfo[1].MotorBreakCount,
                    BreakMCCount: ++targetSC.MotorCycleInfo[1].BreakMCCount,
                };
                AddSeconds(targetSC.currTime, 20);
                hoistingInfo.MoveEndTime = targetSC.currTime;
                arrHoistingInfo.push(hoistingInfo);
                // 포크
                targetSC.MotorCycleInfo[2].PowerConsumption += Math.floor((Math.random() * (2500 - 2001)) + 2000);
                var forkInfo = {
                    MoveStartTime: targetSC.currTime,
                    MoveEndTime: "",
                    MoveDistance: targetSC.MotorCycleInfo[2].MoveDistance + 500,
                    MotorPowerConsumption: targetSC.MotorCycleInfo[2].PowerConsumption,
                    MotorBreakCount: ++targetSC.MotorCycleInfo[2].MotorBreakCount,
                    BreakMCCount: ++targetSC.MotorCycleInfo[2].BreakMCCount,
                };
                AddSeconds(targetSC.currTime, 20);
                forkInfo.MoveEndTime = targetSC.currTimea;
                arrForkInfo.push(forkInfo);
            }
            machineCycleData.DrivingInfo = arrDrivingInfo;
            machineCycleData.UpperDrivingInfo = arrUpperDrivingInfo;
            machineCycleData.HoistingInfo = arrHoistingInfo;
            machineCycleData.ForkInfo = arrForkInfo;
            machineCycleData.TotalStartTime = startTime;
            machineCycleData.TotalEndTime = endTime;

            targetSC.LaserDistanceMeterTotalUsedTime += endTime - startTime;
            targetSC.OpticalRepeaterTotalUsedTime += endTime - startTime;
            machineCycleData.LaserDistanceMeterTotalUsedTime = targetSC.LaserDistanceMeterTotalUsedTime; //ms
            machineCycleData.OpticalRepeaterTotalUsedTime = targetSC.OpticalRepeaterTotalUsedTime; //ms
            machineCycleData.Weight = 100;
            machineCycleData.InventoryCount = 200;

            arrMachineCycleData.push(machineCycleData);
            byWorkLoad[0].workLoad++;
            dailyWorkLoad--;
        }
    }
}


//var GenerateMachineRealTimeData = function (req, res, cb) {
//    const baseWorkHour = 4;

//    var periodFrom = new Date(req.body.periodFrom + "T08:00:00Z");  //작업시작시간 초기화
//    var periodTo = new Date(req.body.periodTo);

//    var arrMCRealTimeData = [];
//    for (var tmpDate = new Date(periodFrom); tmpDate <= periodTo; tmpDate.setDate(tmpDate.getDate() + 1)) {
//        var timeStamp = new Date(tmpDate);
//        for (var cnt = 1; cnt < (baseWorkHour * 3600); cnt += 2) {  // 한번에 2건(초)의 전류 Data 가 들어온다 가정 
//            // dummy data 생성
//            var machineRealTimeData = JSON.parse(JSON.stringify(machineRealTimeDataJson));
//            AddSeconds(timeStamp, 2);    //time-stamp 2초씩 증가.
//            machineRealTimeData.TimeStamp = timeStamp.toJSON();
//            machineRealTimeData.SCNo = 1;
//            var drivingMotor = [];
//            var hoistingMotor = [];
//            var forkMotor = [];
//            for (var n = 0; n < 2; n++) {
//                var dMotor = {
//                    current : (Math.random() * (40 - 21)) + 20
//                };
//                drivingMotor.push(dMotor);
//                var HMotor = {
//                    current : (Math.random() * (40 - 21)) + 20
//                };
//                hoistingMotor.push(HMotor);
//                var FMotor = {
//                    current : (Math.random() * (40 - 21)) + 20
//                };
//                forkMotor.push(FMotor);
//            }
//            machineRealTimeData.DrivingMotor = drivingMotor;
//            machineRealTimeData.HoistingMotor = hoistingMotor;
//            machineRealTimeData.ForkMotor = forkMotor;
//            arrMCRealTimeData.push(machineRealTimeData);
//        }
//    }
//    dbManager.InsertMany(arrMCRealTimeData, function (err, result) {
//        if (err) {
//            return cb(err);
//        }
//        delete arrMCRealTimeData;
//    });
//    cb(null, "Success to Generate machine Real-Time data.");
//}

//var GenerateMachineCycleData = function (req, res, callback) {
//    var workLoad = req.body.workLoad;
//    var SCCnt = req.body.SCCnt;
//    var errRate = req.body.errRate;

//    var periodFrom = new Date(req.body.periodFrom + "T08:00:00Z");  //작업시작시간 초기화
//    var periodTo   = new Date(req.body.periodTo);
//    // 각 호기별 일일작업 정보 저장
//    var arrTmpMachineCycleData = [];
//    for (var cnt = 1; cnt <= SCCnt; cnt++) {
//        var tmpMachineCycleData = JSON.parse(JSON.stringify(simpleCycleDataJson));
//        tmpMachineCycleData.scNo = cnt;
//        var arrMotorCycleInfo = [];
//        for (var n = 0; n < 4; n++) {
//            var motorCycleInfo = new Object();
//            motorCycleInfo.type = n;
//            motorCycleInfo.MoveStartTime = "";
//            motorCycleInfo.MoveEndTime = "";
//            motorCycleInfo.MoveDistance = 0;
//            motorCycleInfo.MotorBreakCount = 0;
//            motorCycleInfo.BreakDiscCount = 0;
//            motorCycleInfo.BreakMCCount = 0;
//            motorCycleInfo.BreakRollerCount = 0;
//            motorCycleInfo.BreakRectifierCount = 0;
//            arrMotorCycleInfo.push(motorCycleInfo);
//        }
//        tmpMachineCycleData.MotorCycleInfo = arrMotorCycleInfo;
//        arrTmpMachineCycleData.push(tmpMachineCycleData);
//    }

//    var arrMachineCycleData = [];
//    var arrErrorData = [];
//    for (var tmpDate = new Date(periodFrom); tmpDate <= periodTo; tmpDate.setDate(tmpDate.getDate() + 1)) {
//        //일간 작업정보 초기화
//        var dailyWorkLoad = workLoad;
//        for (cnt = 0; cnt < SCCnt; cnt++) {
//            arrTmpMachineCycleData[cnt].workLoad = 0;
//            arrTmpMachineCycleData[cnt].jobID = 1;
//            arrTmpMachineCycleData[cnt].currTime = new Date(tmpDate);
//        }
//        // 하루 물동량만큼 cycle date 생성
//        while (dailyWorkLoad > 0) {
//            // 물동량이 가장 적게 할당된 호기 선택
//            var byWorkLoad = arrTmpMachineCycleData.slice(0);
//            byWorkLoad.sort(function (a, b) { return a.workLoad - b.workLoad; });
//            var targetSC = byWorkLoad[0];
//            // Dummy data 생성
//            var machineCycleData = JSON.parse(JSON.stringify(machineCycleDataJson));
//            machineCycleData.JobID = targetSC.jobID++;
//            machineCycleData.JobType = targetSC.JobType == 0 ? 1 : 0;
//            machineCycleData.SCNo = targetSC.scNo;

//            var cycleTime = 0;
//            if (targetSC.JobType = 0)
//                cycleTime = Math.floor((Math.random() * (118 - 72)) + 71);
//            else
//                cycleTime = Math.floor((Math.random() * (135 - 84)) + 83);

//            var startTime = new Date(targetSC.currTime);
//            var endTime   = new Date(startTime);
//            AddSeconds(endTime, cycleTime);
//            // ErrData 생성.
//            if (Math.random() < errRate) {
//                arrErrorData.push(GenerateErrorData(targetSC));
//                continue;
//            }
//            var arrDrivingInfo = [];
//            var arrUpperDrivingInfo = [];
//            var arrHoistingInfo = [];
//            var arrForkInfo = [];
//            for (var PatternCnt = 0; PatternCnt < 2; PatternCnt++) {
//                // 주행
//                var drivingInfo = {
//                    MoveStartTime: targetSC.currTime.toJSON(),
//                    MoveEndTime: "",
//                    MoveDistance: targetSC.MotorCycleInfo[0].MoveDistance + 5000, //단위 cm
//                    MotorPowerConsumption: Math.floor((Math.random() * (2500 - 2001)) + 2000), //단위w
//                    MotorBreakCount: ++targetSC.MotorCycleInfo[0].MotorBreakCount
//                };
//                AddSeconds(targetSC.currTime, 20);  //20초 증가
//                drivingInfo.MoveEndTime = targetSC.currTime.toJSON();
//                arrDrivingInfo.push(drivingInfo);
//                // 주행상부
//                var upperDrivingInfo = {
//                    BreakDiscCount: ++targetSC.MotorCycleInfo[3].BreakDiscCount,
//                    BreakRollerCount: ++targetSC.MotorCycleInfo[3].BreakRollerCount,
//                    BreakMCCount: ++targetSC.MotorCycleInfo[3].BreakMCCount,
//                    BreakRectifierCount : ++targetSC.MotorCycleInfo[3].BreakRectifierCount
//                };
//                arrUpperDrivingInfo.push(upperDrivingInfo);
//                // 승강
//                var hoistingInfo = {
//                    MoveStartTime : targetSC.currTime.toJSON(),
//                    MoveEndTime: "",
//                    MoveDistance: targetSC.MotorCycleInfo[1].MoveDistance + 1500,
//                    MotorPowerConsumption: Math.floor((Math.random() * (2700 - 2301)) + 2300),
//                    MotorBreakCount: ++targetSC.MotorCycleInfo[1].MotorBreakCount,
//                    BreakMCCount : ++targetSC.MotorCycleInfo[1].BreakMCCount,
//                };
//                AddSeconds(targetSC.currTime, 20);
//                hoistingInfo.MoveEndTime = targetSC.currTime.toJSON();
//                arrHoistingInfo.push(hoistingInfo);
//                // 포크
//                var forkInfo = {
//                    MoveStartTime: targetSC.currTime.toJSON(),
//                    MoveEndTime: "",
//                    MoveDistance: targetSC.MotorCycleInfo[2].MoveDistance + 500,
//                    MotorPowerConsumption: Math.floor((Math.random() * (2500 - 2001)) + 2000),
//                    MotorBreakCount: ++targetSC.MotorCycleInfo[2].MotorBreakCount,
//                    BreakMCCount : ++targetSC.MotorCycleInfo[2].BreakMCCount,
//                };
//                AddSeconds(targetSC.currTime, 20);
//                forkInfo.MoveEndTime  = targetSC.currTime.toJSON();
//                arrForkInfo.push(forkInfo);
//            }
//            machineCycleData.DrivingInfo = arrDrivingInfo;
//            machineCycleData.UpperDrivingInfo = arrUpperDrivingInfo;
//            machineCycleData.HoistingInfo = arrHoistingInfo;
//            machineCycleData.ForkInfo = arrForkInfo;
//            machineCycleData.TotalStartTime = startTime;
//            machineCycleData.TotalEndTime = endTime;

//            targetSC.LaserDistanceMeterTotalUsedTime += endTime - startTime;
//            targetSC.OpticalRepeaterTotalUsedTime += endTime - startTime;
//            machineCycleData.LaserDistanceMeterTotalUsedTime = targetSC.LaserDistanceMeterTotalUsedTime; //ms
//            machineCycleData.OpticalRepeaterTotalUsedTime = targetSC.OpticalRepeaterTotalUsedTime; //ms
//            machineCycleData.Weight = 100;
//            machineCycleData.InventoryCount = 200;

//            arrMachineCycleData.push(machineCycleData);
//            byWorkLoad[0].workLoad++;
//            dailyWorkLoad--;
//        }
//    }

//    dbManager.InsertMany(arrMachineCycleData, function (err, result) {
//        if (err) {
//            return callback(err);
//        }
//        delete arrMachineCycleData;
//    });
//    dbManager.InsertMany(arrErrorData, function (err, result) {
//        if (err) {
//            return callback(err);
//        }
//        delete arrMachineCycleData;
//    });
//    callback(null, "Generate machine cycle & Error Data OK.");
//}

var GenerateErrorData = function (cycleInfo) {
    var errorData = JSON.parse(JSON.stringify(machineErrorDataJson));
    errorData.SCNo = cycleInfo.scNo;
    errorData.CurrDate = cycleInfo.currTime;
    errorData.JobNo = cycleInfo.jobID;
    errorData.ErrCode = Math.floor(Math.random() * 1000) + 1;
    errorData.ErrMsg = "Dummy error message";
    return errorData;
}