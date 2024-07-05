const getPartnerFileFromHTTPS = require('./https')
const partners = require('../config/partners')
const {execProcXML} = require('./database')
const iconv = require('iconv-lite')

async function importOccupancy() {
  try {
    const buffer = await getPartnerFileFromHTTPS(partners.eliziya)
    // console.log(buffer.toString());
    // const str = buffer.toString()
    // const xml = iconv.decode(buffer, 'cp1251').split(/\r\n/).slice(1).join('')
    const xml = buffer.toString()
    // console.log(xml);
    // return;
    const id_operation = await execProcXML('sp_web_platform_import_occ_eliziya', xml)
    console.log(id_operation + ' - Элизия')
  } catch (e) {
    console.error('Partner "' + partners.eliziya.name + '" - ' + e)
  }
}

module.exports = importOccupancy
