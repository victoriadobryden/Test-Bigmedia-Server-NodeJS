const getPartnerFileFromHTTPS = require('./https')
const partners = require('../config/partners')
const iconv = require('iconv-lite')
const { saveToDB, buildXML, execProcXML} = require('./database')
const { parse } = require('commander')

async function importOctagon(supplierName) { //Octagon Outdoor
    const buffer = await getPartnerFileFromHTTPS(partners.octagon)  //Octagon Outdoor
    try {
        const json = JSON.parse(buffer.toString()),
             logtime = new Date(),
             firstDay = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()-new Date().getDate()+2)
        const data = json.map((row)=>{
            const
                res = {
                    orig_side_num : row.FaceNumberOld,
                    logtime: logtime,
                    supplier_name: supplierName
                }
                for (let i = 0 ; i < Object.keys(row).length-1; i++) {
                    let mo = 'Today' + ((i!==0) ? i + 'M' : ''),
                    loadDate = new Date(new Date(firstDay).setMonth(firstDay.getMonth() + i))
                    res['occ_' + (new Date(loadDate).getMonth() + 1) ] = Number(`${row[mo]} `)+2 || 1;
                }
                return res
        })
        const res = await saveToDB(data)
        if (res) {
           console.log(res + ' - ' + supplierName)
        }
    } catch (e) {
        console.error('Error import Octagon Outdoor.');
        return
    }
}
async function importInventoryOctagon() { //for РТМ
    let config = JSON.parse(JSON.stringify(partners.octagon));
    config.fileName = config.fileInventoryName;
    const buffer = await getPartnerFileFromHTTPS(config);
    try {
        const json = JSON.parse(buffer.toString()),
            logtime = (new Date()).toISOString().replace('T', ' ').substr(0, 19);
            
            const data = json.map((row)=>{
            const
                angle1=Math.ceil((parseInt(row.angle)||0)/5) * 5 ,
                angle=((180 + ((angle1<0)? Math.abs(angle1) : 360 - angle1 ))%360),//(angle1<=0 ? (angle1+180) : (angle1+180)%360),                
                res = {
                    //orig_id: null,
                    logtime: logtime,
                    orig_side_num: row.code,                    
                    supplier_name: config.name, //'Octagon Outdoor'
                    orig_city: row.city,
                    orig_address: row.address,
                    orig_type: row.media_type,
                    orig_size: row.media_size,
                    orig_catab: row.side,
                    orig_light: row.illuminated,
                    doors_no: row.doors_code,
                    lat: row.lat,
                    lon: row.lon,
                    angle: angle ,
                    photo_url: row.photo,
                    //schema_url: row[20],
                    price: row.price

                }
                //if (row.code==='Te050'||row.code==='Te049'||row.code==='Te030') console.log([row.angle,angle1,angle,row.code]);
                return res
        })
        // console.log(data);
        const xml= buildXML(data,'Inventory')
        const res = await execProcXML('sp_web_platform_import_inventory', xml)
        // const res = await saveToDB(data,'Inventory')
        if (res) {
           console.log( res + ' - Import Inventory ' + config.name)
        }
    } catch (e) {
        console.error('Error import Inventory Octagon Outdoor.');
        return
    }

}
module.exports = { importOctagon, importInventoryOctagon }