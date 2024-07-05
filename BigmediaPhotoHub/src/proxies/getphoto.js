const config = require('../config')
const {PhotosPresent} = require('../models')
const Redis = require('ioredis')

const entryMiddleware = async (req, res, next) => {
  try {
    const {sideId} = req.params
    if (!sideId) {
      return
    }
    const redis = new Redis(config.get('REDIS'))
    try {
        let src = await redis.get(`idSidePhoto-${sideId}`)
        if (src) {
            req.proxySrc = src
            return
        }
        const photo =
            await PhotosPresent.findOne({ attributes: ['sideId','path'], where : { sideId } });
        if(photo.path.substring(0,3)==='http' ){
            src = photo.path;
        }else {
            let path = photo.path.replace(config.get('PHOTOHUB').PRINT_DIR_PATH, config.get('PHOTOHUB').URL_FULL)
            src = path.replace(/\\/g, '/')
        }
        src = encodeURI(src)
        if (!src) {
            return
        }
        req.proxySrc = src
        const updated = await redis.set(`idSidePhoto-${sideId}`, src)
        redis.expire(`idSidePhoto-${sideId}`, 24 * 60 * 60 * 14)
    } finally {
      redis.disconnect()
    }
  } finally {
    next()
  }
}

module.exports = entryMiddleware