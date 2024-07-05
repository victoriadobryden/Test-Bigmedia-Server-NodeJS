const XLSX = require('sheetjs-style');
// const XLSX = require('xlsx-style');
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

function createWorkbook () {
    return XLSX.utils.book_new(); 
}
async function writeWorkbook (wb, fileName) {
    XLSX.writeFile(wb, fileName);
}

function buildWorkbook(opts){
    const wb = createWorkbook()
    opts.sheets.forEach((opt)=>{
        let wsName = opt.sheetName.replace(/[:\\/?*[\]]/gi,''),
            ws =  opt.sheetData;
        XLSX.utils.book_append_sheet(wb, ws, wsName);
    })
    return wb
}
module.exports = { createWorkbook, writeWorkbook, buildWorkbook}
