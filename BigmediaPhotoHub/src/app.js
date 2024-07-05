// Creating context should go first, so all modules can use it
const config = require('./config')
const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const syswidecas = require('syswide-cas');
const path = require('path');

if (!Object.entries) require('object.entries').shim()
// Redis temporary disabled

const Redis = require('ioredis')
const router = new express.Router()

if (config.get('REDIS')) {
  const redis = new Redis(config.get('REDIS'))
} else {
  console.warn('No redis in config, no local cache')
}

// Our middleware, 401 and 404
function notFound (req, res, next) {
  next(Error(404))
}

const NumericErrors = {
  '400': 'Bad Request',
  '401': 'Authorization Required',
  '403': 'Permission Denied',
  '404': 'Not Found'
}
const NUMERIC_RE = /^\d\d\d:/
function handleError (err, req, res, next) {
  err =
    (typeof err === 'string' && NUMERIC_RE.test(err)) ? {
      message: err.slice(4).trim,
      status: Number(err.slice(0, 3))
    }
    : (typeof err === 'string') ? {
      message: err,
      status: 400
    }
    : (typeof err === 'number') ? {
      message: NumericErrors[err],
      status: err
    }
    : (typeof err === 'object' && err.message && err.message in NumericErrors) ? {
      message: NumericErrors[err.message],
      status: Number(err.message),
      stack: err.stack
    }
    : (typeof err === 'object' && err.message && NUMERIC_RE.test(err.message)) ? {
      message: err.message.slice(4).trim(),
      status: Number(err.message.slice(0, 3)),
      stack: err.stack
    }
    : err
  if (String(err.status) !== '404') {
    console.error(`Status: ${err.status}, Message: ${err.message}, Stack: ${err.stack}`)
  }
  if (res.headersSent) {
    console.info('Error handler will not send responce, since headers are already sent')
    return
  }
  res.status(err.status || 500)
  const result = app.get('env') === 'development' ? {
    message: err.message,
    error: err,
    stack: err.stack
  } : {
    message: err.message,
    error: {}
  }
  res.json(result)
}

// app configuration
const app = express()
syswidecas.addCAs(path.resolve('./cert'));
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'jade')
// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

if (app.get('env') === 'production') {
  console.warn('production build')
} else if (app.get('env') === 'testing') {
  console.warn('testing build')
}

app.use(logger('tiny'))
app.use(bodyParser.json({limit: '1mb'}))
app.use(bodyParser.urlencoded({limit: '1mb',  extended: false }))

app.use('/photohub/face/:faceId', require('./proxies/face'), require('./proxies'))
app.use('/photohub/photo/:photoId', require('./proxies/photo'), require('./proxies'))
app.use('/photohub/preview/:photoId', require('./proxies/preview'), require('./proxies'))
app.use('/photohub/service/:serviceId', require('./proxies/service'), require('./proxies'))
app.use('/photohub/doors/:doorsNo', require('./proxies/doors'), require('./proxies'))
app.use('/photohub/getphoto/:sideId', require('./proxies/getphoto'), require('./proxies'))
app.use('/photohub/getschema/:sideId', require('./proxies/getschema'), require('./proxies'))

app.use('/photohub/schema/:faceId', require('./proxies/schema'), require('./proxies'))

app.use('/photohub/detface', require('./routes/present'))
app.use('/photohub/detside', require('./routes/presentsn'))
app.use('/photohub/monitoring/:brandId', require('./proxies/monitoring'), require('./proxies'))

app.use('/photohub', require('./routes'))

// app.use('/', api)
app.use(notFound)
app.use(handleError)

process.on('unhandledRejection', e => { console.error('unhandledRejection', e) })
process.on('uncaughtException', e => { console.error('uncaughtException', e) })

module.exports = app
