const config = require('../config')
const { PhotosPresent } = require('../models')
const Redis = require('ioredis')
const URL = require("url").URL;
// const https = require('https');

const checkChangeHttps = (src, src2) => {
  let NewUrl = '';
  if (src.indexOf('www.rtm.com.ua') >= 0) return encodeURI(src);
  if (src.indexOf('192.168.6.4') >= 0) {
    NewUrl = src;
  } else {
    let NewUrl = src.replace('http://', 'https://')
  }
  try {
    new URL(NewUrl);
    return encodeURI(NewUrl);
  } catch (err) {
    if (typeof src2 !== 'undefined') {
      NewUrl = checkChangeHttps(src2)
      return NewUrl;
    } else {
      return encodeURI(src);
    }
  }
};
// const checkGoogleDrive = (src) =>{
//   const r = request(src);
//   console.log(r);
//   // console.warn('src:',src);
//   // return new Promise((resolve) => {
//   //   // console.warn('src:',src);
//   //   let headers = {},
//   //     options = {method:'get', }
//   //   const req = https.get(src, (res) => {
//   //     headers = res.headers;
//   //     // console.warn('headers:',headers);
//   //     res.on('end', () => {
//   //       // for clarity of output omit this line
//   //       // console.log('Body: ', body);
//   //       // body is printed and headers are available => resolve promise
//   //       resolve(headers)
//   //     })
//   //     console.warn('src:', src);
//   //     // console.warn('statusCode:', res.statusCode);
//   //     // let A= res.headers['location'];

//   //     // return res.headers.location;
      
//   //   });
//   //   req.end();
//   //   console.log(headers)
//   // });
//   //    const response = await  https.get(src);
//         // const photo = await response.getHeaders();
//         // console.warn(response);
//         // let a= new URL(src);
//         // console.warn(a);
//         // const photo = await response.getHeaders();
//         // console.warn(response);
//         // let request = https.get(src, (res) => {
//         //   if (res.statusCode !== 200) {
//         //     // console.error(`Did not get an OK from the server. Code: ${res.statusCode}`);
//         //     res.resume();
//         //     // src=res.headers.location;
//         //     // const updated = redis.set('faceId-' + faceId, src)
//         //     // redis.expire('faceId-' + faceId, 24 * 60 * 60)
//         //     // redis.set('photoId-' + photo.photoId, src)
//         //     // redis.expire('photoId-' + photo.photoId, 24 * 60 * 60)
    
//         //     console.warn(res.json())
//         //     return res;
//         //   }
//         // });
//         // console.warn(src,'--->',request.getHeaders());
  
//         // if (src==='https://drive.google.com/uc?export=view&id=1huVI7O1kqfsAJT3If-QBV4w5OEfhLHU3') 
//         // src='https://drive.usercontent.google.com/download?id=1huVI7O1kqfsAJT3If-QBV4w5OEfhLHU3&export=view';
//         // req.proxySrc = src
// }
const entryMiddleware = async (req, res, next) => {
  try {
    // console.warn(req.params);
    const { faceId } = req.params
    if (!faceId) {
      return
    }
    const redis = new Redis(config.get('REDIS'))
    try {
      let src = await redis.get('faceId-' + faceId)

      if (src) {
        src = checkChangeHttps(src)
        req.proxySrc = src;
        return
      }
      const photo = await PhotosPresent.findOne({
        attributes: ['faceId', 'path', 'path_prev'],
        where: { faceId: faceId } //, present: 1
      });
      //console.warn('Photo --->',photo);
      if (!photo) {
        return
      }

      let path = photo.path.replace(config.get('PHOTOHUB').PRINT_DIR_PATH, config.get('PHOTOHUB').URL_FULL)
      src = path.replace(/\\/g, '/')
      src = checkChangeHttps(src);
      src = encodeURI(src)
      if (!src) {
        return
      }

      req.proxySrc = src
      // if (photo.path_prev.indexOf('192.168.6.4') > 0) {
      //   src = checkChangeHttps(photo.path_prev, photo.path)
      // } else {
      //   src = checkChangeHttps(photo.path);
      // }
      // console.warn('src->',src);
      // // console.warn('req->',req);
      
      // if (photo.path_prev.indexOf('google.com') > 0) {
      //   return
      // }
        const updated = await redis.set('faceId-' + faceId, src)
        redis.expire('faceId-' + faceId, 24 * 60 * 60)
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
