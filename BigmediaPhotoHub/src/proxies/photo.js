const config = require('../config')
const {AllPhotos} = require('../models')
const Redis = require('ioredis')

const entryMiddleware = async (req, res, next) => {
  try {
    const {photoId} = req.params
    if (!photoId) {
      return
    }
    const redis = new Redis(config.get('REDIS'))
    try {
      let src = await redis.get('photoId-' + photoId)
      if (src) {
        req.proxySrc = src
        return
      }
      const photo = await AllPhotos.findOne({
        attributes: ['photoId', 'source', 'path'],
        where: { photoId: photoId }});
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
        if (!src) {
          return
        }
        req.proxySrc = src
        const updated = await redis.set('photoId-' + photoId, src)
        redis.expire('photoId-' + photoId, 24 * 60 * 60)
      } finally {
        redis.disconnect()
      }
  } finally {
    next()
  }
}

module.exports = entryMiddleware
