const Client = require('ftp')
// const fs = require('fs')
const { tempDir } = require('../config')
const stream = require('stream')
const { promiseFromCBMethod, promiseFromStreamEvents } = require('../utils/async')

function connectAsync(c, opts) {
   return new Promise((resolve, reject) => {
      c.once('ready', resolve)
      c.once('error', reject)
      c.connect(opts)
  })
}

// function promiseFromStreamEvents (emitter) {
//   return new Promise((resolve, reject)=>{
//     emitter.on('error', reject)
//     emitter.on('end', _ => resolve('end'))
//     emitter.on('close', _ => reject(Error('StreamClosed')))
//   })
// }

async function getPartnerFileFromFTP (config) {
  const c = new Client()
  let fileBuffer
  try {
    cAsync = await connectAsync(c, config.ftp)
    const getPromise = (fn)=>new Promise((resolve, reject)=>{
      c.get(fn, (err, stream)=>{
        if (err) reject (err)
        const chunks = []
        stream.on('data', chunk=>chunks.push(chunk))
        stream.on('end', ()=>resolve(Buffer.concat(chunks)))
      })
    })
    fileBuffer = await getPromise(config.fileName).catch(function(e) {
      console.error('Ftp error: %o', e); // "oh, no!"
    })
  }
  catch (e) {
      console.error('Ftp error: %o', e)
      return
  }
  finally {
    if (c) c.end()
  }
  return fileBuffer
}

async function saveFileToFTP (config, fileBuffer, destination) {
  const c = new Client()
  try {
    cAsync = await connectAsync(c, config.ftp)
    const putPromise = (fn)=>new Promise((resolve, reject)=>{
      c.put(fileBuffer, destination, (err)=>{
        if (err) reject (err)
        c.end()
        resolve()
      })
    })
    await putPromise(config.fileName)
  }
  catch (e) {
    console.error('Error saving to ftp: %o', e);
  }
  finally {
    if (c) c.end()
  }
}

module.exports = {getPartnerFileFromFTP, saveFileToFTP}
