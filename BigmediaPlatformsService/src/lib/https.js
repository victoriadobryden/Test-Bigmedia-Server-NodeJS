const { Buffer } = require('buffer');
const https = require('https');
const { URL } = require('url');
const iconv = require('iconv-lite')
const syswidecas = require('syswide-cas');
const path = require('path');

async function getPartnerFileFromHTTPS (config) {
  const getPromise = (fn)=>new Promise((resolve, reject)=>{
    const opts = new URL('https://' + (config.http ? config.http.user + ':' + config.http.password + '@' : '') + fn)
    syswidecas.addCAs(path.resolve('./cert'));
    const data = []
    const req = https.get(opts, (resp) => {
        const data = [];
        resp.on('data', (chunk) => data.push(chunk))
        resp.on('end', () => {
          var res = Buffer.concat(data)
          if (config.encoding) {
            res = iconv.decode(res, config.encoding)
          }
          resolve (res)
        })
      }).on("error", (err) => {
        reject(err)
      })
  })
  return await getPromise(config.fileName)
}

module.exports = getPartnerFileFromHTTPS
