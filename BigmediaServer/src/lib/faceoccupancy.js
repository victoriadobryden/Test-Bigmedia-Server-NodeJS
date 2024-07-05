/**
 * Created by Alexander.Ustilov on 23.02.2016.
 */
var db = require('../lib/db');
var conf = require('../config');
var debug = require('debug')('ol-app:server');
var log = require('../lib/log')(module);
const sql = require('mssql'),
    config = conf.get('DB');
var RedisFaces = require('../models/faces');
const Redis = require('ioredis')
const redis = new Redis(conf.get('REDIS'))

var faceOccupancy = [],
    lastSyncTime,
    isLoading = false,
    attemptsCount = 0,
    IdTimer,
    facesById = {};

function syncData() {
    attemptsCount++;
    if (isLoading) {
        log.debug('Try Sync while Data is loading...');
        return;
    }
    // if(db.getConnectionStatus() !== 'connected'){
    //     log.debug('Initially connect to DB');
    //     db.connectToDB(syncData);
    //     return;
    // }
    isLoading = true;
    log.debug('Data is loading...');
    // var request = new sql.Request();
    sql.on('error', err => {
        // console.warn('error', err);
    })
    sql.connect(config).then(pool => {
        return pool.request()
        .execute('sp_web_face_occupancy_v2') 
    }).then(recordsets => {
        isLoading = false;
        if (recordsets.length === 0) {
            log.error('Occupancy error: recordsets is empty ' + 'Status: ' + err.status + '. Error message: ' + err.message);
            log.error(err + '; attempts: ' + attemptsCount.toString() + '; lastSuccessSyncTime: ' + lastSyncTime.toString());
            return;
        }
        if (recordsets.length > 0) {
            var recs = recordsets[0];
            if (recs.length === 0) {
                log.error('Occupancy error: recordset[0] is empty ' + 'Status: ' + err.status + '. Error message: ' + err.message);
                log.error(err + '; attempts: ' + attemptsCount.toString() + '; lastSuccessSyncTime: ' + lastSyncTime.toString());
                return;
            } else {
                log.debug('Exec here ...');
                var dbdata = recs;
                // if(faceOccupancy.length===0){
                //     console.warn(dbdata);
                // }
                faceOccupancy = dbdata;
                // RedisFaces.SetData(dbdata);
                lastSyncTime = new Date();
                attemptsCount = 0;
                log.debug('Data loaded. Records: ' + faceOccupancy.length);2
                const geoData = []
                facesById = {}
                faceOccupancy.forEach((item) => {
                    // console.warn(item)
                  if (item.lon && item.lat && item.lon!=0 && item.lat!=0) {
                    geoData.push(item.lon)
                    geoData.push(item.lat)
                    geoData.push(+item.id)
                  }
                  facesById[+item.id] = item
                });
                if (geoData.length > 0) {
                  redis.geoadd('geofaces', ...geoData).then((res) => console.warn('added:  ' + res))
                //   redis.geoadd('geofaces', ...geoData).then((res) => console.warn('added:  ' + res+' --> geoData :'+geoData.length.toString()))
                }
            }
        }
        // console.warn(recordsets);
    }).catch(err => {
        if (err) {
            log.error('Occupancy procedure error: ' + 'Status: ' + err.status + '. Error message: ' + err.message);
            log.error(err + '; attempts: ' + attemptsCount.toString() + '; lastSuccessSyncTime: ' + lastSyncTime.toString());
            return;
        }
    })

    // var request = new sql.Request();
    // request.execute('sp_web_face_occupancy_v2', function (err, recordsets, returnValue, affected) {
    //     isLoading = false;
    //     if (err) {
    //         log.error('Occupancy procedure error: ' + 'Status: ' + err.status + '. Error message: ' + err.message);
    //         log.error(err + '; attempts: ' + attemptsCount.toString() + '; lastSuccessSyncTime: ' + lastSyncTime.toString());
    //         return;
    //     }
    //     if (recordsets.length === 0) {
    //         log.error('Occupancy error: recordsets is empty ' + 'Status: ' + err.status + '. Error message: ' + err.message);
    //         log.error(err + '; attempts: ' + attemptsCount.toString() + '; lastSuccessSyncTime: ' + lastSyncTime.toString());
    //         return;
    //     }
    //     var data = {};
    //     if (recordsets.length > 0) {
    //         var recs = recordsets[0];
    //         if (recs.length === 0) {
    //             log.error('Occupancy error: recordset[0] is empty ' + 'Status: ' + err.status + '. Error message: ' + err.message);
    //             log.error(err + '; attempts: ' + attemptsCount.toString() + '; lastSuccessSyncTime: ' + lastSyncTime.toString());
    //             return;
    //         } else {
    //             log.debug('Exec here ...');
    //             var dbdata = recs;
    //             // if(faceOccupancy.length===0){
    //             //     console.warn(dbdata);
    //             // }
    //             faceOccupancy = dbdata;
    //             // RedisFaces.SetData(dbdata);
    //             lastSyncTime = new Date();
    //             attemptsCount = 0;
    //             log.debug('Data loaded. Records: ' + faceOccupancy.length);
    //             const geoData = []
    //             facesById = {}
    //             faceOccupancy.forEach((item) => {
    //               if (item.lon && item.lat && item.lon!=0 && item.lat!=0) {
    //                 geoData.push(item.lon)
    //                 geoData.push(item.lat)
    //                 geoData.push(+item.id)
    //               }
    //               facesById[+item.id] = item
    //             });
    //             if (geoData.length > 0) {
    //               redis.geoadd('geofaces', ...geoData).then((res) => console.warn('added:  ' + res))
    //             //   redis.geoadd('geofaces', ...geoData).then((res) => console.warn('added:  ' + res+' --> geoData :'+geoData.length.toString()))
    //             }
    //         }
    //     }
    // });
}

function refreshTimer() {
    debug('refreshTimer executed');
    if (isLoading) {
        clearTimeout(IdTimer);
        attemptsCount++;
    }
    else {
        syncData();
    }
    var rbdConfig = conf.get('refreshBigData'), timeout;
    var now = new Date();
    if (now.getDay() == 0 || now.getDay() == 6 || now.getHours() < 8 || now.getHours() > 18) {
        timeout = rbdConfig.otherTimeout;
    }
    else {
        timeout = rbdConfig.workingHoursTimeout;
    }
    var refreshAfter = attemptsCount * timeout;
    if (refreshAfter > 7200000) {
        refreshAfter = 7200000;
        log.error('Error connection to the Database server');
    }
    log.debug('New timer started with timeout: ' + refreshAfter);
    IdTimer = setTimeout(refreshTimer, refreshAfter);
}

function Occupancy() {
  this.getData = function () {
    return faceOccupancy;
  }
  this.getFacesById = function () {
    return facesById;
  }
  this.startSync = function () {
    IdTimer = setTimeout(refreshTimer, 0);
    RedisFaces.Start();
  }
}

module.exports = Occupancy;
