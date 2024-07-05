Ext.define('Bigmedia.model.Poi', {
    extend: 'Ext.data.Model',

    idProperty: 'id',
    fields: [
        { name: 'id', type: 'int' },
        { name: 'id_category', type: 'int' },
        { name: 'categoryId', type: 'int' },
        {
            name: 'category',
            calculate: function (data) {
                var catStore = Ext.getStore('PoiCategoriesTree'); //#1
                var rec = catStore.getNodeById(+data.id_category || +data.categoryId);//#2
                var res = '';
                if (rec) {
                    res = rec.get('name');
                }
                return res;
            }
        },
        { name: 'custom_category' },
        { name: 'iconId'},
        { name: 'color'},
        { name: 'name', type: 'string' },
        //     calculate: function (data) {
        //         return data['name_' + Bigmedia.Locales.currentLocale] || data['name_ukr'] || data['name_ru'] || data['name_en'] || '';
        //     }
        // },
        { name: 'name_ukr', type: 'string', persist: false },
        { name: 'name_ru', type: 'string', persist: false },
        { name: 'name_en', type: 'string', persist: false },
        { name: 'address'},
        { name: 'housenumber'},
        { name: 'city'},
        { name: 'lon'},
        { name: 'lat'},
        { name: 'geometry',
            // convert: function (v) {
            //     console.log(v);
            //     try {
            //         if (typeof v !== 'object') {
            //             return Bigmedia.Vars.readFeatureGeometry(JSON.parse(v));
            //         }
            //     } catch (e) {
            //         console.error('error converting geometry');
            //     }
            //     return v;
            // },
            mapping: function(data) {
                if (data.geometry) {
                  return data.geometry
                } else if (data.lon && data.lat) {
                  return { "type": "Point",
                    "coordinates": ol.proj.fromLonLat([data.lon, data.lat])
                  }
                }
            },
            serialize: function (value, record) {
              return Bigmedia.Vars.writeFeatureGeometry(record.get('geometry'));
            },
            persist: true
        },
        { name: 'centroid', persist: false},
        // { name: 'geometryGeoJSON', serialize: function (value, record) {
        //     return Bigmedia.Vars.writeFeatureGeometry(record.get('geometry'));
        // }},
        // {
        //     name: 'geometry',
        //     calculate: function (data) {
        //         if (parseFloat(data.lon) && parseFloat(data.lat)) {
        //             var coord = [parseFloat(data.lon), parseFloat(data.lat)];
        //             return new ol.geom.Point(ol.proj.fromLonLat(coord));
        //         }
        //         else return null;
        //     }
        // },
        { name: 'feature' , persist: false},
        { name: 'iconPath',
            calculate: function (data) {
                var res;
                if (data.id_category || data.categoryId) {
                    var catStore = Ext.getStore('PoiCategoriesTree'); //#1
                    var rec = catStore.getNodeById(+data.id_category || +data.categoryId);//#2
                    if (rec && rec.get('iconPath')) {
                        res = 'resources/images/symbols/' + rec.get('iconPath');
                    }
                } else if (data.iconId) {
                    res = 'api/v1/icons/' + data.iconId + '/image';
                }
                return res;
            }
        },
        { name: 'addCount', type: 'int', defaultValue: '0', persist: false},
        { name: 'subCount', type: 'int', defaultValue: '0', persist: false},
        { name: 'totalCount', type: 'int', defaultValue: '0', persist: false}
    ]
});
