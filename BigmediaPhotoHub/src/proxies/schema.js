const config = require('../config')
const {PhotosPresent} = require('../models')
const Redis = require('ioredis')

const entryMiddleware = async (req, res, next) => {
  try {
    const {faceId} = req.params
    if (!faceId) {
      return
    }
    const redis = new Redis(config.get('REDIS'))
    try {
        let src = await redis.get(`idfaceSchema-${faceId}`)
        if (!src) {
          const schema =
              await PhotosPresent.findOne({ attributes: ['faceId','schema_url'], where : { faceId } });
          src = schema.schema_url;

          src = encodeURI(src)
          // console.warn('--------->',src,'-->',(!src))
          if (!src) {
              return
          }
          // console.warn('2--------->',src,(!src))
          req.proxySrc = src
          const updated = await redis.set(`idfaceSchema-${faceId}`, src)
          redis.expire(`idfaceSchema-${faceId}`, 24 * 60 * 60)
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