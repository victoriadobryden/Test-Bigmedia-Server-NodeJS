const sql = require('mssql')
const config = require('../config')

async function getFromDB (query) {
    try {
      const pool = new sql.ConnectionPool(config.mssql)
      // const poolConnect = await pool.connect()
      // pool.on('error', err=>{
      //   throw err
      // })
      await pool.connect()
      const result = await pool.request()
        .query(query)
      pool.close()
      return result
    } catch (err) {
      console.error(err);
      // ... error checks
    }
}

async function execRTMStat () {
  try {
    const pool = new sql.ConnectionPool(config.mssql)
    await pool.connect()
    const result = await pool.request()
      .execute('sp_fin_stat_analysis_rtm_export')
    pool.close()
    return result
  } catch (err) {
    console.error(err);
    // ... error checks
  }
}
async function execRTMStatService () {
  try {
    const pool = new sql.ConnectionPool(config.mssql)
    await pool.connect()
    const result = await pool.request()
      .execute('sp_stat_service_rtm_export')
    pool.close()
    return result
  } catch (err) {
    console.error(err);
    // ... error checks
  }
}
async function execRTMStatPhotorep () {
  try {
    const pool = new sql.ConnectionPool(config.mssql)
    await pool.connect()
    const result = await pool.request()
      .execute('sp_stat_photorep_rtm_export')
    pool.close()
    return result
  } catch (err) {
    console.error(err);
    // ... error checks
  }
}

async function saveToDB (data, settings) {
  try {
    const xml = buildXML(data, settings)
    // console.log([data, settings]);
    if (!xml) {
        console.error('empty xml');
        return
    }
    // console.log(xml);
    //  return
    const pool = new sql.ConnectionPool(config.mssql)
    await pool.connect()
    const result = await pool.request()
      .input('xml', sql.NVarChar(sql.MAX), xml)
      .output('id_operation', sql.Int)
      .query(`if @id_operation is null begin
            insert platform_operation (id_person, logtime) values (dbo.getIDPersonDefault(), getdate()) select @id_operation = SCOPE_IDENTITY()
        end
        if @id_operation is not null
            insert platform_occupancy_stock (xml_data, id_operation, id_person, logtime)
            values (@xml, @id_operation, 1, getdate())`)
    const id_operation = result.output['id_operation']
    pool.close()
    return id_operation
  } catch (err) {
    console.error(err);
    // ... error checks
  }
}

async function execProcXML (procedureName, xml) {
  try {
    const pool = new sql.ConnectionPool(config.mssql)
    await pool.connect()
    const result = await pool.request()
      // .input('xml', sql.NVarChar(sql.MAX), xml)
      .input('xml', sql.Xml, xml)
      .output('id_operation', sql.Int)
      .query(`exec ${procedureName} @xml, @id_operation OUTPUT`)
    const id_operation = result.output['id_operation']
    pool.close()
    return id_operation
  } catch (err) {
    console.error(err);
  }
}

function buildXML (data, settings) {
  // console.warn(data);
  const curMonthNum = new Date().getMonth() + 1,
    curYear = new Date().getFullYear(),
    nextYear = curYear + 1
    const records = data.reduce((res, row)=>{
        let str = '<side ';
        let attr = Object.keys(row).filter((key)=>(!key.match(/^occ_/))).reduce((res, key)=>{
            if (row[key] === undefined) {
                return res;
            }
            if (row[key] === null) {
                return res + key + '="" '
            } else {
                let v = (row[key].replace) ? row[key].replace(/&/g,'&amp;') : row[key]
                v = (v.replace) ? v.replace(/"/g,'&quot;') : v
                v = (v.replace) ? v.replace(/</g,'&lt;') : v
                v = (v.replace) ? v.replace(/>/g,'&gt;') : v
                v = (v.replace) ? v.replace(/'/g,'&apos;') : v
                return res + key + '="' + v + '" '
            }
        }, '')
        str += attr + '>'
        let occ = Object.keys(row).filter((key)=>(row[key] && key.match(/^occ_/))).reduce((res, key)=>{
              const monIndex = key.match(/^occ_(\d+).*/)[1]
              let year
              if (key.match(/^occ_(\d+)_(\d+)/)) {
                  year = key.match(/^occ_(\d+)_(\d+)/)[2]
              }
              if (!year) {
                  year = (monIndex < curMonthNum ) ? nextYear : curYear
              }
              return res + `<occupancy month="${monIndex}" year="${year}" status="${row[key]}"></occupancy>`
          }, '')
        str += occ
        
        str += '</side>'
        if (((attr && attr.length > 0) && occ)||( (attr && attr.length > 0) && (settings==='Inventory' || settings==='Inventory RTM'))) {
            res.push(str)
        }
        return res
    }, [])
    const res = records.join('')
    return res
}

module.exports = { saveToDB, getFromDB, execProcXML, buildXML ,execRTMStat, execRTMStatService, execRTMStatPhotorep }
