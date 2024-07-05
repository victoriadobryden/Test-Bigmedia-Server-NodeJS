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
      let src = await redis.get('previewId-' + photoId)
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
          let path = photo.path.replace(config.get('PHOTOHUB').PRINT_DIR_PATH, config.get('PHOTOHUB').URL_PREVIEW)
          src = path.replace(/\\/g, '/')
        } else {
          src = photo.path;
        }
        src = encodeURI(src)
        if (!src) {
          return
        }
        req.proxySrc = src
        const updated = await redis.set('previewId-' + photoId, src)
        redis.expire('previewId-' + photoId, 24 * 60 * 60 * 14)
      } finally {
        redis.disconnect()
      }
  } finally {
    next()
  }
}

module.exports = entryMiddleware
