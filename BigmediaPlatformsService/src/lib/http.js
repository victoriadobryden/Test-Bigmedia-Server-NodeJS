const http = require('http');
const { URL } = require('url');

async function getPartnerFileFromHTTP (config) {
  const getPromise = (fn)=>new Promise((resolve, reject)=>{
    const opts = new URL('http://' + (config.http ? config.http.user + ':' + config.http.password + '@' : '') + fn)
    http.get(opts, (resp) => {
      const data = [];
      resp.on('data', (chunk) => data.push(chunk))
      resp.on('end', () => resolve (Buffer.concat(data)))
    }).on("error", (err) => {
      reject(err)
    })
  })
  return await getPromise(config.fileName)
}

module.exports = getPartnerFileFromHTTP
