const { createProxyMiddleware } = require('http-proxy-middleware')

const photoProxyOptions = {
  target: 'http://www.example.org', // target host
  changeOrigin: true, // needed for virtual hosted sites
  secure: false,
  followRedirects: true,
  pathRewrite: {
    '.*': ''
  },
  router: function(req) {
    return req.proxySrc
  }
}

const filter = function (pathname, req) {
  return req.method === 'GET' && !! req.proxySrc;
}

const photoProxy = createProxyMiddleware(filter, photoProxyOptions)

module.exports = photoProxy
