const config = {
    tempDir: './tmp',
    mssql: {
      user: "web",
      password: "05www08@))#",
      server: "192.168.7.2",
      port: 1443,
      database: "BigBoard",
      options: {
        encrypt: false,
        enableArithAbort: true
      },
      requestTimeout: 900000
    },
    mail: {
      host: 'mail.bigboard.ua',
      user: 'bma.import@bigmedia.ua',
      password: '7uVShAVA',
      protocol: 'imap',
      port: 143
  },
  adminEmails: [
      'ilya.kiselov@bigmedia.ua', 'alexander.ustilov@bigmedia.ua', 'alena.rus@bigmedia.com.ua'
  ]
}
module.exports = config
