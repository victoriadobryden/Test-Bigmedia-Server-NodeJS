const nconf = require('nconf')
const defaults = {
  'LOG': 'info',
  'PORT': 3001,
  'EMAIL': {
    'host': 'mail.bigboard.ua',
    'port': 2525,
    'user': 'request@bigmedia.com.ua',
    'password': 'De8cTy'
  },
  'DB': {
    'user': 'web',
    'password': '05www08@))#',
    'server': 'mssql.ua.local',
    'port': 1443,
    'database': 'BigBoard',
    'useUTC': false,
    'useColumnNames': false,
    'requestTimeout': 360000,
    'pool': {
      'max': 20,
      'min': 0
    }
  },
  'REDIS': 'redis://localhost:6379',
  'SESSION_SECRET': 'dqlichSU6kdh2354JHDgejdWTFSeudygid28GXuye9',
  'PHOTO': {
    'unc': '\\\\appserver\\PhotoRep\\PhotoReports\\Print',
    'http': 'http://bigmedia.ua/PhotoRep'
  },
  'FACEBOOK': {
    'clientID': '1308134669200550',
    'clientSecret': 'aa06639f6d0d9edec7172d5e8ea80c1b'
  },
  'refreshBigData': {
    'workingHoursTimeout': 300000,
    'otherTimeout': 300000
  },
  'PHOTOHUB': {
    // select * from photorep_settings where name in ('PrintDirPath', 'URL_full')
    'PRINT_DIR_PATH': '\\\\appserver\\PhotoRep\\PhotoReports\\Print',
    'URL_FULL': 'http://192.168.6.4/photorep',
    'URL_PREVIEW': 'http://192.168.6.4/preview'
  },
  'DOORSLOCAL': {
    'URL' : 'http://192.168.6.4/doors/{doors_no}.jpg'    
  },
  'MONITORING': {
    'URL' : 'http://192.168.6.4/fotomonitor/{brandId}.jpg'    
    //'URL' : 'ftp://OOH_ODE_2:0Dk8z1@ftp.fotomonitor.com.ua/IMAGE/{brandId}.jpg'    
  }
}

nconf.argv({
  'c': {
    alias: 'config'
  }
})

const configFile = nconf.get('config')
if (configFile) nconf.file(configFile)
nconf.env('__')
nconf.defaults(defaults)
module.exports = nconf
