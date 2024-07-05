
const XLSX = require('sheetjs-style');
const { writeWorkbook, buildWorkbook } = require('../lib/excel-js')
const {  execRTMStat, execRTMStatService, execRTMStatPhotorep } = require('../lib/database')
const partners = require('../config/partners')
const printHeader = false;
function createStatisticRTM(data){
    const //FieldName = [ 'Період', 'Тип Поверхні', 'Розмір', 'Advertiser', 'Назва Компанії', 'Соціальна', 'Назва плакату', 'url' ],
        FieldRow = [ 'date report','id_estimation','orig_id','supplier_sn','date begin','date end','period_name',
        'amount_uah','id_client','Company client org','rec','id_camapaing','Company Name',
        'id_company','Company','id_advertiser','Advertiser',
        'id_estimation_status','social','politics','price' ],
        FieldRowIgnore=['id_estimation','id_estimation_status','supplier_sn','period_name','rec'],
        FieldRowStyle ={
                'amount_uah': {t:'n', s:{ numFmt : '#,##0.00'}},
                'date report':{t:'d', s:{font:{ sz: 12, }} },
                'date begin':{t:'d', s:{font:{ sz: 12, }}  },
                'date end':{t:'d', s:{font:{ sz: 12, }}  },
                'price': {t:'n', s:{ numFmt : '#,##0'}}
            },
        cellsArr = [];

    let header = [],
        max_width = {},
        cols = [];
        header.push({v:'  ', t: 's',})
    Object.values(FieldRow).forEach((c) => {
        if(!FieldRowIgnore.includes(c)) header.push({v:c, t: 's',});
    })
    header.forEach((desc,idx)=>{ max_width[idx] = (desc.v.toString().length) * 1.2; })
    if(printHeader) cellsArr.push(header);
    data.recordset.forEach((row)=>{
        let rows = [];
        rows.push({v:'  ', t: 's',})
        columnId=0;
        Object.values(FieldRow).forEach((c) => {
            if( !FieldRowIgnore.includes(c) ){
                if(typeof FieldRowStyle[c] !== 'undefined' )
                {
                    // console.log(c,' -> ',FieldRowStyle[c])
                    rows.push({v:row[c] ?? '' , t: FieldRowStyle[c].t, s: FieldRowStyle[c].s });
                } else 
                    rows.push({v:row[c] ?? '', t: 's'});
            }
        });
        rows.forEach((row,idx)=>{ 
            // console.log(row,idx)
            if( max_width[idx]< row.v.toString().length ) max_width[idx] = (row.v.toString().length); }
        )
        cellsArr.push(rows);
    });
    const ws = XLSX.utils.aoa_to_sheet(cellsArr);
    for (var key in max_width) {
        cols.push({ wch: max_width[key] });
    }
    ws["!cols"]=cols;
    
    // const sheets = [ { sheetName: 'statistic', sheetData: ws } ],
        // wb = buildWorkbook({ sheets: sheets })
    return ws;
}
function createStatisticServiceRTM(data){
    const //FieldName = [ 'Період', 'Тип Поверхні', 'Розмір', 'Advertiser', 'Назва Компанії', 'Соціальна', 'Назва плакату', 'url' ],
        FieldRow = [ 'date report','id_servoper','orig_id','supplier_sn','id_campaign','campaign','id_poster','poster',
        'picture','id_client','client','datecover','id_servstatus','serv_status','id_servopertype','servtype',
        'perform_date','prop_beg','prop_end','id_subject' ],
        FieldRowIgnore=['id_servoper','supplier_sn','prop_beg','prop_end','picture'],
        FieldRowStyle ={
            'date report':{t:'d', s:{font:{ sz: 12, }} },
            'datecover':{t:'d', s:{font:{ sz: 12, }}  },
            'prop_beg':{t:'d', s:{font:{ sz: 12, }}  },
            'prop_end':{t:'d', s:{font:{ sz: 12, }}  },
        },
        cellsArr = [];
        let header = [],
        max_width = {},
        cols = [];
        header.push({v:'  ', t: 's',})
    Object.values(FieldRow).forEach((c) => {
        if(!FieldRowIgnore.includes(c)) header.push({v:c, t: 's',});
    })
    header.forEach((desc,idx)=>{ max_width[idx] = (desc.v.toString().length) * 1.2; })
    if(printHeader) cellsArr.push(header);
    data.recordset.forEach((row)=>{
        let rows = [];
        rows.push({v:'  ', t: 's',})
        columnId=0;
        Object.values(FieldRow).forEach((c) => {
            if( !FieldRowIgnore.includes(c) ){
                if(typeof FieldRowStyle[c] !== 'undefined' )
                {
                    // console.log(c,' -> ',FieldRowStyle[c])
                    rows.push({v:row[c] ?? '' , t: FieldRowStyle[c].t, s: FieldRowStyle[c].s });
                } else if(c==='id_subject'){
                    rows.push({v:row[c] ? `https://bma.bigmedia.ua/photohub/getsubject/${row[c]}`: '', t: 's'});
                } else{ 
                    rows.push({v:row[c] ?? '', t: 's'})
                };
            }
        });
        rows.forEach((row,idx)=>{ 
            // console.log(row,idx)
            if( max_width[idx]< row.v.toString().length ) max_width[idx] = (row.v.toString().length); }
        )
        cellsArr.push(rows);
    });
    const ws = XLSX.utils.aoa_to_sheet(cellsArr);
    for (var key in max_width) {
        cols.push({ wch: max_width[key] });
    }
    ws["!cols"]=cols;
    // const sheets = [ { sheetName: 'Service', sheetData: ws } ],
        // wb = buildWorkbook({ sheets: sheets })
    return ws;
}
function createStatistiPhotorepRTM(data){
    const //FieldName = [ 'Період', 'Тип Поверхні', 'Розмір', 'Advertiser', 'Назва Компанії', 'Соціальна', 'Назва плакату', 'url' ],
        FieldRow = [ 'date report','id_photorec','orig_id','supplier_sn','photo_date','deadline','id_campaign','id_phototype','descr' ],
        FieldRowIgnore=['id_photorec','supplier_sn'],
        FieldRowStyle ={
            'date report':{t:'d', s:{font:{ sz: 12, }} },
            'photo_date':{t:'d', s:{font:{ sz: 12, }}  },
            'deadline':{t:'d', s:{font:{ sz: 12, }}  },
        },
        cellsArr = [];
        let header = [],
        max_width = {},
        cols = [];
        header.push({v:'  ', t: 's',})
    Object.values(FieldRow).forEach((c) => {
        if(!FieldRowIgnore.includes(c)) header.push({v:c, t: 's',});
    })
    header.push({v:'preview', t: 's',});
    header.push({v:'full', t: 's',});
    header.forEach((desc,idx)=>{ max_width[idx] = (desc.v.toString().length) * 1.2; })
    if(printHeader) cellsArr.push(header);
    data.recordset.forEach((row)=>{
        let rows = [];
        rows.push({v:'  ', t: 's',})
        columnId=0;
        Object.values(FieldRow).forEach((c) => {
            if( !FieldRowIgnore.includes(c) ){
                if(typeof FieldRowStyle[c] !== 'undefined' )
                {
                    if (typeof row[c] === 'undefined' || row[c] == null ) 
                        rows.push({v:''})
                    else 
                        rows.push({v:row[c] , t: FieldRowStyle[c].t, s: FieldRowStyle[c].s });
                } else if(c==='descr'){
                    rows.push({v:row[c] ?? '', t: 's'});
                    rows.push({v:row[c] ? `https://bma.bigmedia.ua/photohub/preview/${row['id_photorec']}`: '', t: 's'});
                    rows.push({v:row[c] ? `https://bma.bigmedia.ua/photohub/photo/${row['id_photorec']}`: '', t: 's'});
                } else 
                    rows.push({v:row[c] ?? '', t: 's'});
            }
        });
        rows.forEach((row,idx)=>{ 
            // console.log(row,idx)
            if( max_width[idx]< row.v.toString().length ) max_width[idx] = (row.v.toString().length); }
        )
        cellsArr.push(rows);
    });
    const ws = XLSX.utils.aoa_to_sheet(cellsArr);
    for (var key in max_width) {
        cols.push({ wch: max_width[key] });
    }
    ws["!cols"]=cols;
    // const sheets = [ { sheetName: 'Service', sheetData: ws } ],
        // wb = buildWorkbook({ sheets: sheets })
    return ws;
}
async function saveStatisticRTM (){
    let cur_date = new Date(),
        date = ("0" + cur_date.getDate()).slice(-2),
        staticRtmWS;
    const sheets = [],sheetsservice = [] ;
    // if (parseInt(date)>=1) {
        const statWB = await execRTMStat();
        if (!statWB || !statWB.recordset || statWB.recordset.length === 0) {
            console.error('failed obtain data from database')
            return
        }
        staticRtmWS = createStatisticRTM(statWB)
        sheets.push({ sheetName: 'statistic', sheetData: staticRtmWS })
    // }
    const serviceData = await execRTMStatService(),
         PhotorepData = await execRTMStatPhotorep();
    if (!serviceData || !serviceData.recordset || serviceData.recordset.length === 0 || 
        !PhotorepData || !PhotorepData.recordset || PhotorepData.recordset.length === 0) {
        console.error('failed obtain data from database')
        return
    }
    let wb = buildWorkbook({ sheets: sheets }),
        // fn = `${tempDir}/StatisticRTM.xlsx`;
        fn = partners.rtm.out.statisticFileName;
    await writeWorkbook(wb, fn );
    
    let serviceRtmWS=createStatisticServiceRTM(serviceData);
    sheetsservice.push({ sheetName: 'Service', sheetData: serviceRtmWS })
    let photorepRtmWS=createStatistiPhotorepRTM(PhotorepData);
    sheetsservice.push({ sheetName: 'Photorep', sheetData: photorepRtmWS })
    // serviceFileName
         wb = buildWorkbook({ sheets: sheetsservice }),
        // fn = `${tempDir}/StatisticRTM.xlsx`;
        fn = partners.rtm.out.serviceFileName;
    await writeWorkbook(wb, fn );
    return;
}

module.exports = { saveStatisticRTM }