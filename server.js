/**
 * File: server.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 04.07.2016
 *
 * This file is part of VILLASweb-backend.
 *
 * VILLASweb-backend is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * VILLASweb-backend is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with VILLASweb-backend. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/

// include modules
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var winston = require('winston');
var expressWinston = require('express-winston');

// local include
const config = require('./config/index');
var logger = require('./utils/logger');
var users = require('./routes/users');
var projects = require('./routes/projects');
var visualizations = require('./routes/visualizations');
var simulations = require('./routes/simulations');
var upload = require('./routes/upload');
var files = require('./routes/files');
var counts = require('./routes/counts');
var simulators = require('./routes/simulators');
var simulationModels = require('./routes/simulationModels');
var amqpClient = require('./broker/client');

var User = require('./models/user');

// create application
var app = express();

// configure logger
if (config.logLevel) {
  logger.transports.console.level = config.logLevel;

  // enable debug output for mongoose
  if (config.logLevel == 'debug' || config.logLevel == 'silly') {
    mongoose.set('debug', function(coll, method, query, doc) {
      logger.log('debug', '[Mongoose]', { coll, method, query, doc });
    });
  }
}

if (config.logFile) {
  logger.transports.file.filename = config.logFile;
  logger.transports.file.level = config.logLevel;
  logger.transports.file.silent = false;
}

logger.info('--- Started VILLASweb backend ---');
logger.info('Environment: ' + config.environment);

// configure app
app.use(expressWinston.logger({ winstonInstance: logger, meta: false, colorize: true, msg: "HTTP {{req.method}} {{res.statusCode}} {{req.url}} {{res.responseTime}}ms" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// connect to database
mongoose.Promise = global.Promise;
mongoose.connect(config.databaseURL + config.databaseName).then(() => {
  logger.info('Connected to database ' + config.databaseURL + config.databaseName);
}, (err) => {
  logger.error('Unable to connect to database \'' + config.databaseURL + config.databaseName + '\'');

  process.exit();
});

// connect to amqp broker
amqpClient.connect(config.amqpEndpoint, err => {
  if (err) {
    logger.error('AMQP: ' + err);
    return;
  }

  logger.info('Connected to amqp broker ' + config.amqpEndpoint);

  // request simulator status
  setInterval(() => {
    amqpClient.ping();
  }, config.amqpUpdateRate * 1000);
});

// register routes
app.use('/api/v1', users);
app.use('/api/v1', projects);
app.use('/api/v1', visualizations);
app.use('/api/v1', simulations);
app.use('/api/v1', upload);
app.use('/api/v1', files);
app.use('/api/v1', counts);
app.use('/api/v1', simulators);
app.use('/api/v1', simulationModels);

app.use('/public', express.static(__dirname + '/public'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({ error: err, message: err.message });
  });
}

// production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({ error: {}, message: err.message });
});

// start the app
app.listen(config.port, function() {
  logger.info('Server listening on port ' + config.port);
});

// add admin account
if (config.defaultAdmin) {
  // check if admin account exists
  User.findOne({ username: 'admin' }, function(err, user) {
    if (err) {
      logger.error(err);
      return;
    }

    if (!user) {
      // create new admin user
      var newUser = User({ username: 'admin', password: 'admin', role: 'admin' });
      newUser.save(function(err) {
        if (err) {
          logger.error(err);
          return;
        }

        logger.warn('Created default admin user from config file');
      });
    }
  });
}
