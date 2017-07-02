var MachineInfoSchema = require('../../models/dbSchema/MachineInfoSchema.js');
var MachineRealTimeDataSchema = require('../../models/dbSchema/MachineRealTimeDataSchema.js');
var MachineCycleDataSchema = require('../../models/dbSchema/MachineCycleDataSchema.js');

// Add Machine Info
module.exports.addMachineInfo = function (machineInfo, next) {
    if (machineInfo) {
        
        if (machineInfo.ID < 0) {
            next(false);
            return;
        }                   
            
        MachineInfoSchema            
        .findOne({ ID: machineInfo.ID })            
        .exec(function (err, info) {
            if (err) {
                next(false);
                return;                                                                   
            }
            
            if (!info) {
                info = new MachineInfoSchema();
                info.Type = machineInfo.Type;
                info.Name = machineInfo.Name;
                info.ID = machineInfo.ID;
            }
            else {
                info.Type = machineInfo.Type;
                info.Name = machineInfo.Name;
            }
                        
            info.save(function (err) {
                if (err) {
                    next(false);
                    return;
                }
                
                next(true);
            });                        
        });
    }
}


// Add Machine RealTime Data
module.exports.addMachineRealTimeData = function (machineRealTimeData, next) {
    if (machineRealTimeData) {

        var dataArray = [];

        for (var i in machineRealTimeData.MotorInfos) {
            var data = new MachineRealTimeDataSchema();
            data.SCNo = machineRealTimeData.SCNo;
            data.TimeStamp = new Date(machineRealTimeData.MotorInfos[i].TimeStamp);
            data.DrivingMotorCurrent = machineRealTimeData.MotorInfos[i].DrivingCurrent;
            data.HoistingMotorCurrent = machineRealTimeData.MotorInfos[i].HoistingCurrent;
            data.ForkMotorCurrent = machineRealTimeData.MotorInfos[i].ForkCurrent;

            dataArray.push(data);                    
        }
        
        MachineRealTimeDataSchema
        .insertMany(dataArray, function (err) {
            if (err) {
                next(false);
                return;
            }
            
            next(true);
        });                                 
    }
}

// Add Machine Cycle Data
module.exports.addMachineCycleData = function (machineCycleData, next) {
    
    // XXX Fill me
        
    next(true);

}

// Add Machine Error Data
module.exports.addMachineErrorData = function (machineErrorData, next) {
    
    // XXX Fill me
    
    next(true);

}