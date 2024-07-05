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
    const {doorsNo} = req.params
    if (!doorsNo) {
      return
    }
    const redis = new Redis(config.get('REDIS'))
    try {
      let src = await redis.get('doorsNo-' + doorsNo)
      if (src) {
        req.proxySrc = src
        return
      }
      const photo = await DoorsPhotos.findOne({
        attributes: ['doorsNo', 'path'],
        where: { doorsNo } });
      if (!photo) {
        return
      }
      src = photo.path
      
      src = checkChangeHttps(src,doorsNo)

      req.proxySrc = src
      const updated = await redis.set('doorsNo-' + doorsNo, src)
      redis.expire('doorsNo-' + doorsNo, 24 * 60 * 60 * 14)
    } finally {
      redis.disconnect()
    }
  } finally {
    next()
  }
}

module.exports = entryMiddleware
