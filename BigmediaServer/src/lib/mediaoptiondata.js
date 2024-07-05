const 
    conf = require('../config'),
    config = conf.get('DB'),
    sql = require('mssql'),
    debug = require('debug')('ol-app:server'),
    log = require('./log')(module);

// const Redis = require('ioredis')
// const redis = new Redis(conf.get('REDIS'))

var Data = {
    getGroupBy:(prop,cb)=>{ return getOtsGroupBy(prop,cb) },
    getTrafficBy:(prop,cb)=>{ return getTrafficGroupBy(prop,cb) },
    inspections: {},
    inspectData: {},
    otsGroup:{},
    polygonGroup:{
        getPolygonMap:(prop)=>{return getDataMapPolygon(prop);},
        getMapPublished:(prop,cb)=>{ return getMapPublishedBy(prop,cb) },
    },
    cityPolygon:{},
    faces:{},
    isLoading: false,
    attemptsCount: 0,
    InspectionsStartLoading: false,
    LastInspect: 2,
    InspectionStep:0,
    sqlQuery:{
        mssql:{
            1: 'select id,id_group,code,age,sex,income_level,filter,day_of_week,cnt_people,id_city,id_inspection from v_ots_group_people ',
            2: 'select [id] ,[polygon_id] ,[id_city] ,[id_inspection] ,[lat] , [lon] ,[lat1] ,[lon1] ,[lat2] ,[lon2] ,[geogjson] ,[transit] ,[weight] FROM [dbo].[v_ots_data_polygons] ',
            3: `declare @day varchar(1000);
declare @group table (id int); 
$GroupFilter  
$WeekFilter 
select id_city,polygon_id,id_borough
    ,case when cnt_transit>road_cnt_transit then cnt_transit else road_cnt_transit end cnt_transit
	,case when cnt_unique_transit>road_cnt_unique_transit then cnt_unique_transit else road_cnt_unique_transit end cnt_unique_transit
	,case when [percent]>road_percent then [percent] else road_percent end [percent]
	,transit_weight = case 
		when (cnt_transit=0 or max(cnt_transit) OVER (PARTITION BY id_city,id_borough) =0) 
		    and 
            (road_cnt_transit=0 or max(road_cnt_transit)OVER (PARTITION BY id_city,id_borough) =0)
		then 0 
		when cnt_transit>road_cnt_transit then
			(cnt_transit * 1.0 )/ (max(cnt_transit) OVER (PARTITION BY id_city,id_borough) * 1.0) 
		else
			(road_cnt_transit * 1.0 )/ (max(road_cnt_transit) OVER (PARTITION BY id_city,id_borough) * 1.0) 
		end 
from (
	select 
        id_city,polygon_id,id_borough
        ,cnt_transit = sum(cnt_transit)
        ,cnt_unique_transit = sum(cnt_unique_transit)
        ,[percent]=sum([percent])
        ,road_cnt_transit = sum(isnull(road_cnt_transit,0))
		,road_cnt_unique_transit=sum(isnull(road_cnt_unique_transit,0))
        ,[road_percent]=sum(isnull([road_percent],0))
    from get_ots_data_ks_cities($idInspect,UPPER(@day))
	where group_id in (select id from @group)
	group by id_city,polygon_id,id_borough 
) data
`,
            4:`declare @day varchar(1000);
declare @group table (id int); 
$GroupFilter  
$WeekFilter 
select DISTINCT id_face,id_city,id_inspection
	,SUM([OTS]) OVER (PARTITION BY id_city, id_face,id_inspection) OTS
	,max(GRP)OVER (PARTITION BY id_city, id_face,id_inspection) GRP
	,sum(TRP)OVER (PARTITION BY id_city, id_face,id_inspection) TRP
from(
select DISTINCT id_face,id_city,id_inspection
	,AVG([OTS])OVER (PARTITION BY id_city, id_face,id_inspection,id_group)OTS
	,MAX(GRP)OVER (PARTITION BY id_city, id_face,id_inspection,id_group)GRP
	,AVG(TRP)OVER (PARTITION BY id_city, id_face,id_inspection,id_group)TRP
from ots_complite_face ocf 
where 
	(@day is null or id_weekday in (select id from fin_reference where id_parent=(select id from fin_reference where code='KS_DAY') and charindex('~'+code+'~',UPPER(@day))>0))
	and id_group in (select id from @group)
	and id_inspection=$idInspect
    and id_face in (select id_face from sides where date_demounted is null or date_demounted>getdate())
)data_ots
`
        },
        pgsq:{
            1: 'select id,id_group,code,age,sex,income_level,filter,day_of_week,cnt_people,id_city,id_inspection from v_ots_group_people ',
            2: 'select id, id_inspection, id_city, polygon_id, ST_X(ST_Centroid(geog)::geometry) as lon, ST_Y(ST_Centroid(geog)::geometry) as lat, lat1,lon1 ,lat2,lon2, ST_AsGeoJSON(geog) as geogjson from data_polygons',
            4: 'select id,id_face,id_side,ots,polygon_id,id_city from v_faces_ots where polygon_id>0 and ots>0'
        }
    }
},
    IdTimer

function refreshTimer() {
    debug('refreshTimer executed');
    if (Data.isLoading) {
        clearTimeout(IdTimer);
        Data.attemptsCount++;
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
    var refreshAfter = Data.attemptsCount * timeout;
    if (refreshAfter > 7200000) {
        refreshAfter = 7200000;
        log.error('Error connection to the Database server');
    }
    log.debug('New timer started with timeout: ' + refreshAfter);
    IdTimer = setTimeout(refreshTimer, refreshAfter);
}
function syncData(){
    Data.attemptsCount++;
    if (Data.isLoading) {
        log.debug('Try Sync while Data is loading...');
        return;
    }
    Data.isLoading = true;
    if(!Data.inspections[Data.LastInspect]){ Data.inspections[Data.LastInspect]={ dataIsLoad: false }}
    LoadInspection(Data.LastInspect);
}
function LoadInspection(idInspect,cb){
    if(Data.InspectionsStartLoading || idInspect === -1 )  return;
    Data.InspectionsStartLoading = true;
    if(typeof Data.lastSyncTime !=='undefined'){
        if (!!Data.otsGroup[idInspect] && new Date(lastSyncTime.getTime() + (24 * 60 * 60 * 1000)) > new Date()){
            Data.InspectionsStartLoading = false;
            return
        } else {
            Data.InspectionStep=0;
        }
    }
    Data.InspectionStep +=1;
    let //result ={},
        sqlQuerry ='',
        StepInpectionText =`....LoadInspection [${idInspect}] step-> ${Data.InspectionStep} `,
        filter = getWeekFilter({idInspect:idInspect});
    switch (Data.InspectionStep){
        case 1: StepInpectionText +=' [ OTS People Group ]'
                console.warn(StepInpectionText)
            sqlQuerry = Data.sqlQuery.mssql[Data.InspectionStep] + ` where id_inspection=${idInspect} `;
            loadDatamMsSqlPool(sqlQuerry,(result)=>{
                LoadOtsGroup(result);
                Data.InspectionsStartLoading=false;
                LoadInspection(idInspect,cb);
            })
        break;
        case 2:
            StepInpectionText +=' [ Polygons ]'
            console.warn(StepInpectionText);
            Data.inspections[idInspect].dataIsLoad = false;
            sqlQuerry = Data.sqlQuery.mssql[Data.InspectionStep] + ` where id_inspection=${idInspect} `;
            loadDatamMsSqlPool(sqlQuerry,(result)=>{
                LoadPolygons(result);
                Data.InspectionsStartLoading=false;
                LoadInspection(idInspect,cb);
            });
        break;
        case 3:
            StepInpectionText +=' [ Data Polygons Group 1]'
            console.warn(StepInpectionText);
            sqlQuerry = Data.sqlQuery.mssql[Data.InspectionStep].replace('$idInspect',idInspect).replace('$GroupFilter',filter.GroupFilter).replace('$WeekFilter',filter.WeekFilter);
            loadDatamMsSqlPool(sqlQuerry,(result)=>{
                LoadDataPolygons(result,filter); //Group 1 
                Data.InspectionsStartLoading=false;
                LoadInspection(idInspect,cb);
            })
           break;
        case 4:
            StepInpectionText +=' [ Data Faces Group 1] '
            sqlQuerry=Data.sqlQuery.mssql[Data.InspectionStep].replace('$idInspect',idInspect).replace('$GroupFilter',filter.GroupFilter).replace('$WeekFilter',filter.WeekFilter);
            console.warn(StepInpectionText);
            //console.warn(sqlQuerry);
            loadDatamMsSqlPool(sqlQuerry,(result)=>{
                LoadFaces(result,filter);
                Data.InspectionsStartLoading=false;
                Data.inspections[idInspect].dataIsLoad = true;
                LoadInspection(idInspect,cb);
            })
        break;
        default:
            if(typeof Data.lastSyncTime ==='undefined' && Data.inspections[idInspect].dataIsLoad === true )
                console.warn(`Data OTC Inspect[${idInspect}] is load. [OK]`)
            Data.lastSyncTime = new Date();
            if(typeof cb !== 'undefined') cb();
        break;
    };

}
function loadDatamMsSqlPool(sqlQuerry,cb){
    sql.on('error', err => {
        // ... error handler
    })
    sql.connect(config).then(pool => {
        // Query
        return pool.request()
            .query(sqlQuerry)
    }).then(result => {
        cb(result)
    }).catch(err => {
        console.warn(err)
      // ... error checks
    });
}
function LoadOtsGroup(data){    
    Object.values(data).forEach((o) => {
        if(!Data.otsGroup[o.id_inspection]){
            Data.otsGroup[o.id_inspection]={}
        }
        if(!Data.otsGroup[o.code]){
            Data.otsGroup[o.code] = parseInt(o.id_group)
        }
        if(!Data.otsGroup[o.id_inspection][o.id_city]){
            Data.otsGroup[o.id_inspection][o.id_city] = {}
        }
        if(!Data.otsGroup[o.id_inspection][o.id_city][o.id_group]){
            Data.otsGroup[o.id_inspection][o.id_city][o.id_group] = { id:parseInt(o.id_group)}
        }
        if(!Data.otsGroup[o.id_inspection][o.id_city][o.id_group][o.day_of_week.toLowerCase()]){
            Data.otsGroup[o.id_inspection][o.id_city][o.id_group][o.day_of_week.toLowerCase()] = {
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
function LoadPolygons(data) {
    Object.values(data).forEach((p) => {
        let idCity = parseInt(p.id_city),
            id = parseInt(p.id),
            idPolygon=parseInt(p.polygon_id),
            idInspection = parseInt(p.id_inspection);
        if(!Data.polygonGroup[idInspection]) Data.polygonGroup[idInspection]={}
        if(!Data.cityPolygon[idInspection]) Data.cityPolygon[idInspection]={};
        if(!Data.cityPolygon[idInspection][idCity]) Data.cityPolygon[idInspection][idCity]={};
        if(!Data.cityPolygon[idInspection][idCity][idPolygon]) Data.cityPolygon[idInspection][idCity][idPolygon]=id;

        if(!Data.polygonGroup[idInspection][id]){
            Data.polygonGroup[idInspection][id] = {
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
}
function LoadDataPolygons(data,prop,cb){
    // let param =  prop ?? {};
    let Filter =  prop.Filter,
        idInspect = prop.idInspect;
    if(!Data.inspectData[idInspect]) Data.inspectData[idInspect] = {};
    if(!Data.inspectData[idInspect][Filter]) 
        Data.inspectData[idInspect][Filter] =
        {
            isLoading: true,
            LoadData:false,
            data:[],
            polygons:{}
        };
    let inspection=Data.inspectData[idInspect][Filter];
    Object.values(data).forEach((item) => {        
        let idCity = parseInt(item.id_city),
            idPolygon = parseInt(item.polygon_id),
            id = Data.cityPolygon[idInspect][idCity][idPolygon],
            polygon ={
                id:id,
                idPolygon:idPolygon,
                idCity:idCity,
                lon:Data.polygonGroup[idInspect][id].lon,
                lat:Data.polygonGroup[idInspect][id].lat,
                transit: parseFloat(item.cnt_transit),
                weight: parseFloat(item.transit_weight),
                // transit: parseFloat(item.cnt_unique_transit),
                // weight: parseFloat(item.unique_transit_weight),
                percent: parseFloat(item.percent)
            };
            //if(idCity==5) console.warn('item->',item);
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
function LoadFaces(data,prop,cb){
    let Filter =  prop.Filter,
        idInspect = prop.idInspect;
    
    if(!Data.faces[idInspect]) Data.faces[idInspect] ={}
    if(!Data.faces[idInspect][Filter]) Data.faces[idInspect][Filter] ={}
    let faces=Data.faces[idInspect][Filter];
    
    Object.values(data).forEach((item) => { 
        if (!faces[item.id_face]){
            faces[item.id_face] = {
                idFace: parseInt(item.id_face),
                idCity: parseInt(item.id_city),
                ots:  parseFloat(item.OTS) ,
                grp: parseFloat(item.GRP),
                trp:  parseFloat(item.TRP),
            }    
        } else {
            if(faces[item.id_face].ots!=item.ots ){
                faces[item.id_face].ots=parseFloat(item.OTS);
                faces[item.id_face].grp=parseFloat(item.GRP);
                faces[item.id_face].trp=parseFloat(item.TRP);
            }    
        }
    });
    if(typeof cb !== 'undefined') cb(faces);
}
function getWeekFilter(prop){
    const idInspect = prop.idInspect || Data.LastInspect,
        group= (typeof prop.group === 'undefined') ? [1] 
            : (typeof prop.group !== 'object') ? [prop.group] : prop.group
        ,wekday=((typeof prop.wekday ==='undefined') || (typeof prop.wekday ==='string' && prop.wekday.toLocaleLowerCase()!=='all'))
            ? ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
            : prop.wekday ;
    
    let WeekFilter='set @day=',
        Filter=`${idInspect}/`,
        GroupFilter='';
        sqlQuerry = '';   
        FirstGroup = false;
    Object.values(group).forEach((g) => {
        Filter += `${g}`;
        GroupFilter += `insert @group values(${g}); `;
        if(g===1) FirstGroup=true;
    })
    Filter +='/'
    WeekFilter+=`'`
    Object.values(wekday).forEach((d) =>{
        Filter += `${d.substr(0,2)}`;
        WeekFilter += `~${d}~`;
    })
    WeekFilter+=`'`;
    return {Filter:Filter, WeekFilter:WeekFilter ,GroupFilter:GroupFilter, group:group, wekday:wekday ,idInspect:idInspect, FirstGroup: FirstGroup }
}
function getDataMapPolygon(prop){
    let idInspect= prop.idInspect || Data.LastInspect;
    if(!Data.polygonGroup[idInspect]){
        LoadInspection({idInspect:idInspect},()=>{
            return Data.polygonGroup[idInspect];
        })
    } else 
        return Data.polygonGroup[idInspect];
}
function objectToArray(data,cb){
    let aresult = [];
    for(var idx in data){aresult.push(data[idx])}
    cb(aresult);
}
function getMapPublishedBy(prop,cb){
    let mapPolygons = Data.polygonGroup.getPolygonMap(prop),
        result = [];
    getTrafficGroupBy(prop,(otsMapPolygons)=>{
        for(var idx in mapPolygons){
            let data = mapPolygons[idx];
                for(var ido in otsMapPolygons){
                    if(otsMapPolygons[ido].id=== data.id ){
                        data.weight=otsMapPolygons[ido].weight;
                        data.transit=otsMapPolygons[ido].transit;
                        data.percent=otsMapPolygons[ido].percent;
                    }
                }
            result.push(data)
        };
        cb(result);
    })
}
function converWeekFilter(prop){
    var group = [], groupName, daysFilter = [] , idInspect ;
    const {daysOfWeek, groups, sex, ages, inspect } = prop;
    if(typeof daysOfWeek === 'undefined' || daysOfWeek.length ===0 ){
        daysFilter = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    } else 
        daysOfWeek.forEach((d)=>{daysFilter.push(d)});
    if ( (typeof sex === 'undefined' && typeof groups === 'undefined' && typeof ages === 'undefined') 
        || (sex.length == 2 && groups.length == 5 && ages.length == 5 )
        || (sex.length == 0 && groups.length == 0 && ages.length == 0 )) 
        { group.push(1); } 
    else{
        ages.forEach((age) =>{
            groups.forEach((incomeLevel) =>{
                sex.forEach((s) =>{
                    groupName = (age+' | '+incomeLevel + ' | '+ s).toUpperCase();
                    group.push(Data.otsGroup[groupName]);
                })
            })
        })
    }
    idInspect = (typeof inspect === 'undefined') ? Data.LastInspect : parseInt(inspect);
    return {group:group,wekday:daysFilter, idInspect }
}
function getOtsGroupBy(prop,cb) {
    // console.warn('prop =>',prop);
    let filters = getWeekFilter(prop),
        Filter =  filters.Filter,
        idInspect=filters.idInspect || Data.LastInspect,
        result = [];
    if(!Data.faces[idInspect] || !Data.faces[idInspect][Filter]){
        
        let sqlQuerry=Data.sqlQuery.mssql[4].replace('$idInspect',idInspect).replace('$GroupFilter',filters.GroupFilter).replace('$WeekFilter',filters.WeekFilter);
        loadDatamMsSqlPool(sqlQuerry,(result)=>{
            LoadFaces(result,filters);
            Data.inspections[idInspect].dataIsLoad = true;
            const faces=Data.faces[idInspect][Filter];    
            Object.values(faces).forEach((f)=>{
                result.push(
                {
                    idFace: parseInt(f.idFace),
                    idCity: parseInt(f.idCity),
                    ots: (parseFloat(f.ots) /1000).toFixed(3),
                    trp: parseFloat(f.trp).toFixed(3),
                    grp: parseFloat(f.grp).toFixed(3)
                });
            });
            cb(result);
        })

    } else {
        const faces=Data.faces[idInspect][Filter];
        Object.values(faces).forEach((f)=>{
            result.push(
            {
                idFace: parseInt(f.idFace),
                idCity: parseInt(f.idCity),
                ots: (parseFloat(f.ots) /1000).toFixed(3),
                trp: parseFloat(f.trp).toFixed(3),
                grp: parseFloat(f.grp).toFixed(3)
            });
        });
        cb(result);
    }
}
function getTrafficGroupBy(prop,cb) {
    let filters = getWeekFilter(prop),
        Filter =  filters.Filter,
        idInspect=filters.idInspect || Data.LastInspect;
    if(!Data.inspectData[idInspect] || !Data.inspectData[idInspect][Filter]){
        sqlQuerry = Data.sqlQuery.mssql[3].replace('$idInspect',idInspect).replace('$GroupFilter',filters.GroupFilter).replace('$WeekFilter',filters.WeekFilter);
        loadDatamMsSqlPool(sqlQuerry,(result)=>{
            LoadDataPolygons(result,filters); //Group 1 
            let inspection=Data.inspectData[idInspect][Filter];
            cb(inspection.data);
        })
    } else {
        let inspection=Data.inspectData[idInspect][Filter];
        cb(inspection.data);
    }
}
function MediaOptionsData() {
    this.getData = ()=>{
        return Data;
    }
    this.startSync = ()=>{
        IdTimer = setTimeout(refreshTimer, 0);
    }
    this.getOtsGroup = ()=>{
        return Data.otsGroup;
    }
    this.convertBodyToFilter =(prop)=>{
        return converWeekFilter(prop);
    }
    this.getOtsByTransitBy=(prop,cb)=>{
        Data.getGroupBy(prop,cb)
    }
    this.getTrafficBy=(prop,cb)=>{
        Data.getTrafficBy(prop,cb)
    }
    this.getMap = (prop,cb)=>{
        objectToArray(Data.polygonGroup.getPolygonMap(prop),cb);
    }
    this.getPublishedMap = (prop,cb)=>{
        Data.polygonGroup.getMapPublished(prop,cb);
    }
}
module.exports = MediaOptionsData;

