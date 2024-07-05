Ext.define('Bigmedia.model.BaseSchema', {
    extend: 'Ext.data.Model',

    idProperty: 'id',
    schema: {
        namespace: 'Bigmedia.model',
        // urlPrefix: Bigmedia.Locales.currentLocale,

        proxy: {
            type: 'ajax',
            limitParam: null,
            pageParam: '',
            startParam: '',
            url: '/api/v1/{entityName:lowercase}.json',
            reader: {
                type: 'json'
            }
        }
    }
});

Ext.define('Bigmedia.model.Base', {
    extend: 'Bigmedia.model.BaseSchema',

    fields: [
        {name: 'id', type: 'int'}

    ],
    idProperty: 'id'
});

Ext.define('Bigmedia.model.RefData', {
    extend: 'Bigmedia.model.Base',
    requires: [
        'Bigmedia.Locales'
    ],

    fields: [
        {
            name: 'name',
            calculate: function (data) {
                return data['name_' + Bigmedia.Locales.currentLocale] || '';
            }
        },
        {name: 'name_ukr', type: 'string'},
        {name: 'name_en', type: 'string'},
        {name: 'name_ru', type: 'string'},
        {name: 'totalCount', type: 'int', defaultValue: '0'},
        {name: 'addCount', type: 'int', defaultValue: '0'},
        {name: 'subCount', type: 'int', defaultValue: '0'},
        {name: 'records', defaultValue: {}}
    ]
});

Ext.define('Bigmedia.model.City', {
    extend: 'Bigmedia.model.RefData'
    ,
    store: {
        type: 'store.cities'
        ,
        autoLoad: true
    }
});

Ext.define('Bigmedia.model.CityBoundary', {
    extend: 'Bigmedia.model.Base',

    fields: [
        {
            name: 'coords'
        },
        {
            name: 'geometry',
            calculate: function (data) {
                if (data.turf) {
                    var coords = data.turf.geometry.coordinates[0];
                    return new ol.geom.Polygon([coords.map(function(item){
                            return ol.proj.fromLonLat(item);
                        })
                    ]);
                }
                else return null;
            }
        },
        {
            name: 'turf',
            calculate: function (data) {
                if (data.coords && data.coords.length>0) {
                    var p = turf.polygon(data.coords);
                    // data is already simplified
                    // var tolerance = 0.005;
                    // var simplified = turf.simplify(p, tolerance, false);
                    // return simplified;
                    return p;
                }
                else return null;
            }
        },
        {
            name: 'jsts',
            calculate: function (data) {
                var polygonJsts = Bigmedia.Vars.convertTurfToJsts(turf.truncate(data.turf));
                return polygonJsts;
            }
        },
        {
            name: 'area'
            // area is given
            // ,
            // calculate: function (data) {
            //     if (data.turf) {
            //         return turf.area(data.turf);
            //     }
            //     else return null;
            // }
        },
        {
            name: 'bbox',
            calculate: function (data) {
                if (data.turf) {
                    var bbox = turf.bbox(data.turf);
                    return bbox;
                }
            }
        },
        {
            name: 'x',
            calculate: function (data) {
                if (data.bbox) {
                    return turf.distance(turf.point([data.bbox[0], data.bbox[1]]), turf.point([data.bbox[2], data.bbox[1]]));
                }
            }
        },
        {
            name: 'y',
            calculate: function (data) {
                if (data.bbox) {
                    return turf.distance(turf.point([data.bbox[0], data.bbox[1]]), turf.point([data.bbox[0], data.bbox[3]]));
                }
            }
        }
    ],
    proxy: {
        type: 'ajax',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'city_boundary.json',
        reader: {
            type: 'json'
        }
    }
});

Ext.define('Bigmedia.model.Catab', {
    extend: 'Bigmedia.model.RefData'
    ,
    store: {
        type: 'store.catabs'
        ,
        autoLoad: true
    }
});

Ext.define('Bigmedia.model.Size', {
    extend: 'Bigmedia.model.RefData'
    ,
    store: {
        type: 'store.sizes'
        ,
        autoLoad: true
    }
});

Ext.define('Bigmedia.model.Network', {
    extend: 'Bigmedia.model.RefData'
    ,
    store: {
        type: 'store.networks'
        ,
        autoLoad: true
    }
});

Ext.define('Bigmedia.model.Sidetype', {
    extend: 'Bigmedia.model.RefData'
    ,
    store: {
        type: 'store.sidetypes'
        ,
        autoLoad: true
    }
});

Ext.define('Bigmedia.model.PoiCategory', {
    extend: 'Bigmedia.model.RefData'
    ,
    store: {
        type: 'store.poicategories'
        ,
        autoLoad: true
    }
});

Ext.define('Bigmedia.model.Face', {
    extend: 'Ext.data.Model',
    idProperty: 'id',

    fields: [
        {name: 'id', type: 'int'},
        {name: 'num', type: 'number'},
        {name: 'inPlatform', type: 'boolean', defaultValue: true},
        {name: 'sides'},
        {name: 'supplierNo',
            calculate: function (data){
                return data.num;
            }
        },
        {name: 'address', type: 'string'},
        {name: 'occupancy' }, // type: 'string'},
        {
            name: 'id_city',
            type: 'int'
        },
        {
            name: 'id_size',
            type: 'int'
        },
        {
            name: 'id_network',
            type: 'int'
        },{ name: 'id_catab', type: 'int'},
        { name: 'city',
            calculate: function (data) {
                return Bigmedia.Locales.refCity[data.id_city];
            }
        },
        { name: 'doorsNo',
            calculate: function (data) {
                return data.doors_no;
            }
        },
        // {
        //     name: 'city',
        //     calculate: function (data) {
        //         var citiesStore = Ext.getStore('Cities'); //#1
        //         var rec = citiesStore.findRecord('id', data.id_city);//#2
        //         var res = '';
        //         if (rec) {
        //             res = rec.get('name');
        //         }
        //         return res;
        //     }
        // },
        { name: 'supplier_size' },
        { name: 'size',
            calculate: function (data) {
                return Bigmedia.Locales.refSize[data.id_size] || data.supplier_size;
            }
        },
        { name: 'supplier_sidetype' },
        { name: 'sidetype',
            calculate: function (data) {
                return Bigmedia.Locales.refSupplierSidetype[data.supplier_sidetype];
            }
        },
        { name: 'source', defaultValue: 'server' },
        // {
        //     name: 'size',
        //     calculate: function (data) {
        //         var sizesStore = Ext.getStore('Sizes'); //#1
        //         var rec = sizesStore.findRecord('id', data.id_size);//#2
        //         var res = '';
        //         if (rec) {
        //             res = rec.get('name');
        //         }
        //         return res;
        //     }
        // },
        { name: 'supplier_type' },
        { name: 'network',
            calculate: function (data) {
                return Bigmedia.Locales.refNetwork[data.id_network] || data.supplier_type;
            }
        },
        // {
        //     name: 'network',
        //     calculate: function (data) {
        //         var networksStore = Ext.getStore('Networks'); //#1
        //         var rec = networksStore.findRecord('id', data.id_network);//#2
        //         var res = '';
        //         if (rec) {
        //             res = rec.get('name');
        //         }
        //         return res;
        //     }
        // },
        { name: 'catab',
            calculate: function (data) {
                return Bigmedia.Locales.refAB[data.id_catab];
            }
        },
        // {name: 'catab',
        //     calculate: function (data) {
        //         var catsStore = Ext.getStore('Catabs'); //#1
        //         var rec = catsStore.getById(data.id_catab);//#2
        //         var res = '';
        //         if (rec) {
        //             res = rec.get('name');
        //         }
        //         return res;
        //     }
        // },
        {name: 'hide_doors_data'},
        {name: 'grp', type: 'float', defaultValue: 0.01, allowNull: true},
        {name: 'displayGrp',
          calculate: function (data) {
            if (!data.hide_doors_data) {
              return data.grp
            }
          }},
        {name: 'ots', type: 'float', defaultValue: 1, allowNull: true},
        {name: 'displayOts',
          calculate: function (data) {
            if (!data.hide_doors_data) {
              return data.ots
            }
          }},
        {name: 'lon', type: 'float'},
        {name: 'lat', type: 'float'},
        {name: 'pos'},
        {name: 'angle'},
        {
            name: 'geometry',
            calculate: function (data) {
                if (parseFloat(data.lon) && parseFloat(data.lat)) {
                    var coord = [parseFloat(data.lon), parseFloat(data.lat)];
                    // ,
                    //     pos = data.pos;
                    // if (+pos !== 0) {
                    //     var offset = [pos * 0.00005, 0],
                    //         angleRad = (data.angle) *  Math.PI / 180;
                    //     ol.coordinate.rotate(offset, angleRad);
                    //
                    //     ol.coordinate.add(coord, offset);
                    //
                    //     console.log([pos, coord]);
                    // }
                    return new ol.geom.Point(ol.proj.fromLonLat(coord));
                }
                else return null;
            }
        },{
            name: 'icon',
            calculate: function (data) {
                var s = 'l'; //s-small(<18 sq.m.), b-board(~18 sq.m.), l-large(>18 sq.m.)
                switch (data.size) {
                    case '1.2x1.8':
                    case '1.2x3.6':
                    case '1.5x3':
                    case '2.3x3.14':
                    case '2.3x3.5':
                        s = 's';
                        break;
                    case '3x4':
                    case '3x6':
                    case '6x3':
                    case '7x4':
                    case '3x11':
                    case '3x12':
                        s = 'b';
                        break;
                }
                return s;
            }
        },{
            name: 'selected', type: 'boolean', defaultValue: false
        },{
            name: 'rating', type: 'int'
            // , defaultValue: 1
        },{
            name: 'zone',
            calculate: function (data) {
                return Bigmedia.Locales.refSideZone[data.rating];
            }
        },{
            name: 'doors_no', type: 'int', allowNull: true
        },{
            name: 'light', type: 'string'
        },{
            name: 'busy', type: 'int'
        },{
            name: 'inCart', type: 'boolean', defaultValue: false
        },{
            name: 'streets', type: 'string'
        },{
            name: 'supplierName', allowNull: true
        },{
            name: 'supplier', // type: 'string', defaultValue: 'BIGMEDIA'
            calculate: function (data) {
                return Bigmedia.Locales.refSupplier[data.id_supplier] || data.supplierName;
            }
        },{
            name: 'supplierNo', mapping: 'supplier_sn'
        },{
            name: 'id_supplier', type: 'int' //, defaultValue: 1
        // },{
        //     name: 'photos'
        // },{
        //     name: 'photo_url'
        },{
            name: 'urlPhoto', mapping: 'photo_url'
            // name: 'urlPhoto',
            // calculate: function (data) {
            //     if (data.photo_url) {
            //         return photo_url
            //     }
            //     else {
            //         return '/api/v1/facephoto?idFace=' + data.photos[0];
            //     }
            // }
        },{
            name: 'urlSchema', mapping: 'schema_url'
        },{
            name: 'price', type: 'number', allowNull: true
        },{
            name: 'finalPrice',
            type: 'number', defaultValue: 0
            // calculate: function (data) {
            //     return Bigmedia.Vars.getDefaultRulesGroup() ? Bigmedia.Vars.getDefaultRulesGroup().getFaceMonthPrice(data) : data.price;
            //     // return Bigmedia.Vars.getPromocode() ? data.price - data.price * Bigmedia.Vars.getPromocode().discount / 100 : data.price;
            // }
        },{
            name: 'netPrice',
            type: 'number', defaultValue: 0
            // calculate: function (data) {
            //     return Bigmedia.Vars.getDefaultRulesGroup() ? Bigmedia.Vars.getDefaultRulesGroup().getFaceMonthPrice(data) : data.price;
            //     // return Bigmedia.Vars.getPromocode() ? data.price - data.price * Bigmedia.Vars.getPromocode().discount / 100 : data.price;
            // }
        },{
            name: 'clientPrice',
            type: 'number', defaultValue: 0
            // calculate: function (data) {
            //     return Bigmedia.Vars.getDefaultRulesGroup() ? Bigmedia.Vars.getDefaultRulesGroup().getFaceMonthPrice(data) : data.price;
            //     // return Bigmedia.Vars.getPromocode() ? data.price - data.price * Bigmedia.Vars.getPromocode().discount / 100 : data.price;
            // }
        },{
            name: 'occByDays'
            // ,
            // calculate: function (data) {
            //     var parsedValues = [],
            //         newValues = data.occupancy;
            //     if (!newValues) { return;}
            //
            //     var res,
            //         re = /(\d+)(\w)/g;
            //     var maskedArray = newValues.map(function(occString){
            //         var occ = occString,
            //             daysArray = [];
            //         while ((res = re.exec(occ)) != null) {
            //             daysArray = daysArray.concat(new Array(+res[1] + 1).join(res[2]).split(''));
            //         }
            //         return daysArray;
            //     }).reduce(function(res, daysArray){
            //         if (!res) {
            //             return daysArray;
            //         }
            //         return res.map(function(dayStatus, ix){
            //             if (dayStatus === 'f' || daysArray[ix] === 'f') {
            //                 return 'f';
            //             }
            //             if (dayStatus === 't' || daysArray[ix] === 't') {
            //                 return 't';
            //             }
            //             if (dayStatus === 'r' || daysArray[ix] === 'r') {
            //                 return 'r';
            //             }
            //             if (dayStatus === 's' || daysArray[ix] === 's') {
            //                 return 's';
            //             }
            //             if (dayStatus === 'd' || daysArray[ix] === 'd') {
            //                 return 'd';
            //             }
            //             return 'n';
            //         });
            //     });
            //     return maskedArray.join('');
            // }
        },{
            name: 'parsedOccupancy'
            // ,
            // calculate: function (data) {
            //     var parsedValues = [],
            //         now = new Date(),
            //         startMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
            //         tmp = [startMonth.getUTCDate(), startMonth.getUTCMonth(), startMonth.getUTCFullYear()],
            //         newValues = data.occupancy,
            //         occByDays = data.occByDays;
            //
            //     if (!newValues) { return;}
            //
            //     var Month = function (year, mon, day) {
            //         this.day = (day || 1);
            //         if ( mon > 11 ) {
            //             this.month = 0;
            //             this.year = year + 1;
            //         } else {
            //             this.month = mon;
            //             this.year = year;
            //         }
            //         this.days = new Date(Date.UTC(year, mon + 1, 0)).getUTCDate();
            //         this.emptyDays = this.days - this.day + 1;
            //         this.actualDays = this.days - this.day + 1;
            //         this.periods = [];
            //
            //         this.addDay = function (status) {
            //             if (this.emptyDays === 0) {
            //                 return false;
            //             }
            //             if (this.periods.length === 0) {
            //                 return this.addPeriod(1, status);
            //             }
            //             if (this.periods[this.periods.length - 1].status === status) {
            //                 this.periods[this.periods.length - 1].days++;
            //                 this.emptyDays--;
            //                 return -(this.emptyDays);
            //             }
            //             return this.addPeriod(1, status);
            //         };
            //
            //         this.addPeriod = function (days, status) {
            //             var diff = days - this.emptyDays;
            //             var period = {};
            //             period.status = status;
            //             if (diff <= 0) {
            //                 period.days = days;
            //                 this.emptyDays = Math.abs(diff);
            //             }
            //             else {
            //                 period.days = this.emptyDays;
            //                 this.emptyDays = 0;
            //             }
            //             if (period.days > 0) {
            //                 this.periods.push(period);
            //             }
            //             return diff;
            //         }
            //         this.monthStatus = function () {
            //             if(this.periods.length == 1){
            //                 return this.periods[0].status;
            //             } else if (this.periods.length == 0){
            //                 return null;
            //             }
            //             var maxPeriod = this.periods.reduce(function(max,cur){
            //                 if(max.days<=cur.days) return cur;
            //                 else return max;
            //             });
            //             return maxPeriod.status;
            //         }
            //     };
            //     // var res,
            //     //     re = /(\d+)(\w)/g;
            //     // var maskedArray = newValues.map(function(occString){
            //     //     var occ = occString,
            //     //         daysArray = [];
            //     //     while ((res = re.exec(occ)) != null) {
            //     //         daysArray = daysArray.concat(new Array(+res[1] + 1).join(res[2]).split(''));
            //     //     }
            //     //     return daysArray;
            //     // }).reduce(function(res, daysArray){
            //     //     if (!res) {
            //     //         return daysArray;
            //     //     }
            //     //     return res.map(function(dayStatus, ix){
            //     //         if (dayStatus === 'f' || daysArray[ix] === 'f') {
            //     //             return 'f';
            //     //         }
            //     //         if (dayStatus === 't' || daysArray[ix] === 't') {
            //     //             return 't';
            //     //         }
            //     //         if (dayStatus === 'r' || daysArray[ix] === 'r') {
            //     //             return 'r';
            //     //         }
            //     //         if (dayStatus === 's' || daysArray[ix] === 's') {
            //     //             return 's';
            //     //         }
            //     //         if (dayStatus === 'd' || daysArray[ix] === 'd') {
            //     //             return 'd';
            //     //         }
            //     //         return 'n';
            //     //     });
            //     // });
            //     if (Bigmedia.Vars.cacheOccupancies[occByDays]) {
            //         parsedValues = Bigmedia.Vars.cacheOccupancies[occByDays];
            //     } else {
            //         var curMonth = new Month(+tmp[2], +tmp[1], +tmp[0]);
            //         parsedValues = occByDays.split('').reduce(function(res, status){
            //             var cur = res[res.length - 1];
            //             if (cur.emptyDays === 0) {
            //                 cur = new Month(cur.year, cur.month + 1);
            //                 res.push(cur);
            //             }
            //             cur.addDay(status);
            //             return res;
            //         },[curMonth]);
            //         Bigmedia.Vars.cacheOccupancies[occByDays] = parsedValues;
            //     }
            //     // console.log(parsedValues);
            //     return parsedValues;
            //     // while ((res = re.exec(newValues)) != null) {
            //     //     var restDays = +res[1],
            //     //         status = res[2];
            //     //     while (restDays > 0) {
            //     //         if (curMonth.emptyDays == 0) {
            //     //             parsedValues.push(curMonth);
            //     //             curMonth = new Month(curMonth.year, curMonth.month + 1);
            //     //         }
            //     //         restDays = curMonth.addPeriod(restDays, status);
            //     //     }
            //     // }
            //     // parsedValues.push(curMonth);
            //     // return parsedValues;
            // }
        },
        {name: 'ks'},
        {name: 'useKSData', type: 'boolean' , default: false},
        {name: 'ksOTS', type: 'float', defaultValue: 0.00, allowNull: true},
        {name: 'displayksOTS', calculate: function (data) { return data.ksOTS }},
        {name: 'ksGRP', type: 'float', defaultValue: 0.00, allowNull: true},
        {name: 'displayksGRP', calculate: function (data) { return data.ksGRP }},
        {name: 'ksTRP', type: 'float', defaultValue: 0.00, allowNull: true},
        {name: 'displayksTRP', calculate: function (data) {  return data.ksTRP }},
        // 'cnt_only_home', 'cnt_only_work', 'cnt_home_work', 'cnt_transit', 'cnt_all_subs', 'cnt_home_general', 'cnt_work_general',
        {
            name: 'cityRegion', mapping: 'city_region'
        }
        // ,
        // {
        //     name: 'cells',
        //     calculate: function (data) {
        //         return Bigmedia.Vars.getFaceDataApproxCells(data);
        //     }
        // }
        // ,
        // {
        //     name: 'coverages',
        //     calculate: function (data) {
        //         return Bigmedia.Vars.getCoverages(data.geometry, data.id_city, data.grp, data.angle);
        //     }
        // }
    ],
    setCampaign: function (campRec) {
      if (campRec) {
        this.campaignId = campRec.getId();
      }
    },
    proxy: {
        type: 'memory'
    }
});

Ext.define('Bigmedia.model.Side', {
    extend: 'Ext.data.Model',

    idProperty: 'id',

    fields: [
        {name: 'id', type: 'int'},
        {
            name: 'faceId',
            // reference: {
            //     parent: 'Face',
            //     inverse: {
            //         autoLoad: true
            //     }
            // }
        },
        // {name: 'faceId', type: 'int'},
        {name: 'num', type: 'int'},
        {name: 'supplierNo', type: 'string'},
        {name: 'doorsNo', type: 'int', allowNull: true},
        {name: 'occ', type: 'string'}
    ],

    proxy: {
        type: 'ajax',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: '/api/v1/sides',
        reader: {
            type: 'json'
        }
    }
});
