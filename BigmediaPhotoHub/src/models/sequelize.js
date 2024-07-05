const Sequelize = require('sequelize')
const config = require('../config')
const db = config.get('DB')

const sequelizeOpts = {
  host: db.server,
  port: db.port,
  dialect: 'mssql',
  pool: db.pool,
  databaseVersion: '9.0.1399',
  define: {
    timestamps: false,  // I don't want timestamp fields by default
    freezeTableName: true
  },
  dialectOptions: {
    requestTimeout: 300000,
    options: {
    //   requestTimeout: 300000
      encrypt: false
    }
    // abortTransactionOnError: true,
  },
  benchmark: true,
  query: {
    type: 'SELECT',
    raw: false
  },
  logging: false,
  // timezone: 'UTC'
}
/*
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
  sequelizeOpts.logging = null
}
*/

//  https://github.com/sequelize/sequelize/issues/381#issuecomment-31603459
//  mickhansen commented on Jan 5, 2014
//  You should be able to require and modify https://github.com/sequelize/sequelize/blob/master/lib/data-types.js before init'ing sequelize.

const dataTypesFor2005MSSQLHack = require('sequelize/lib/data-types')
dataTypesFor2005MSSQLHack.mssql.DATE.prototype.toSql = function () {
  return 'DATETIME'
}

const sequelize = new Sequelize(db.database, db.user, db.password, sequelizeOpts)

module.exports = sequelize
