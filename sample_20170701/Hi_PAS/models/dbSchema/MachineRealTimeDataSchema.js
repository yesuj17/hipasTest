var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MachineRealTimeDataSchema = new Schema({    
    SCNo : String,    
    TimeStamp : { type : Date },
    DrivingMotorCurrent : Number,     
    HoistingMotorCurrent: Number,         
    ForkMotorCurrent: Number        
});

module.exports = mongoose.model('MachineRealTimeDataSchema', MachineRealTimeDataSchema);