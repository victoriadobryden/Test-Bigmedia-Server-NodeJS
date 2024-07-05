const templateDir = './src/templates'
const fs = require('fs')
const XLSX = require('./xlsx/xlsx')
const { saveToDB, buildXML } = require('./database')
const _ = require('lodash')

let supplierName

async function importOccupancy (fileIn, template, debug) {
  let workbook
    try {
        if (!fs.existsSync(fileIn)) {
            console.error('File ' + fileIn + ' does not exist')
            return false
        }
        if (template && !fs.existsSync(templateDir + '/' + template)) {
            console.error('Template file ' + templateDir + '/' + template + ' does not exist')
            return false
        }
        workbook = XLSX.readFile(fileIn, {cellDates: true, cellStyles: true, sheetStubs: true})
        const res = await importWorkbook(workbook, template, debug)
        return res
    } catch(err) {
        console.error(err)
        return
    }
}

async function importWorkbook (workbook, template, debug) {
  const tpl = template ? XLSX.readFile(templateDir + '/' + template, {cellDates: true, cellStyles: true, sheetStubs: true}) : findTemplate(workbook)
  if (template) {
    const m = template.match(/template_occ_(.*)\./)
    if (m) {
        supplierName = m[1]
    }
  }
  if (tpl) {
      const settings = initSettings(tpl)
      // console.dir(settings.sheets[0].fields);
      // return
      const data = loadData(tpl, workbook, settings)
      // const xml = buildXML(data)
      // const x = xml.replace(/'/g, "''")
      // console.dir(settings.sheets[0].fields)
      // console.log(data.slice(-40))
      if (debug) {
        console.log(JSON.stringify(data, null, 2))
        return
      }
      // console.dir(x);
      // console.warn(data.length)
      const operationId = await saveToDB(data)
      // console.log(operationId);
      return operationId
      //console.dir({everything: 'fine'});
  } else {
      console.error('No appropriate template found')
      return false
  }
}

function getOccStatus (cell, settings) {
    const value = (cell && cell.v !== undefined) ? cell.v : ''
    if (settings.freeStyle) {
      // console.dir([settings.freeStyle, cell.s]);
        if ( (settings.freeStyle.isEmpty && (!cell || !cell.s || !cell.s.fgColor)) || (cell && cell.s && cell.s.fgColor && _.isEqual(cell.s.fgColor, settings.freeStyle.fgColor))) {
            return 1
        }
    } else if (settings.freeFlag) {
        if (settings.freeFlag.isEmpty && value === '') {
            return 1
        }
        if (!settings.freeFlag.isEmpty && value === settings.freeFlag.flag) {
            return 1
        }
    }
    if (settings.reservStyle) {
        if (cell && cell.s && _.isEqual(cell.s.fgColor, settings.reservStyle.fgColor)) {
            return 2
        }
    } else if (settings.reservFlag) {
        if (settings.reservFlag.isEmpty && value === '') {
            return 2
        }
        if (!settings.reservFlag.isEmpty && value === settings.reservFlag.flag) {
            return 2
        }
    }
    if (settings.reservTempStyle) {
        if (cell && cell.s && _.isEqual(cell.s.fgColor, settings.reservTempStyle.fgColor)) {
            return 2
        }
    } else if (settings.reservTempFlag) {
        if (settings.reservTempFlag.isEmpty && value === '') {
            return 2
        }
        if (!settings.reservTempFlag.isEmpty && value === settings.reservTempFlag.flag) {
            return 2
        }
    }
    if (settings.soldStyle) {
        if (cell && cell.s && _.isEqual(cell.s.fgColor, settings.soldStyle.fgColor)) {
            return 3
        }
    } else if (settings.soldFlag) {
        if (settings.soldFlag.isEmpty && value === '') {
            return 3
        }
        if (!settings.soldFlag.isEmpty && value === settings.soldFlag.flag) {
            return 3
        }
    }
    // console.log(cell);
    return 3
}

function loadData (tplWB, workbook, settings) {
    let sheet
    let data = []
    // settings.sheets.forEach((sheetObj)=>{
    const sheetObj = settings.sheets[0]
    for(let sheetName in workbook.Sheets) {
        // if (settings.sheets.length === 1) {
        //     sheet = workbook.Sheets[workbook.SheetNames[0]]
        // } else {
        //     sheet = workbook.Sheets[sheetObj.name]
        // }
        // if (!sheet) {
        //     console.error('sheet not found. supplier: ' + supplierName)
        //     return
        // }
        const sheet = workbook.Sheets[sheetName]
        const merges = sheet['!merges']
        let range
        try {
            range = XLSX.utils.decode_range(sheet['!ref'])
        } catch (e) {
            console.error('sheet is empty. supplier: ' + supplierName)
            continue
        }
        const fields = {}
        // console.log('dataStartCol: ' + sheetObj.dataStartCol);
        // return
        if (sheetObj.colsRow === undefined) {
            Object.values(sheetObj.fields).forEach((field)=>fields[field.col] = field)
        }
        // console.log(sheet['!ref']);
        // console.log(range.e.c);
        // return;
        for (let C = sheetObj.dataStartCol; C <= range.e.c; C++) {
            const cell = sheet[XLSX.utils.encode_cell({c:C, r:sheetObj.colsRow})]
            //  console.log(cell);
            if (cell && cell.v) {
                if (cell.t === 'd') {
                    let _data=cell.v;
                    _data.addDays(1); 
                    //_data.addHours(3);
                    // console.log(_data,_data.getUTCDate())

                    if(_data.getUTCDate()!==1)
                    {
                        _data.addDays(-1); 
                        // console.log('-1')
                    }
                    fields[C] = {
                        col: C,
                        monthIndex: _data.getMonth() + 1 ,
                        year: _data.getFullYear()
                    }
                } else {
                    if (settings.monthRe && cell.w) {
                        let y
                        if (settings.yearRe) {
                            const myear = cell.w.match(settings.yearRe)
                            if (myear && myear[1]) {
                                if (myear[1].length <= 2) {
                                    y = 2000 + (+myear[1])
                                } else {
                                    y = +myear[1]
                                }
                            }
                        }
                        const m = cell.w.match(settings.monthRe)
                        if (m && m[1]) {
                          var fMonth = Object.keys(settings.monthes).filter((month)=>month === m[1]);
                          if (fMonth && fMonth.length > 0) {
                              fields[C] = {
                                  col: C,
                                  monthName: fMonth[0],
                                  monthIndex: settings.monthes[fMonth[0]].monthIndex
                                }
                              }
                          else if (+m[1] >= 0) {
                            fields[C] = {
                              col: C,
                              monthIndex: +m[1]
                            }
                          }
                          if (fields[C]) {
                            if (y) {
                              fields[C].year = y
                            } else {
                              const sameMonth = Object.values(fields).filter((field)=>field.col != C && field.monthIndex === +m[1])
                              if (sameMonth && sameMonth.length > 0) {
                                fields[C].year = sameMonth[0].year ? sameMonth[0].year + 1 : (newDate().getFullYear() + 1)
                              }
                            }
                          }
                        }
                    }
                }
                if (!fields[C]) {
                    const foundMonth = Object.keys(settings.monthes).filter((month)=>month.trim().toLowerCase() === cell.v.toString().trim().toLowerCase())
                    // console.warn('====>',cell.v.toString(),foundMonth)
                    if (foundMonth && foundMonth.length > 0) {
                        fields[C] = {
                            col: C,
                            monthName: foundMonth[0],
                            monthIndex: settings.monthes[foundMonth[0]].monthIndex
                        }
                        const sameMonth = Object.values(fields).filter((field)=>(field.col != C) && (field.monthIndex === settings.monthes[foundMonth[0]].monthIndex))
                        if (sameMonth && sameMonth.length > 0) {
                            fields[C].year = sameMonth[0].year ? sameMonth[0].year + 1 : (new Date().getFullYear() + 1)
                        }
                    }
                    else {
                      let safeName = cell.v.toString()
                      safeName = safeName.replace(/\n/g, '').trim().toLowerCase()
                    //   console.warn(safeName)
                      const found = Object.values(sheetObj.fields).filter((fieldObj)=>fieldObj.fieldLabel.replace(/\n/g, '').trim() === safeName)
                      if (found && found.length > 0) {
                        fields[C] = found[0]
                        fields[C].col = C
                      }
                    }
                }
            }
        }
        // console.dir(fields);
        // return;
        for (let R = sheetObj.dataStartRow; R <= range.e.r; ++R) {
            let dataRow = {}
            if ((sheetObj.monthCol !== undefined) && (sheetObj.statusCol !== undefined)) {
                const colCellRef = XLSX.utils.encode_cell({c:sheetObj.monthCol, r:R})
                const colCell = sheet[colCellRef]
                const statCellRef = XLSX.utils.encode_cell({c:sheetObj.statusCol, r:R})
                const statCell = sheet[statCellRef]
                let monthIndex
                let year
                if (colCell.t === 'd') {
                    //console.log(colCell.t)
                    monthIndex = colCell.v.getMonth() + 1
                    year = colCell.v.getFullYear()
                } else {
                    if (settings.monthRe && colCell.w) {
                        if (settings.yearRe) {
                            const myear = colCell.w.match(settings.yearRe)
                            if (myear && myear[1]) {
                                if (myear[1].length <= 2) {
                                    year = 2000 + (+myear[1])
                                } else {
                                    year = +myear[1]
                                }
                            }
                        }
                        const m = colCell.w.match(settings.monthRe)
                        if (m && m[1]) {
                            monthIndex = +m[1]
                        }
                    }
                }
                if (year) {
                    dataRow['occ_' + monthIndex + '_' + year] = getOccStatus(statCell, settings)
                } else {
                    dataRow['occ_' + monthIndex] = getOccStatus(statCell, settings)
                }
            }
            for (let C = sheetObj.dataStartCol; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({c:C, r:R})
                const cell = sheet[cellRef]
                // console.log([C, fields[C], cell]);
                // if (C >= sheetObj.occStart) {
                //     const tplCellRef = XLSX.utils.encode_cell({c:C+1, r:sheetObj.dataStartRow})
                //     const tplCell = tplWB.Sheets[sheetObj.name][tplCellRef]
                //     if (tplCell && tplCell.v === '<month>') {
                //         const colCellRef = XLSX.utils.encode_cell({c:C, r:sheetObj.colsRow})
                //         const colCell = sheet[colCellRef]
                //         // console.log(colCell);
                //         const monIndex = Object.keys(settings.monthes).reduce((res, mon)=>{
                //             return res || ((colCell && colCell.v == mon) ? settings.monthes[mon].monIndex : null)
                //         }, null)
                //         // console.log(monIndex);
                //         if (monIndex) {
                //             dataRow['occ_' + monIndex] = getOccStatus((cell ? cell.v : ''), settings)
                //         }
                //         continue
                //     } else if (tplCell && (tplCell.v === '<month_value>')) {
                //         const colCellRef = XLSX.utils.encode_cell({c:C, r:R})
                //         const colCell = sheet[colCellRef]
                //         const statCellRef = XLSX.utils.encode_cell({c:sheetObj.statusCol, r:R})
                //         const statCell = sheet[statCellRef]
                //         if (colCell && colCell.v) {
                //           // console.warn(colCell)
                //           if (settings.monthRe) {
                //             // const m = colCell.v.toString().match(settings.monthRe)
                //             let y
                //             if (settings.yearRe) {
                //                 const myear = colCell.w.match(settings.yearRe)
                //                 if (myear && myear[1]) {
                //                     y = myear[1]
                //                 }
                //             }
                //             const m = colCell.w.match(settings.monthRe)
                //             if (m && m[1]) {
                //               let mName = 'occ_' + m[1]
                //               if (y) {
                //                   mName = mName + '_' + y
                //               }
                //               dataRow[mName] = getOccStatus((statCell ? statCell.v : ''), settings)
                //               // console.log(dataRow);
                //             }
                //           } else {
                //             const monIndex = Object.keys(settings.monthes).reduce((res, mon)=>{
                //               return res || ((colCell && colCell.v === mon) ? settings.monthes[mon].monIndex : null)
                //             }, null)
                //             if (monIndex) {
                //               dataRow['occ_' + monIndex] = getOccStatus((statCell ? statCell.v : ''), settings)
                //             }
                //           }
                //         }
                //         continue
                //     }
                // }
                // const field = Object.keys(fields).reduce((res, key)=>{
                //   const field = fields[key]
                //   return res || ((field.col === C) ? field : null)
                // }, null)
                const field = fields[C]
                if (field) {
                  if (field.monthIndex) {
                      if (field.year) {
                          dataRow['occ_' + field.monthIndex + '_' + field.year] = getOccStatus(cell, settings)
                      } else {
                          dataRow['occ_' + field.monthIndex] = getOccStatus(cell, settings)
                      }
                  } else {
                    if (cell && cell.l && cell.l.Target && (field.fieldName === 'photo_url' || field.fieldName === 'schema_url')) {
                          // console.log(cell.l);
                        dataRow[field.fieldName] = cell.l.Target
                    } else if ((field.fieldName === 'photo_url' || field.fieldName === 'schema_url') && cell && cell.f && cell.f.match(/^HYPERLINK/)) {
                        var m = cell.f.match(/^HYPERLINK\(\"(.*?)\"/)
                        var url = m && m[1] ? m[1] : null
                        if (url) {
                            dataRow[field.fieldName] = url
                        }
                    } else {
                        if (!cell && merges) {
                            const findTopMergeObj = merges.filter((mergeObj)=>mergeObj.s.c <= C && mergeObj.e.c >= C && mergeObj.s.r <= R && mergeObj.e.r >= R)
                            if (findTopMergeObj && findTopMergeObj[0]) {
                                const topMergedCelllRef = XLSX.utils.encode_cell({c:findTopMergeObj[0].s.c, r:findTopMergeObj[0].s.r})
                                const topMergedCell = sheet[topMergedCelllRef]
                                dataRow[field.fieldName] = topMergedCell ? topMergedCell.v : null
                            }
                        }
                        if (!dataRow[field.fieldName]) {
                            if (field.fieldName === 'price' || field.fieldName === 'price_alt') {
                                try {
                                    var price = cell ? cell.v : null
                                    if (price && (typeof price === 'string')) {
                                        price = price.replace(/\s+/g,'');
                                        price = price.replace(/\,/g, '.');
                                    }
                                    dataRow['price'] = +price;
                                } catch (e) {
                                    console.error('error converting price: %o', price)
                                }
                            } else {
                              var val = cell ? cell.v : null
                              if (val && typeof val == 'string') {
                                val = val.trim()
                              }
                              dataRow[field.fieldName] = val
                            }
                        }
                    }
                  }
                  //console.log(dataRow)
                }
            }
             //console.log(dataRow)
            if (settings.jointId) {
                dataRow['orig_id'] = settings.jointId.reduce((res, col)=>res + (dataRow[col] === null || dataRow[col] === undefined ? '' : dataRow[col]), '')
            }
            if (Object.keys(dataRow).length > 0 && (dataRow['orig_id'] || dataRow['orig_side_num']) && 
                ( !dataRow['price'] || dataRow['price'] == +dataRow['price'])
            ) {
              
              dataRow['price'] = +dataRow['price'] || null
              dataRow['supplier_name'] = supplierName
              if (dataRow['lat']) {
                dataRow['lat'] = +dataRow['lat'] || null
              }
              if (dataRow['lon']) {
                dataRow['lon'] = +dataRow['lon'] || null
              }
              data.push(dataRow)
            }
            // console.log(dataRow)
            //  else {
            //   console.log(dataRow);
            // }
        }
    }
    // })
    return data
}

function initSettings (tplWB) {
    if (!tplWB.SheetNames[1]) {
        return false
    }
    let settings = {}
    const tplSheet2 = tplWB.Sheets['settings'] || tplWB.Sheets[tplWB.SheetNames[1]]
    const tplRange2 = XLSX.utils.decode_range(tplSheet2['!ref'])
    for (let R = tplRange2.s.r; R <= tplRange2.e.r; ++R) {
        const tplCellRef = XLSX.utils.encode_cell({c:0, r:R})
        const tplCellRef2 = XLSX.utils.encode_cell({c:1, r:R})
        if (!tplSheet2[tplCellRef]) {
            continue
        }
        if (tplSheet2[tplCellRef].v === '[monthes]') {
            settings.monthes = {}
            for (let C = tplRange2.s.c + 1; C <= tplRange2.e.c; ++C) {
                if(typeof XLSX.utils.encode_cell({c:C, r:R}).v === 'string'){
                    settings.monthes[tplSheet2[XLSX.utils.encode_cell({c:C, r:R})].v.trim()] = {monthIndex: C}
                } else 
                    settings.monthes[tplSheet2[XLSX.utils.encode_cell({c:C, r:R})].v] = {monthIndex: C};
            }
            // console.warn(settings)
        }
        if (tplSheet2[tplCellRef].v === '[freeFlag]') {
            settings.freeFlag = {
                isEmpty: tplSheet2[tplCellRef2].v === '<empty>',
                flag: tplSheet2[tplCellRef2].v
            }
        }
        if (tplSheet2[tplCellRef].v === '[freeStyle]') {
            // console.dir(tplSheet2[tplCellRef2]);
            if (!tplSheet2[tplCellRef2] || !tplSheet2[tplCellRef2].s || !tplSheet2[tplCellRef2].s.fgColor ) { //|| !tplSheet2[tplCellRef2].s.fgColor.rgb
                settings.freeStyle = {
                    isEmpty: true
                }
            } else {
                settings.freeStyle = {
                    fgColor: tplSheet2[tplCellRef2].s.fgColor
                }
            }
        }
        if (tplSheet2[tplCellRef].v === '[reservTempFlag]') {
            settings.reservTempFlag = {
                isEmpty: tplSheet2[tplCellRef2].v === '<empty>',
                flag: tplSheet2[tplCellRef2].v
            }
        }
        if (tplSheet2[tplCellRef].v === '[reservTempStyle]') {
            // console.dir(tplSheet2[tplCellRef2]);
            if (!tplSheet2[tplCellRef2] || !tplSheet2[tplCellRef2].s || !tplSheet2[tplCellRef2].s.fgColor) {
                settings.reservTempStyle = {
                    isEmpty: true
                }
            } else {
                settings.reservTempStyle = {
                    fgColor: tplSheet2[tplCellRef2].s.fgColor
                }
            }
        }
        if (tplSheet2[tplCellRef].v === '[reservFlag]') {
            settings.reservFlag = {
                isEmpty: tplSheet2[tplCellRef2].v === '<empty>',
                flag: tplSheet2[tplCellRef2].v
            }
        }
        if (tplSheet2[tplCellRef].v === '[reservStyle]') {
            if (!tplSheet2[tplCellRef2] || !tplSheet2[tplCellRef2].s || !tplSheet2[tplCellRef2].s.fgColor) {
                settings.reservStyle = {
                    isEmpty: true
                }
            } else {
                settings.reservStyle = {
                    fgColor: tplSheet2[tplCellRef2].s.fgColor
                }
            }
        }
        if (tplSheet2[tplCellRef].v === '[soldFlag]') {
            settings.soldFlag = {
                isEmpty: tplSheet2[tplCellRef2].v === '<empty>',
                flag: tplSheet2[tplCellRef2].v
            }
        }
        if (tplSheet2[tplCellRef].v === '[soldStyle]') {
            // console.dir(tplSheet2[tplCellRef2]);
            if (!tplSheet2[tplCellRef2] || !tplSheet2[tplCellRef2].s || !tplSheet2[tplCellRef2].s.fgColor) {
                settings.soldStyle = {
                    isEmpty: true
                }
            } else {
                settings.soldStyle = {
                    fgColor: tplSheet2[tplCellRef2].s.fgColor
                }
            }
        }
        if (tplSheet2[tplCellRef].v === '[sheets]') {
            settings.sheets = []
            for (let C = 1; C <= tplRange2.e.c; C++) {
                const tplCellRef3 = XLSX.utils.encode_cell({c:C, r:R})
                if (tplSheet2[tplCellRef3] && tplSheet2[tplCellRef3].v) {
                    settings.sheets.push({name: tplSheet2[tplCellRef3].v})
                }
            }
            console.warn(settings)
        }
        if (tplSheet2[tplCellRef].v === '[jointId]') {
            settings.jointId = []
            for (let C = 1; C <= tplRange2.e.c; C++) {
                const tplCellRef3 = XLSX.utils.encode_cell({c:C, r:R})
                if (tplSheet2[tplCellRef3] && tplSheet2[tplCellRef3].v) {
                    const val = tplSheet2[tplCellRef3].v
                    const re = /<(\w*)>/
                    const res = re.exec(val)
                    if (res && res[1]) {
                        settings.jointId.push(res[1])
                    }
                }
            }
        }
        if (tplSheet2[tplCellRef].v === '[month_re]' && tplSheet2[tplCellRef2].v) {
            settings.monthRe = new RegExp(tplSheet2[tplCellRef2].v)
        }
        if (tplSheet2[tplCellRef].v === '[year_re]' && tplSheet2[tplCellRef2].v) {
            settings.yearRe = new RegExp(tplSheet2[tplCellRef2].v)
        }
    }
    // console.dir(settings);
    if (!settings.sheets) {
        settings.sheets = [{name: tplWB.SheetNames[0]}]
    }
    settings.sheets.forEach((sheet)=>{
        const tplSheet1 = tplWB.Sheets[sheet.name]
        sheet.fields = {}
        let tplRange1
        try {
            tplRange1 = XLSX.utils.decode_range(tplSheet1['!ref'])
        } catch (e) {
            return
        } finally {

        }
        for (let R = tplRange1.s.r; R <= tplRange1.e.r; ++R) {
            for (let C = tplRange1.s.c; C <= tplRange1.e.c; ++C) {
                if(! tplSheet1[XLSX.utils.encode_cell({c:C, r:R})]) {
                    continue
                }
                const val = tplSheet1[XLSX.utils.encode_cell({c:C, r:R})].v
                if (val === '[data]') {
                    sheet.dataStartRow = R
                } else if (val === '[cols]') {
                    sheet.colsRow = R
                }
                let re = /<(\w*)>/
                let res = re.exec(val)
                if (res && res[1]) {
                    if (sheet.dataStartCol === undefined) {
                        sheet.dataStartCol = C - 1
                        // console.log('res: ' + res[1] + ' C:' + C);
                    }
                    if (res[1] === 'month' && !sheet.occStart) {
                        sheet.occStart = C - 1
                    } else if (res[1] === 'month_value') {
                        // sheet.fields[res[1]] = {
                        //     row: R,
                        //     col: C - 1,
                        //     monthValue: true
                        // }
                        sheet.monthCol = C - 1
                        sheet.occStart = C - 1
                        // console.log('monthCol: ' + sheet.monthCol);
                    } else if (res[1] === 'month_status') {
                        sheet.statusCol = C - 1
                        // console.log('statusCol: ' + sheet.statusCol);
                    } else if (res[1] !== 'month') {
                        sheet.fields[res[1]] = {
                            row: R,
                            col: C - 1,
                            fieldName: res[1]
                        }
                        if (sheet.colsRow !== undefined) {
                            const labelCell = tplSheet1[XLSX.utils.encode_cell({c:C, r:sheet.colsRow})]
                            if (labelCell) {
                                sheet.fields[res[1]].fieldLabel = labelCell.v.toLowerCase()
                            }
                        }
                    }
                }
            }
            if (Object.keys(sheet.fields).length > 0) {
                break
            }
        }
    })
    return settings
}

function checkTemplate (template, workbook) {
    try {
        const tplWB = XLSX.readFile(templateDir + '/' + template, {cellDates: true, cellStyles: true})
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const tplSheet = tplWB.Sheets[tplWB.SheetNames[0]]
        const tplRange = XLSX.utils.decode_range(tplSheet['!ref'])
        let dataRow, colsRow
        for(let R = tplRange.s.r; R <= tplRange.e.r; ++R) {
            const tplCellRef = XLSX.utils.encode_cell({c:0, r:R})
            if (tplSheet[tplCellRef] && tplSheet[tplCellRef].v === '[data]') {
                dataRow = R
            }
            if (tplSheet[tplCellRef] && tplSheet[tplCellRef].v === '[cols]') {
                colsRow = R
            }
        }
        for(let R = tplRange.s.r; R <= tplRange.e.r; ++R) {
          const tplFirstCellRef = XLSX.utils.encode_cell({c:0, r:R})
          if (tplSheet[tplFirstCellRef] && tplSheet[tplFirstCellRef].v === '[data]') {
              break
          }
          else if (tplSheet[tplFirstCellRef] && tplSheet[tplFirstCellRef].v === '[skip]') {
              continue
          }
          for(let C = tplRange.s.c; C <= tplRange.e.c; ++C) {
            const tplCellRef = XLSX.utils.encode_cell({c:C, r:R})
            const searchCellRef = XLSX.utils.encode_cell({c: C - 1, r:R})
            if (R === colsRow) {
                const monthCellRef = XLSX.utils.encode_cell({c: C, r: dataRow})
                if (tplSheet[monthCellRef] && tplSheet[monthCellRef].v === '<month>') {
                    continue
                }
            }
            if ((!sheet[searchCellRef] && tplSheet[tplCellRef]) || (sheet[searchCellRef] && tplSheet[tplCellRef] && sheet[searchCellRef].v !== tplSheet[tplCellRef].v)) {
                return false
            }
          }
        }
        const m = template.match(/template_occ_(.*)\./)
        if (m) {
            supplierName = m[1]
        }
        return tplWB
    } catch (e) {
        console.error(e);
    } finally {

    }
}

function findTemplate (workbook) {
    try {
        const files = fs.readdirSync(templateDir)
        for (let i = 0; i < files.length; i++) {
            const tpl = checkTemplate(files[i], workbook)
            if (tpl) {
                return tpl
            }
        }
        return false
    } catch (e) {
        console.error(e)
    } finally {

    }
}

function datenum(v, date1904) {
	// console.warn(v, date1904);
    if(date1904) v+=1462;
	var epoch = Date.parse(v);
	return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
	var ws = {};
	var range = {s: {c:Object.values(data[0]).length, r:data.length}, e: {c:0, r:0 }};
	for(var R = 0; R != data.length; ++R) {
		for(var C = 0; C != data[R].length; ++C) {
			if(range.s.r > R) range.s.r = R;
			if(range.s.c > C) range.s.c = C;
			if(range.e.r < R) range.e.r = R;
			if(range.e.c < C) range.e.c = C;
			var cell = {v: data[R][C] };
			if(cell.v == null) continue;
			var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

			if(typeof cell.v === 'number') cell.t = 'n';
			else if(typeof cell.v === 'boolean') cell.t = 'b';
			else if(cell.v instanceof Date) {
                cell.t = 'n'; cell.z = XLSX.SSF._table[14];
				cell.v = datenum(cell.v);
			}
			else cell.t = 's';

			ws[cell_ref] = cell;
		}
	}
	if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
	return ws;
}

function Workbook() {
	if(!(this instanceof Workbook)) return new Workbook();
	this.SheetNames = [];
	this.Sheets = {};
}

function createWorkbook(dataArray) {
    /* original data */
    const ws_name = 'Bigmedia'
    const wb = new Workbook()
    const ws = sheet_from_array_of_arrays(dataArray)

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name)
    wb.Sheets[ws_name] = ws

    /* write to buffer */
    const wopts = { bookType: 'xlsx', bookSST: false, type: 'buffer' }
    const wbout = XLSX.write(wb, wopts)
    return wbout
}

module.exports = { importOccupancy, importWorkbook, createWorkbook }
