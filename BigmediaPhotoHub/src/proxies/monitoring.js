const config = require('../config')
const {DoorsPhotos} = require('../models')
const Redis = require('ioredis')
const URL = require("url").URL;
const checkChangeHttps = (src,doorsNo) => {
  //let NewUrl = src.replace('http://','https://')
  let NewUrl = config.get('DOORSLOCAL').URL.replace('{doors_no}',doorsNo)
  // console.warn(NewUrl)
  try {
    new URL(NewUrl);
    return encodeURI(NewUrl);
  } catch (err) {
    return encodeURI(src);
  }
};

const entryMiddleware = async (req, res, next) => {
  try {
    const {brandId} = req.params
    if (!brandId) {
      return
    }
    const redis = new Redis(config.get('REDIS'))
    try {
      let src = await redis.get('MonitoringId-' + brandId)
      if (src) {
        req.proxySrc = src
        return
      }
      let photoUrl = config.get('MONITORING').URL.replace('{brandId}',brandId)
      console.warn(photoUrl);
      req.proxySrc = photoUrl
      const updated = await redis.set('MonitoringId-' + brandId, photoUrl)

      redis.expire('MonitoringId-' + brandId, 24 * 60 * 60 * 14)
    } finally {
      redis.disconnect()
    }
  } finally {
    next()
  }
}

module.exports = entryMiddleware
