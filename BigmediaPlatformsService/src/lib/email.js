const { importWorkbook } = require('./excel')
const config = require('../config')
const partners = require('../config/partners')
const mailx = require('mailx')
const XLSX = require('./xlsx/xlsx')

async function processMail (partnerName) {
  const store = await asyncConnect()
  if (store) {
    await processInbox (store, partnerName)
    store.close()
  }
}

async function asyncConnect () {
    const store = mailx.store(config.mail.protocol, config.mail.host, config.mail.port, config.mail.user, config.mail.password)
    return new Promise((resolve, reject)=>{
      store.connect((err)=>{
        if (err) {
          return console.log('connect error', err)
          reject()
        } else {
          resolve(store)
        }
      })
  })
}

async function processInbox (store, partnerName) {
  const messages = await asyncGetInboxMessages(store)
  return await Promise.all(messages.map(async (message)=>{
    if (message.from.address === 'ilya.kiselov@bigmedia.com.ua') {
      if (message.attachments) {
        let hasErrors = false
        await Promise.all(
          message.attachments.filter((att)=>{
            return att.fileName.match(/\.xlsx?/)
          }).map(async (att)=>{
            let wb = XLSX.read(att.content, {cellDates: true, cellStyles: true, sheetStubs: true})
            console.warn(att.fileName)
            const res = await importWorkbook(wb)
            if (res) {
              console.log(res + ' - ' + att.fileName)
            } else {
              hasErrors = true
            }
          })
        )
        if (hasErrors) {
            await moveMessage(store, message, 'Errors')
        } else {
            await moveMessage(store, message, 'Processed')
        }
      }
    } else {
      const emailPartners = Object.values(partners).filter((partner)=>{
        return partner.transport === 'email' && !!partner.active && (!partnerName || partner.name === partnerName) && partner.email.addresses.some((pemail)=>(pemail === message.from.address))
      })
      if (emailPartners && emailPartners.length > 0 && message.attachments && message.attachments.length > 0) {
        let hasErrors = false
        let error = ''
        await Promise.all(message.attachments.filter((att)=>{
          return att.fileName.match(/\.xlsx?/)
        }).map(async (att)=>{
          try {
            const wb = XLSX.read(att.content, {cellDates: true, cellStyles: true, sheetStubs: true})
            const res = await importWorkbook(wb, 'template_occ_' + emailPartners[0].name + '.' + (emailPartners[0].templateExt || 'xlsx'))
            if (!res) {
              hasErrors = res
            } else {
              console.log(res + ' - ' + emailPartners[0].name)
            }
          }
          catch (e) {
            hasErrors = true
            error = e.message
          }
        }))
        if (hasErrors) {
            console.error('Error when open excel file. Supplier: ' + emailPartners[0].name + '. Error: ' + error)
            await moveMessage(store, message, 'Errors')
        } else {
            await moveMessage(store, message, 'Processed')
        }
      } else if (!partnerName) {
        await moveMessage(store, message, 'Trash')
      }
    }
  }))
}

async function asyncGetInboxMessages (store) {
  return new Promise((resolve, reject)=>{
    store.getInboxMessages(0, (err, messages)=>{
      if (err) {
        reject()
      } else {
        resolve(messages)
      }
    })
  })
}

async function openInbox (store) {
  return new Promise((resolve, reject)=>{
    store.IMAPClient.openBox('INBOX', false, resolve)
  })
}

async function moveMessage (store, msg, box) {
  await openInbox(store)
  return new Promise((resolve, reject)=>{
    store.IMAPClient.move(msg.uid, box, (err)=>{
      if (err) {
        console.error('Error move message to ' + box, err)
        reject()
      } else {
        console.log('message processed successfully')
        resolve()
      }
    })
  })
}

module.exports = processMail
