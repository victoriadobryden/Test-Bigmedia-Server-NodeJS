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
        let src = await redis.get(`idSideSchema-${sideId}`)
        if (!src) {
          const schema =
              await PhotosPresent.findOne({ attributes: ['sideId','schema_url'], where : { sideId } });
          // console.warn('schema',schema)
          src = schema.schema_url;
          
          src = encodeURI(src)
          if (!src) {
              return
          }
          req.proxySrc = src
          const updated = await redis.set(`idSideSchema-${sideId}`, src)
          redis.expire(`idSideSchema-${sideId}`, 24 * 60 * 60 * 14)
        } else {
          req.proxySrc = src
          return
        }
    } finally {
      redis.disconnect()
    }
  } finally {
    next()
  }
}

module.exports = entryMiddleware