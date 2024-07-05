/**
 * Created by Alexander.Ustilov on 23.02.2016.
 */
var pgdb = require('./pgdb');
var conf = require('../config');
var debug = require('debug')('ol-app:server');
var log = require('./log')(module);

const Redis = require('ioredis')
const redis = new Redis(conf.get('REDIS'))

var faceMediaOptions = {
        getDataGroupBy:(prop)=>{ return getOtsDataGroupBy(prop) },
        getTransitDataBy:(prop,cb)=>{ return getTransitDataGroupBy(prop,cb) }
    },
    inspections = {},
    inspectData = {},
    lastSyncTime,
    isLoading = false,
    attemptsCount = 0,
    IdTimer,
    LastInspect = 1,
    InspectionsStartLoading = false,
    otsGroup = {
        getTransit:(prop)=>{ return getOtsGroupTraffic(prop); }
    },
    polygonGroup = {
        getPolygonMap:(prop)=>{return getDataMapPolygon(prop);},
        getPolygonPubMap:(prop,cb)=>{return getDataMapPubPolygon(prop,cb);},
        getTransit:(prop)=>{return getDataPolygonsTransitBy(prop);},
        getpgSQL:(prop)=>{return getpgSQLforDataPolygons(prop)},
        getFilter:(prop)=>{return getWeekFilter(prop)}
    },
    cityPolygon = {},
    InspectionStep = 0 ;

function syncData() {
    attemptsCount++;
    if (isLoading) {
        log.debug('Try Sync while Data is loading...');
        return;
    }
    if(pgdb.getConnectionStatus() !== 'connected'){
        log.debug('Initially connect to PGDB');
        pgdb.connectToDB(syncData);
        return;
    }
    isLoading = true;
    log.debug('Data PG is loading...');
    console.warn('Data PG is loading...');
    LastInspect = 2;
    if(!inspections[LastInspect]){ inspections[LastInspect]={ dataIsLoad: false }}
    LoadInspection(LastInspect);
  
    if(!isLoading) LoadInspection();
    if(!isLoading)
        console.warn('PG Data is loadiet. Ok.')
}
function getTransitDataGroupBy(prop,cb){
    let param =  prop ?? {},
        pf=getWeekFilter(param),
        idInspect = pf.idInspect,
        Filter =  pf.Filter;
    if(!inspectData[idInspect][Filter]){
        let result=[];
        loadPGData(getpgSQLforDataPolygons(param),result,()=>{ LoadDataPolygons(result,param,(data)=>{ cb(data); }); });
    } else {
        cb(inspectData[idInspect][Filter].data);
    }    
}
function getDataPolygonsTransitBy(prop){
    let param =  prop ?? {};                
    let idInspect = param.idInspect ?? LastInspect
    let result = {plygons:polygonGroup[idInspect], sqlQuerry: getpgSQLforDataPolygons(prop) }
    return result
}
function objectToArray(data,cb){
    let aresult = [];
    for(var idx in data){aresult.push(data[idx])}
    cb(aresult);
}
function getDataMapPolygon(prop){
    let param =  prop ?? {};                
    let idInspect = param.idInspect ?? LastInspect
    if(!polygonGroup[idInspect]){
        LoadPolygons({idInspect:idInspect},()=>{
            return polygonGroup[idInspect];
        })
    } else 
        return polygonGroup[idInspect];
}
function getDataMapPubPolygon(prop,cb){
    let param =  prop ?? {},
        pf=getWeekFilter(param),
        idInspect = pf.idInspect,
        Filter =  pf.Filter;
    if(!inspectData[idInspect][Filter]){
        let result=[];
        loadPGData(getpgSQLforDataPolygons(param),result,()=>{ LoadDataPolygons(result,param,(data)=>{ cb(data); }); });
    } else {
        cb(inspectData[idInspect][Filter].data);
    } 
}
function getWeekFilter(prop){
    const param =  prop ?? {},
        idInspect = param.idInspect ?? LastInspect,
        group= (typeof param.group === 'undefined') ? [1] 
            : (typeof param.group !== 'object') ? [param.group] : param.group
        ,wekday=((typeof param.wekday ==='undefined') || (typeof param.wekday ==='string' && param.wekday.toLocaleLowerCase()!=='all'))
            ? ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
            : param.wekday ;
    
    let WeekFilter='',
        Filter=`${idInspect}/`,
        GroupFilter='';    
        FirstGroup = false;
    Object.values(group).forEach((g) => {
        Filter += `${g}`;
        GroupFilter += GroupFilter==='' ? ' idgroups(id) as (values ':',';
        GroupFilter+=`(${g})`;
        if(g===1) FirstGroup=true;
    })
    GroupFilter+=') '
    Filter +='/'
    Object.values(wekday).forEach((d) =>{
        Filter += `${d.substr(0,2)}`;
        WeekFilter += WeekFilter==='' ? ' wekday(day) as (values ': ',';
        WeekFilter +=`('${d}')`;
    })
    WeekFilter+=') '


    return {Filter:Filter, WeekFilter:WeekFilter ,GroupFilter:GroupFilter, group:group, wekday:wekday ,idInspect:idInspect, FirstGroup: FirstGroup}

}
function LoadPolygons(prop,cb){
    let param =  prop ?? {};                
    let idInspect = param.idInspect ?? LastInspect
    if(!polygonGroup[idInspect]){
        let sqlQuerry = `select id, id_inspection, id_city, polygon_id, ST_X(ST_Centroid(geog)::geometry) as lon, ST_Y(ST_Centroid(geog)::geometry) as lat,
lat1,lon1 ,lat2,lon2, ST_AsGeoJSON(geog) as geogjson from data_polygons where id_inspection = ${idInspect}`,
        data =[];
        loadPGData(sqlQuerry,data,()=>{
            Object.values(data).forEach((p) => {
                let idCity = parseInt(p.id_city),
                    id = parseInt(p.id),
                    idPolygon=parseInt(p.polygon_id),
                    idInspection = p.id_inspection;
                if(!polygonGroup[idInspection]) polygonGroup[idInspection]={}
                if(!cityPolygon[idInspection]) cityPolygon[idInspection]={};
                if(!cityPolygon[idInspection][idCity]) cityPolygon[idInspection][idCity]={};
                if(!cityPolygon[idInspection][idCity][idPolygon]) cityPolygon[idInspection][idCity][idPolygon]=id;

                if(!polygonGroup[idInspection][id]){
                    polygonGroup[idInspection][id] = {
                        id: id,
                        idPolygon: idPolygon,
                        idCity:idCity,
                        lat: parseFloat(p.lat),
                        lon: parseFloat(p.lon),
                        type:JSON.parse(p.geogjson).type,
                        geog: JSON.parse(p.geogjson).coordinates,
                        transit: 0.0,
                        weight: 0.0
                    }
                }
            });
            cb();
        });
    } else {
        cb();
    }
}
function getpgSQLforDataPolygons(prop){
    let param =  prop ?? {},
        pf = getWeekFilter(prop),
        idInspect = pf.idInspect;
//   ,idcity(id) as ( values(${city}) )
// let pgSQL=
// `WITH 
//     inspection(id) as ( values(${idInspect}) )
//     ,${pf.WeekFilter}
//     ,${pf.GroupFilter}
//     select row_number() OVER (ORDER BY polygon_id, id_city) AS id, id_city,polygon_id, avg(cnt_transit) cnt_transit, avg(percent) percent from(
//         select id_city,polygon_id, day_of_week_str
//             ,sum(cnt_unique_transit) as cnt_unique_transit
//             ,sum(cnt_transit)::double PRECISION as cnt_transit
//             ,sum(percent_transit)::double PRECISION percent
//         from v_data_polygons_v2 data
//             where  id_inspection in (select id from inspection) and id_group in (select id from idgroups) and day_of_week_str in (select day from  wekday)
//         group by id_inspection,id_city,polygon_id,day_of_week,day_of_week_str
//     ) data 
//     group by id_city,polygon_id  order by id_city,polygon_id `;
    let pgSQL=
`WITH 
    inspection(id) as ( values(${idInspect}) )
    ,${pf.WeekFilter}
    ,${pf.GroupFilter}
select row_number() OVER (ORDER BY polygon_id, id_city) AS id
	,id_city, polygon_id
	,avg(cnt_transit) cnt_transit
    ,avg(cnt_unique_transit) cnt_unique_transit
    ,avg(percent) percent
    ,avg(cnt_transit)/avg(max_cnt_transit) transit_weight
	,avg(cnt_unique_transit)/avg(max_unique_transit) unique_transit_weight
--	,case when avg(cnt_transit)/avg(max_cnt_transit)>1 then 1 else avg(cnt_transit)/avg(max_cnt_transit) end transit_weight
--	,case when avg(cnt_unique_transit)/avg(max_unique_transit)>1 then 1 else avg(cnt_unique_transit)/avg(max_unique_transit) end unique_transit_weight
from(
select 
	 data.polygon_id,data.id_city,ref.name->'name::en'::text AS day_of_week_str
 	,sum(data.cnt_transit) cnt_transit
	,sum(data.cnt_unique_transit) cnt_unique_transit
	,sum(data.percent) percent
	,sum(max_unique_transit) max_unique_transit
	,sum(max_cnt_transit) max_cnt_transit
from v_data_inspection_quantity data
--from data_inspection_quantity data
inner join borough_data_transit bdt on 
 	data.id_city=bdt.id_city and  data.id_borough=bdt.id_borough 
 	and data.id_inspection=bdt.id_inspection and data.day_of_week=bdt.day_of_week and data.id_group=bdt.id_group	  
inner join reference ref on ref.weight = data.day_of_week and ref.id_parent = (SELECT reference.id FROM reference WHERE reference.code = 'WEEK'::text)
where data.id_group in (select id from idgroups) and  data.id_inspection=(select id from inspection)
group by data.id_inspection,data.polygon_id, data.id_city, data.id_borough,ref.name
) d 
where d.day_of_week_str  in (select day from wekday)
group by id_city, polygon_id  `
    return pgSQL;
}
function LoadDataPolygons(data,prop,cb){
    let param =  prop ?? {};
    let Filter =  param.filter ?? getWeekFilter(param).Filter,
        idInspect = param.idInspect ?? LastInspect
    if(!inspectData[idInspect]) inspectData[idInspect] = {};
    if(!inspectData[idInspect][Filter]) 
        inspectData[idInspect][Filter] =
        {
            isLoading: true,
            LoadData:false,
            data:[],
            polygons:{}
        };
    let inspection=inspectData[idInspect][Filter];

    Object.values(data).forEach((item) => {        
        let idCity = parseInt(item.id_city),
            idPolygon = parseInt(item.polygon_id),
            id = cityPolygon[idInspect][idCity][idPolygon],
            polygon ={
                id:id,
                idPolygon:idPolygon,
                idCity:idCity,
                lon:polygonGroup[idInspect][id].lon,
                lat:polygonGroup[idInspect][id].lat,
                transit: parseFloat(item.cnt_transit),
                weight: parseFloat(item.transit_weight),
                // transit: parseFloat(item.cnt_unique_transit),
                // weight: parseFloat(item.unique_transit_weight),
                percent: parseFloat(item.percent)
            };
            // console.warn(idPolygon,'->',polygonGroup[idInspect][id])
// console.warn(item, cityPolygon[idInspect][idCity][idPolygon])
        inspection.data.push(polygon);
        inspection.polygons[id]=polygon;

    }); 
    inspection.LoadData = true;
    inspection.isLoading = false;
    inspection.lastupdate = new Date();
    InspectionsStartLoading = false;
    if(typeof cb !== 'undefined') cb(inspection.data);
}
function getOtsGroupTraffic(prop){
    let param =  prop ?? {}
       ,filters = polygonGroup.getFilter(param)    
        ,idInspect = filters.idInspect
        ,idCity =  param.city ?? 1 // Kyiv by Deffault
        ,cityTraf = {
            id_city: idCity,
            people: 0.0
        };
    Object.values(filters.group).forEach((g) => {

        Object.values(filters.wekday).forEach((d) => {
            // console.warn(otsGroup[idInspect][idCity][g][d.toLowerCase()])
            cityTraf.people +=otsGroup[idInspect][idCity][g][d.toLowerCase()]['cnt_people']//[ (trafic ==='unique') ? 'group_unique_transit' : 'group_transit']
        });
        
    });
    cityTraf.people = (cityTraf.people / filters.wekday.length)
    return cityTraf
}
function LoadOtsGroup(data){    
    Object.values(data).forEach((o) => {
        if(!otsGroup[o.id_inspection]){
            otsGroup[o.id_inspection]={
            }
        }
        if(!otsGroup[o.code]){
            otsGroup[o.code] = parseInt(o.id_group)
        }
        if(!otsGroup[o.id_inspection][o.id_city]){
            otsGroup[o.id_inspection][o.id_city] = {
            }
        }
        if(!otsGroup[o.id_inspection][o.id_city][o.id_group]){
            otsGroup[o.id_inspection][o.id_city][o.id_group] = {
                id:parseInt(o.id_group)
            }
        }
        if(!otsGroup[o.id_inspection][o.id_city][o.id_group][o.day_of_week.toLowerCase()]){
            otsGroup[o.id_inspection][o.id_city][o.id_group][o.day_of_week.toLowerCase()] = {
                id:parseInt(o.id_group),
                //code:o.code,
                age:o.age,
                sex: o.sex,
                income_level: o.income_level,
                filter: o.filter,
                id_city: o.id_city,
                cnt_people:parseInt(o.cnt_people)
            }
        }
    })
}
function getOtsDataGroupBy(prop) {
    // console.warn('prop =>',prop);
    let param =  prop ?? {},
        filters = polygonGroup.getFilter(param),
        Filter =  filters.Filter,
        idInspect=filters.idInspect,
        result = [],
        pg = {},
        ots={};
    Object.values(faceMediaOptions).forEach((s)=>{
        if(typeof s.id_side !== 'undefined'){
            let 
                idCity= parseInt(s.id_city),
                
                data = {id_side: parseInt(s.id_side),
                    id_face: parseInt(s.id_face),
                    id_city: idCity,
                    ots: parseFloat(s.ots),
                    trp: 0.0
                };
            if (!cityPolygon[idInspect][idCity][s.polygon_id]){
                console.warn('cityPolygon not found',s)
            } else {
                id = cityPolygon[idInspect][idCity][s.polygon_id],
                polygon=inspectData[idInspect][Filter].polygons[id];
                pg[id] = parseFloat(polygon.percent) ?? 0;


                if(typeof polygon !== 'undefined'){
                    data.ots = data.ots * ( filters.FirstGroup ? 1 :  parseFloat(polygon.percent));
                } else {
                    data.ots = data.ots
                }
                //console.warn(data,polygon.percent,filters.FirstGroup);
                if(!ots[idCity]){
                    filters.city = idCity
                    let r =  otsGroup.getTransit(filters)
                    if(typeof r !== 'undefined') {
                        ots[idCity] = r.people;
                        // data.trp= pg[id]===0 ? 0 : ((parseFloat(data.ots)/parseFloat(ots[idCity])) * 100 ) //.toFixed(2)
                        data.trp= data.ots===0 || ots[idCity]===0 ? 0 : ((parseFloat(data.ots)/parseFloat(ots[idCity])) * 100 ) //.toFixed(2)
                    };
                } else {
                    data.trp = data.ots===0 || ots[idCity]===0 ? 0 : ((parseFloat(data.ots) / parseFloat(ots[idCity])) * 100 ) //.toFixed(2)
                    // data.trp=(data.ots / parseFloat(ots[s.id_city])) //.toFixed(0)
                }
                // if( data.id_side===33718){ 
                    // console.warn(data,`  ots= ${s.ots}, otsNew= ${data.ots}, coof= ${pg[s.polygon_id]}, trp for city_${s.id_city} = ${ots[s.id_city]}`) 
                // }
                data.ots = (data.ots/1000).toFixed(3)
                result.push(data);
            }
        }
        firts_rec = false;
    });
    return result;
}

function LoadFaces(data){
    Object.values(data).forEach((item) => { 
        if (!faceMediaOptions[item.id_side]){
            faceMediaOptions[item.id_side] = {
                id_side: parseInt(item.id_side),
                id_face: parseInt(item.id_face),
                id_city: parseInt(item.id_city),
                ots:  parseFloat(item.ots) ,
                polygon_id:parseInt(item.polygon_id),
            }    
        } else {
            if(faceMediaOptions[item.id_side].ots!=item.ots || faceMediaOptions[item.id_side].polygon_id!=item.polygon_id ){
                faceMediaOptions[item.id_side].ots=item.ots;
                faceMediaOptions[item.id_side].polygon_id=item.polygon_id;
            }    
        }
    });
}
function LoadInspection(id){
    let idInspect = id ?? LastInspect;
    if(InspectionsStartLoading || idInspect === -1 )  return;
    InspectionsStartLoading = true;
    if(typeof lastSyncTime !=='undefined'){
        if (!!otsGroup[idInspect] && new Date(lastSyncTime.getTime() + (24 * 60 * 60 * 1000)) > new Date()){
            InspectionsStartLoading = false;
            return
        } else {
            InspectionStep=0;
        }
    }
    InspectionStep +=1;
    let sqlQuerry='',
        result ={}, 
        StepInpectionText =`....LoadInspection [${idInspect}] step-> ${InspectionStep} `
    switch (InspectionStep){
        case 1:
            StepInpectionText +=' [ OTS People Group ]'
            console.warn(StepInpectionText)
            sqlQuerry = `select  id,id_group,code,age,sex,filter,income_level,day_of_week,cnt_people,id_city,id_inspection from v_people where id_inspection=${idInspect}`
            loadPGData(sqlQuerry,result,()=>{
                LoadOtsGroup(result)
                LoadInspection();
            });
            break;
        case 2:
            StepInpectionText +=' [ Polygons ]'
            console.warn(StepInpectionText);
            inspections[LastInspect].dataIsLoad = false;
            LoadPolygons({idInspect:LastInspect}, ()=>{ LoadInspection(); }
            );
            break;
        case 3:
            StepInpectionText +=' [ Data Polygons Group 1]'
            console.warn(StepInpectionText);
            sqlQuerry=getpgSQLforDataPolygons();
            // console.warn(sqlQuerry);
            loadPGData(sqlQuerry,result,()=>{
                LoadDataPolygons(result); //Group 1 
                // inspections[LastInspect].dataIsLoad = true;
                LoadInspection();
            })
            break;
        case 4:
            StepInpectionText +=' [ Data Faces ] '
            console.warn(StepInpectionText);
            sqlQuerry='select id,id_face,id_side,ots,polygon_id,id_city from v_faces_ots where polygon_id>0 and ots>0'
            loadPGData(sqlQuerry,result, ()=>{
                LoadFaces(result);
                InspectionsStartLoading = false;
                inspections[LastInspect].dataIsLoad = true;
                LoadInspection();
            });
            break;
        default:
                if(typeof lastSyncTime ==='undefined' && inspections[LastInspect].dataIsLoad === true )
                    console.warn('PG Data is load. [OK]')
                lastSyncTime = new Date();
            break;
    }
    if(!InspectionsStartLoading){
        if(typeof lastSyncTime ==='undefined')
            console.warn('PG Data is load. [OK]')
        lastSyncTime = new Date();
    }
}

function loadPGData(sql,resultData,cb){
    pgdb.execSql(sql,function (err,recordsets) {
        InspectionsStartLoading = false;
        if (err) {
            log.error('Occupancy procedure error: ' + 'Status: ' + err.status + '. Error message: ' + err.message);
            log.error(err + '; attempts: ' + attemptsCount.toString() + '; lastSuccessSyncTime: ' + lastSyncTime.toString());
            console.warn(recordsets);
            return;
        }
        if (recordsets.length === 0) {
            log.error('Occupancy error: recordsets is empty ' + 'Status: ' + err.status + '. Error message: ' + err.message);
            log.error(err + '; attempts: ' + attemptsCount.toString() + '; lastSuccessSyncTime: ' + lastSyncTime.toString());
            return;
        }

        recordsets.forEach((item) => { if(!resultData[item.id]) resultData[item.id] = item; });
        if(typeof cb !== 'undefined') cb();
    })
}

function refreshTimer() {
    debug('refreshTimer executed');
    if (isLoading) {
        clearTimeout(IdTimer);
        attemptsCount++;
    }
    else {
        syncData();
    }
    var rbdConfig = conf.get('refreshBigData'), timeout;
    var now = new Date();
    if (now.getDay() == 0 || now.getDay() == 6 || now.getHours() < 8 || now.getHours() > 18) {
        timeout = rbdConfig.otherTimeout;
    }
    else {
        timeout = rbdConfig.workingHoursTimeout;
    }
    var refreshAfter = attemptsCount * timeout;
    if (refreshAfter > 7200000) {
        refreshAfter = 7200000;
        log.error('Error connection to the Database server');
    }
    log.debug('New timer started with timeout: ' + refreshAfter);
    IdTimer = setTimeout(refreshTimer, refreshAfter);
}

function MediaOptions() {
  this.getData = ()=>{
    return faceMediaOptions;
  }  
  this.getOtsByTransitBy = (prop,cb)=>{
    // console.warn('getOtsByTransitBy prop=>', prop)
    let param =   polygonGroup.getFilter(prop),
        Filter = param.Filter,
        result = [];
    // console.warn('param=>', param)
    if(!inspectData[Filter]){
        const pgSqlQuery = getpgSQLforDataPolygons(param)
        pgdb.query(pgSqlQuery,(result)=>{
            LoadDataPolygons(result,param);
            result=faceMediaOptions.getDataGroupBy(param);
            cb(result);
        })
    } else {
        result=faceMediaOptions.getDataGroupBy(param);
        cb(result);
    }
  }
  
  this.getTransit = function (prop,cb){
    faceMediaOptions.getTransitDataBy(prop,cb);
  }
  this.getMap = function (prop,cb){    
    objectToArray(polygonGroup.getPolygonMap(prop),cb); 
  }
  this.getPublishedMap= function (prop,cb){    
    polygonGroup.getPolygonPubMap(prop,cb); 
  }
  this.getOtsGroup = function () {
    return otsGroup;
  }
  this.startSync = function () {
    IdTimer = setTimeout(refreshTimer, 0);
  }
}

module.exports = MediaOptions;
