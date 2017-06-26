// WEMS Restful API Handler
var wemsDBManager = require('../utility/dbManager/wemsDBManager');

// GET Restful API Handler
module.exports.getAnalysisData = function (req, res) {
    if (!wemsDBManager) {
        return;
    }

    var period = req.query;
    var cycleMonitorinData = wemsDBManager.getCycleMonitoringData(period);
    res.data = calPowerData(cycleMonitorinData);
}

// POST Restful API Handler
// PUT Restful API Handler
// DELETE Restful API Handler

// WEMS Method
function calPowerData(cycleMonitorinData) {
    
    return;
}
