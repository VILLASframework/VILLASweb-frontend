/**
 * File: default.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 10.05.2018
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

'use strict';

module.exports = {
    port: 4000,
    databaseName: 'VILLAS',
    databaseURL: 'mongodb://localhost:27017/',
    secret: 'longsecretislong',
    amqpEndpoint: 'amqp://localhost',
    amqpUpdateRate: 10,
    logLevel: 'error',
    logFile: './log.txt',
    publicDir: '../public',
    defaultAdmin: false
};
