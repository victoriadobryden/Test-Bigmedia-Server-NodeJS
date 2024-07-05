const {MonitoringData, Monitoring} = require('../models')

const list = () => Monitoring.findAll()

const dataFull = () => MonitoringData.findAll()
const dataById = (MonitoringId) => MonitoringData.findAll({where :{MonitoringId}})
module.exports = {
  list,dataById,dataFull
}
