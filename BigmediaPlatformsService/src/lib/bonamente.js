const {getPartnerFileFromFTP} = require('./ftp')
const partners = require('../config/partners')
const {execProcXML} = require('./database')
const iconv = require('iconv-lite')

async function importOccupancy() {
    const buffer = await getPartnerFileFromFTP(partners.bonamente)
    if (!buffer) {
      console.error('Error in bonamente import');
      return;
    }
    // console.log(buffer.toString());
    // const str = buffer.toString()
    const xml = iconv.decode(buffer, 'cp1251').split(/\r\n/).slice(1).join('')
    // console.log(xml);
    const id_operation = await execProcXML('sp_web_platform_import_occ_bonamente', xml)
    console.log(id_operation + ' - Бона Менте')
}

module.exports = importOccupancy
