const { getFromDB, saveToDB, buildXML, execProcXML} = require('./database')
const partners = require('../config/partners')
const { createWorkbook } = require('./excel')
const XLSX = require('./xlsx/xlsx')
const getPartnerFileFromHTTP = require('./http')
const fs = require('fs')
const { promiseFromCBFunction } = require('../utils/async')

const writeFile = promiseFromCBFunction(fs.writeFile)

async function importRTM(supplierName) { //for РТМ & СИТИ-РТМ
    const buffer = await getPartnerFileFromHTTP(partners.rtm)  //for  РТМ & СИТИ-РТМ there are analogue
    try {
        const wb = XLSX.read(buffer, {cellDates: true, cellStyles: true})
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(sheet, {header: 1})
        if (!json) {
            console.error('РТМ - error: no input data')
        }
        const bmStatus = [1, 3, 2]
        const data = json.map((row)=>{
            const logtime = row[1],
            curMonth = new Date().getMonth(),
            curYear = new Date(logtime).getFullYear(),
            nextYear = curYear + 1,
            res = {
                orig_id: row[2],
                logtime: row[1],
                supplier_name: supplierName //'РТМ-Украина'
            }
            for (let i = 3 + curMonth; i < row.length; i++) {
                const mNum = (i >= 3 + 12) ? (i - 14) : (i - 2)
                if (i < (3 + 12) || mNum < curMonth + 1)
                res['occ_' + mNum] = bmStatus[row[i]]
            }
            return res
        })
        // console.log(data);
        const res = await saveToDB(data)
        if (res) {
            console.log(res + ' - ' + supplierName)
        }
    } catch (e) {
        console.error('Error import RTM file. Cannot read file');
        return
    }
}
async function importInventory(config) {
    const buffer = await getPartnerFileFromHTTP(config);
    try {
        const wb = XLSX.read(buffer, {cellDates: true, cellStyles: true})
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(sheet, {header: 1})
        if (!json) {
            console.error('РТМ Inventory - error: no input data')
        }
        const data = json.map((row)=>{
            const 
                res = {
                    orig_id: row[2],
                    logtime: row[1],
                    orig_side_num: row[3],
                    supplier_name: config.name, //'РТМ-Украина'
                    //supplier_name: row[3].substr(0, 2)==='Od' ? 'СИТИ-РТМ' : config.name, //'РТМ-Украина'
                    orig_city: row[4],
                    orig_address: row[7],
                    address: row[7],
                    orig_type: row[10],
                    orig_size: row[11],
                    orig_catab: row[12],
                    orig_light: row[13],
                    doors_no: row[14],
                    lon: row[15],
                    lat: row[16],
                    angle: row[17],
                    photo_url: row[18],
                    schema_url: row[20],
                    //price: row[22]
                    // price: row[23]
                }
            if(!row[22] && row[22]!=0)
                res.price=row[22];
            res.primarysale = (config.fileName=='www.rtm.com.ua/!os/bb.media/bb_rtmmodel_BM.xlsx') ? 'BigBoard' : config.name; 
            return res
        })
        const xml= buildXML(data,'Inventory RTM')
        const res = await execProcXML('sp_web_platform_import_inventory_rtm', xml)
        // const res = await saveToDB(data,'Inventory')
        if (res) {
            console.log( `${res} - Import Inventory  ${config.name} from http://${config.fileName}`)
        }
    
    } catch (e) {
        console.error(`Error import Inventory RTM file[${config.fileName}]. Cannot read file`);
        return
    }
}

async function importInventoryRTM() { //for РТМ
    let config = JSON.parse(JSON.stringify(partners.rtm));
    for (const fn of config.fileInventory) {
        config.fileName = fn;
        await importInventory(config);
    };
    
    // config.fileName = config.fileInventoryName;
    
    // const buffer = await getPartnerFileFromHTTP(config);
    // try {
    //     const wb = XLSX.read(buffer, {cellDates: true, cellStyles: true})
    //     const sheet = wb.Sheets[wb.SheetNames[0]]
    //     const json = XLSX.utils.sheet_to_json(sheet, {header: 1})
    //     if (!json) {
    //         console.error('РТМ Inventory - error: no input data')
    //     }
    //     const data = json.map((row)=>{
    //         const 
    //             res = {
    //                 orig_id: row[2],
    //                 logtime: row[1],
    //                 orig_side_num: row[3],
    //                 supplier_name: config.name, //'РТМ-Украина'
    //                 //supplier_name: row[3].substr(0, 2)==='Od' ? 'СИТИ-РТМ' : config.name, //'РТМ-Украина'
    //                 orig_city: row[4],
    //                 orig_address: row[7],
    //                 address: row[7],
    //                 orig_type: row[10],
    //                 orig_size: row[11],
    //                 orig_catab: row[12],
    //                 orig_light: row[13],
    //                 doors_no: row[14],
    //                 lon: row[15],
    //                 lat: row[16],
    //                 angle: row[17],
    //                 photo_url: row[18],
    //                 schema_url: row[20],
    //                 price: row[22]
    //                 // price: row[23]
    //             }
    //         return res
    //     })
    //     const xml= buildXML(data,'Inventory')
    //     const res = await execProcXML('sp_web_platform_import_inventory', xml)
    //     // const res = await saveToDB(data,'Inventory')
    //     if (res) {
    //         console.log( res + ' - Import Inventory ' + config.name)
    //     }
    
    // } catch (e) {
    //     console.error('Error import Inventory RTM file. Cannot read file');
    //     return
    // }
}
async function generateInventory () {
    const data = await getFromDB(`select * from v_rtm_out`)
    const dataArray = data.recordset.map((obj)=>Object.values(obj))
    // console.log(dataArray);
    const wbBuffer = createWorkbook(dataArray)
    await writeFile(partners.rtm.out.stockFileName, wbBuffer)
    // await saveFileToFTP(partners.rtm.out, wbBuffer, partners.rtm.out.stockFileName)
}
async function generateOccupancy () {
    const data = await getFromDB(`select * from v_rtm_occ_out`)
    const dataArray = data.recordset.map((obj)=>Object.values(obj))
    const wbBuffer = createWorkbook(dataArray)
    await writeFile(partners.rtm.out.occupancyFileName, wbBuffer)
    // await saveFileToFTP(partners.rtm.out, wbBuffer, partners.rtm.out.occupancyFileName)
}

module.exports = { generateInventory, generateOccupancy, importRTM, importInventoryRTM }
