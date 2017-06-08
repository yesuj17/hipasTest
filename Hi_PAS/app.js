var express = require('express');
var app = express();

/* Initialize and Connect DB */
var dbManager = require('./utility/dbManager/dbManager');
dbManager.connect();

/* Initialzie and Start PM Service */
require('./services/pmsService')(app);

/* Initialize and Sart Web Service */
require('./services/webService')(app, express);

module.exports = app;
