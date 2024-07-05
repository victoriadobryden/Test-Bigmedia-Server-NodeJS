#!/usr/bin/env node

const { importOccupancy, importWorkbook } = require('../src/lib/excel')
const partners = require('../src/config/partners')
const { getPartnerFileFromFTP } = require('../src/lib/ftp')
const getPartnerFileFromHTTP = require('../src/lib/http')
const getPartnerFileFromHTTPS = require('../src/lib/https')
const fs = require('fs')
const iconv = require('iconv-lite')
const { saveToDB } = require('../src/lib/database')
const processMail = require('../src/lib/email')
const XLSX = require('../src/lib/xlsx/xlsx')
const { generateInventory, generateOccupancy, importRTM , importInventoryRTM } = require('../src/lib/rtm')
const importBonamente = require('../src/lib/bonamente')
const importEliziya = require('../src/lib/eliziya')
const {importOctagon, importInventoryOctagon } = require('../src/lib/octagon')
const { sendNotifications, sendStatus } = require ('../src/lib/smtp')
const { saveStatisticRTM } = require ('../src/lib/rtmstatistic')
const program = require('commander')
program.version('0.0.1')

// .option('-d, --debug', 'output extra debugging')
program
  .option('--bigmedia-inventory', 'Build and save file with sides for RTM')
  .option('--import-inventory-rtm', 'Load files with sides from RTM')
  .option('--bigmedia-occupancy', 'Build and save file with occupancy for RTM')
  .option('--bigmedia-static', 'Build and save file with static for RTM')
  .option('--import-email', 'Import occupancies by email')
  .option('--import-partner <partner>', 'Import specific partner')
  .option('--import-all', 'Import all partners')
  .option('--import-file <importFile>', 'Import specific file')
  .option('--import-template <templateFile>', 'Use certain template for import')
  .option('--send-notifications', 'Send notifications to partners that did not give occupancy')
  .option('--send-status', 'Send status of last received occupancy from partners')
  .option('--debug', 'Debugging file for import. Template and file must be defined')

program.parse(process.argv);

async function main () {
  if (program.debug) {
    if (!program.importFile || !program.importTemplate) {
      console.error('Import file or template is not defined');
      return
    }
    await importOccupancy(program.importFile, program.importTemplate, true)
    return
  }
  if (program.importFile) {
    await importOccupancy(program.importFile, program.importTemplate)
  }
  if (program.importAll || program.importPartner) {
    const activePartners = Object.values(partners).filter(x => (!!x.active) && (x.transport !== 'email') && (program.importAll || program.importPartner === x.name))
    const results = await Promise.all(activePartners.map(async partner => {
      if (partner.name === 'Бона Менте') {
          await importBonamente()
      } else if (partner.name === 'ЭЛИЗИЯ') {
          await importEliziya()
      } else if (partner.name === 'РТМ-Украина' || partner.name === 'СИТИ-РТМ') {
          await importRTM(partner.name)
      } else if (partner.name === 'Octagon Outdoor') {
          await importOctagon(partner.name)
      } else if (partner.transport === 'http' || partner.transport === 'https') {
        let buffer;
        try {
          if (partner.transport === 'http') {
            buffer = await getPartnerFileFromHTTP(partner)
          } else {
            buffer = await getPartnerFileFromHTTPS(partner)
          }
          // console.log(buffer.toString());
          // const str = buffer.toString()
          // let lines = iconv.decode(buffer, 'cp1251').split(/\n/)
          let lines = buffer.toString().split(/\n/)
          if (partner.format.replaceFirstLetter) {
            lines = lines.map((line)=>line.slice(1))
          }
          let data = []
          const curMonth = (new Date()).getMonth() + 1
          const statusCodes = {}
          statusCodes[partner.format.freeFlag] = 1
          statusCodes[partner.format.soldFlag] = 3
          if (partner.format.reservFlag) {
            statusCodes[partner.format.reservFlag] = 2
          }
          lines.forEach((line)=>{
            let dataRow = {}
            let lineArr = line.split(partner.format.separator)
            partner.format.fields.forEach((field, ix)=>{
              if (lineArr[ix] !== undefined) {
                dataRow[field] = lineArr[ix]
              }
            })
            for (let i = partner.format.fields.length, ix = 0; (i < lineArr.length) && (ix <= 11); i++, ix++) {
              if (lineArr[i] !== undefined && statusCodes[lineArr[i]]) {
                dataRow['occ_' + (curMonth + ix).toString()] = statusCodes[lineArr[i]]
              }
            }
            if (Object.keys(dataRow).length >= 2) {
              dataRow['supplier_name'] = partner.name
              data.push(dataRow)
            }
          })
          // console.dir(data)
          // return
          const operationId = await saveToDB(data)
          console.log(operationId + ' - ' + partner.name)
        } catch (e) {
          console.error('Partner "' + partner.name + '" - ' + e)
        }
      } else if (partner.transport === 'ftp') {
        const buffer = await getPartnerFileFromFTP(partner)
        if (!buffer) {
            console.error('error obtain data from partner: ' + partner.name)
            return
        }
        if (partner.format) {
          // let lines = iconv.decode(fs.readFileSync(res), 'cp1251').split(/\n/)
          let lines = iconv.decode(buffer, 'cp1251').split(/\n/)
          if (partner.format.replaceFirstLetter) {
            lines = lines.map((line)=>line.slice(1))
          }
          let data = []
          const curMonth = (new Date()).getMonth() + 1
          const statusCodes = {}
          statusCodes[partner.format.freeFlag] = 1
          statusCodes[partner.format.soldFlag] = 3
          if (partner.format.reservFlag) {
            statusCodes[partner.format.reservFlag] = 2
          }
          lines.forEach((line)=>{
            let dataRow = {}
            let lineArr = line.split(partner.format.separator)
            partner.format.fields.forEach((field, ix)=>{
              if (lineArr[ix] !== undefined) {
                dataRow[field] = lineArr[ix]
              }
            })
            for (let i = partner.format.fields.length, ix = 0; i < lineArr.length; i++, ix++) {
              if (lineArr[i] !== undefined && statusCodes[lineArr[i]]) {
                dataRow['occ_' + (curMonth + ix).toString()] = statusCodes[lineArr[i]]
              }
            }
            if (Object.keys(dataRow).length >= 2) {
              dataRow['supplier_name'] = partner.name
              data.push(dataRow)
            }
          })
          // console.dir(data)
          const operationId = await saveToDB(data)
          console.log(operationId + ' - ' + partner.name)
        } else {
          const wb = XLSX.read(buffer)
          const res = await importWorkbook(wb, 'template_occ_' + partner.name + '.xlsx')
          if (res) {
              console.log(res + ' - ' + partner.name)
          }
          // importOccupancy(res, 'template_occ_' + partner.name + '.xlsx')
        }
      }
    }))
    // pop3 port 110
  }
  if (program.importAll || program.importEmail || program.importPartner) {
      await processMail(program.importPartner)
  }
  // rtm out
  if (program.bigmediaInventory) {
      await importInventoryOctagon();
      await importInventoryRTM();
      await generateInventory();
  }
  if (program.importInventoryRtm) {
    console.log('Start Import Inventory Rtm')
    await importInventoryRTM();
    console.log('End Import Inventory Rtm')
  }
  if (program.bigmediaOccupancy) {
      await generateOccupancy()
  }
  if (program.sendNotifications) {
      await sendNotifications()
  }
  if (program.sendStatus) {
      await sendStatus()
  }
  if (program.bigmediaStatic) {
    await saveStatisticRTM()
  }
}

main().catch((err)=>{
    console.error(err)
    process.exit(1)
})
