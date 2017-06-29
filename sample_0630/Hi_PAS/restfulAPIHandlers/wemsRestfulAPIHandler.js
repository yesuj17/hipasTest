// WEMS Restful API Handler
var wemsDBManager = require('../utility/dbManager/wemsDBManager');
var machineAnalysisData = require('../models/wems/machineAnalysisData.json');

// GET Restful API Handler
module.exports.getAnalysisData = function (req, res) {
    if (!wemsDBManager) {
        return;
    }

    var startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    var endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    var period = {
        startDate: startDate,
        endDate: endDate
    }

    if (req.query.startDate && req.query.endDate) {
        period.startDate = new Date(req.query.startDate);
        period.endDate = new Date(req.query.endDate);
    }

    /* XXX Must Get DeviceID From DB */
    var deviceIDList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    var machineCycleDataPerDeviceList = [];
    deviceIDList.forEach(generateDeviceMachineCycleDataHandler);

    function generateDeviceMachineCycleDataHandler(deviceID) {
        wemsDBManager.getMachineCycleData(period, deviceID, function (machineCycleDataList) {
            machineCycleDataPerDeviceList.push({
                DeviceID: deviceID,
                DeviceMachineCycleData: machineCycleDataList
            });

            if (machineCycleDataPerDeviceList.length == deviceIDList.length) {
                machineCycleDataPerDeviceList.sort(function (a, b) {
                    return a.DeviceID - b.DeviceID;
                });

                res.data = generateAnalysisData(machineCycleDataPerDeviceList);
            }
        });
    }
}

// POST Restful API Handler
// PUT Restful API Handler
// DELETE Restful API Handler

// WEMS Method
function generateAnalysisData(machineCycleDataPerDeviceList) {
    var analysisDataList = [];
    machineCycleDataPerDeviceList.forEach(generateAnalysisDataHandler);

    return analysisDataList;


    ////////////////////////////////////////////////////
    // generateAnalysisData Handler
    function generateAnalysisDataHandler(machineCycleDataPerDevice) {
        if (!machineCycleDataPerDevice) {
            return;
        }

        if (machineCycleDataPerDevice.DeviceMachineCycleData.length == 0) {
            return;
        }

        machineCycleDataPerDevice.DeviceMachineCycleData.forEach(generateAnalysisDataPerDeviceHandler)

        //////////////////////////////////////////////////
        // generateAnalysisDataPerDevice Handler
        function generateAnalysisDataPerDeviceHandler(machineCycleData) {
            machineCycleData.TotalStartTime.setMinutes(0, 0, 0);
            var powerPerCycle = calPowerDataPerCycle(machineCycleData);
            var cycleTime = calCycleTimeData(machineCycleData);
            for (index = 0; index < analysisDataList.length; index++) {
                if (analysisDataList[index].AnalysisDate.getTime() === machineCycleData.TotalStartTime.getTime()) {
                    // 해당 날짜의 정보가 있는 경우
                    for (deviceIndex = 0;
                        deviceIndex < analysisDataList[index].AnalysisData.length;
                        deviceIndex++) {
                        // 해당 날짜 해당 Device의 정보가 있는 경우
                        if (analysisDataList[index].AnalysisData[deviceIndex].SC_No
                            == machineCycleData.SC_No) {
                            analysisDataList[index].AnalysisData[deviceIndex].Power
                                += powerPerCycle;
                            analysisDataList[index].AnalysisData[deviceIndex].CycleTime
                                += cycleTime;

                            return;
                        }
                    }

                    // 해당 날짜의 정보 중 해당 Device의 정보가 없는 경우
                    analysisDataList[index].AnalysisData.push({
                        SC_No: machineCycleData.SC_No,
                        Power: powerPerCycle,
                        CycleTime: SC_No,
                        PowerEfficiency: 0
                    });

                    return;
                }
            }

            // 해당 날짜의 정보가 없는 경우
            var analysisDate = JSON.parse(JSON.stringify(machineAnalysisData));
            analysisDate.AnalysisDate = machineCycleData.TotalStartTime;
            analysisDate.AnalysisData = [{
                SC_No: machineCycleData.SC_No,
                Power: powerPerCycle,
                CycleTime: cycleTime,
                PowerEfficiency: 0
            }];

            analysisDataList.push(analysisDate);
        }
    }
} 

// Cal Power Data Per Cycle
function calPowerDataPerCycle(machineCycleData) {
    var drivingInfoLength = machineCycleData.DrivingInfo.length;
    var hoistingInfoLength = machineCycleData.HoistingInfo.length;
    var forkInfoLength = machineCycleData.ForkInfo.length;
    var powerPerCycle = 0;
    if (drivingInfoLength > 0) {
        powerPerCycle = powerPerCycle
            + (machineCycleData.DrivingInfo[drivingInfoLength - 1].MotorPowerConsumption
                - machineCycleData.DrivingInfo[0].MotorPowerConsumption);
    }

    if (hoistingInfoLength > 0) {
        powerPerCycle = powerPerCycle
            + (machineCycleData.HoistingInfo[hoistingInfoLength - 1].MotorPowerConsumption
            - machineCycleData.HoistingInfo[0].MotorPowerConsumption);
    }

    if (forkInfoLength > 0) {
        powerPerCycle = powerPerCycle
            + (machineCycleData.ForkInfo[forkInfoLength - 1].MotorPowerConsumption
            - machineCycleData.ForkInfo[0].MotorPowerConsumption);
    }


    return powerPerCycle;
}

// Cal Cycle Time Data 
function calCycleTimeData(machineCycleData) {
    return machineCycleData.TotalEndTime - machineCycleData.TotalStartTime;
}
