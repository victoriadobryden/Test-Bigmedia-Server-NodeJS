const config = require('../config')
const {AllPhotos} = require('../models')
const Redis = require('ioredis')

const entryMiddleware = async (req, res, next) => {
  try {
    const {serviceId} = req.params
    if (!serviceId) {
      return
    }
    const redis = new Redis(config.get('REDIS'))
    try {
      let src = await redis.get('serviceId-' + serviceId)
      if (src) {
        req.proxySrc = src
        return
      }
      const photo = await AllPhotos.findOne({
        attributes: ['photoId', 'source', 'path', 'serviceId'],
        where: { serviceId: serviceId} });
      if (!photo) {
        return
      }
      if (photo.source != 'platform_supplier_stock') {
        let path = photo.path.replace(config.get('PHOTOHUB').PRINT_DIR_PATH, config.get('PHOTOHUB').URL_FULL)
        src = path.replace(/\\/g, '/')
      } else {
        src = photo.path;
      }
      src = encodeURI(src)
      req.proxySrc = src
      if (!src) {
        return
      }
      const updated = await redis.set('serviceId-' + serviceId, src)
      redis.expire('serviceId-' + serviceId, 4 * 60 * 60)
      await redis.set('photoId-' + photo.photoId, src)
      redis.expire('photoId-' + photo.photoId, 24 * 60 * 60)
    } finally {
      redis.disconnect()
    }
  } finally {
    next()
  }
}

module.exports = entryMiddleware
