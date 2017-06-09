var systemConfig = require('../config/systemConfig');
module.exports = function (app, express) {
    var path = require('path');
    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');

    /* View Engine Setup */
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'jade');

    /* Etc Setup */
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(require('stylus').middleware(path.join(__dirname, '../public')));
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.static(path.join(__dirname, '../controllers')));

    /* Start Web Server */
    app.set('port', systemConfig.webServer.port);
    var server = app.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + server.address().port);
    });

    /* Start Web Socket */
    var socketIo = require('socket.io'); 
    const io = new socketIo(server);

    /* Routes Setup */
    require('../routes/route')(app, io);

    /* Error Handler */
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('./common/error', {
                message: err.message,
                error: err
            });
        });
    }

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('./common/error', {
            message: err.message,
            error: {}
        });
    });
}