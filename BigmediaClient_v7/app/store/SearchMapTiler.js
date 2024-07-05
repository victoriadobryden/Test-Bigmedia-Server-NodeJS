Ext.define('Bigmedia.proxy.SearchMapNominatimProxy', {
    extend: 'Ext.data.proxy.Ajax',
    alias: 'proxy.searchmapnominatimproxy',

    useDefaultXhrHeader: false,

    reader: {
        type: 'json',
        rootProperty: 'features'
    },

    buildUrl: function(request) {
        var me        = this,
            operation = request.getOperation(),
            records   = operation.getRecords(),
            record    = records ? records[0] : null,
            // format    = me.getFormat(),
            url       = me.getUrl(request),
            params = request.getParams(),
            id;

        // console.log([operation, records, url, params]);

        // if (record && !record.phantom) {
        //     id = record.getId();
        // } else {
        //     id = operation.getId();
        // }

        // console.log('url before: ' + url);
        // console.log(me);
        // console.log(request);

        // if (me.getAppendId() && me.isValidId(id)) {
        //     if (!url.match(me.slashRe)) {
        //         url += '/';
        //     }
        //
        //     url += encodeURIComponent(id);
        //     if (params) {
        //         delete params[me.getIdParam()];
        //     }
        // }
        // console.log('url after: ' + url);

        // if (format) {
        //     if (!url.match(me.periodRe)) {
        //         url += '.';
        //     }
        //
        //     url += format;
        // }

        // if (!record) {
        //     var filters = params.filter;
        //     if (filters) {
        //         filters = Ext.decode(filters);
        //         id = filters[0].value;
        //         var addSlash = (url.charAt() !== '/')?'/':'';
        //         url = '/api/v1/campaigns/' + encodeURIComponent(id) + addSlash + url;
        //         delete params['filter'];
        //         // params.filter = '';
        //     }
        // } else {
        //     url = '/api/v1/' + url;
        // }
        // /geocoding
        // http://10.10.100.3/
        // https://www.bigmedia.ua/client
        url = 'geocoding/search?q=' + encodeURIComponent(params.query) + '&format=geojson&accept-language=uk,en,ru&countrycodes=ua&addressdetails=1&polygon_geojson=1&polygon_threshold=0.001';

        // console.log('url in request: ' + url);
        delete params.query;
        request.setUrl(url);


        // console.log('url in the end: ' + url);
        // console.log('filter: %o', params.filter);

        return me.callParent([request]);
    }
});

Ext.define('Bigmedia.proxy.SearchMapTilerProxy', {
    extend: 'Ext.data.proxy.Ajax',
    alias: 'proxy.searchmaptilerproxy',

    useDefaultXhrHeader: false,

    reader: {
        type: 'json',
        rootProperty: 'features'
    },

    buildUrl: function(request) {
        var me        = this,
            operation = request.getOperation(),
            records   = operation.getRecords(),
            record    = records ? records[0] : null,
            // format    = me.getFormat(),
            url       = me.getUrl(request),
            params = request.getParams(),
            id;

        // console.log([operation, records, url, params]);

        // if (record && !record.phantom) {
        //     id = record.getId();
        // } else {
        //     id = operation.getId();
        // }

        // console.log('url before: ' + url);
        // console.log(me);
        // console.log(request);

        // if (me.getAppendId() && me.isValidId(id)) {
        //     if (!url.match(me.slashRe)) {
        //         url += '/';
        //     }
        //
        //     url += encodeURIComponent(id);
        //     if (params) {
        //         delete params[me.getIdParam()];
        //     }
        // }
        // console.log('url after: ' + url);

        // if (format) {
        //     if (!url.match(me.periodRe)) {
        //         url += '.';
        //     }
        //
        //     url += format;
        // }

        // if (!record) {
        //     var filters = params.filter;
        //     if (filters) {
        //         filters = Ext.decode(filters);
        //         id = filters[0].value;
        //         var addSlash = (url.charAt() !== '/')?'/':'';
        //         url = '/api/v1/campaigns/' + encodeURIComponent(id) + addSlash + url;
        //         delete params['filter'];
        //         // params.filter = '';
        //     }
        // } else {
        //     url = '/api/v1/' + url;
        // }

        url = 'https://api.maptiler.com/geocoding/' + encodeURIComponent(params.query) + '.json?key=GmaJe1y4hHa7LFEFyCtk&language=uk,en,ru';

        // console.log('url in request: ' + url);
        delete params.query;
        request.setUrl(url);


        // console.log('url in the end: ' + url);
        // console.log('filter: %o', params.filter);

        return me.callParent([request]);
    }
});

Ext.define('Bigmedia.store.SearchMapTiler', {
    extend: 'Ext.data.Store',
    alias: 'store.search-maptiler',

    fields: [
        // { name: 'place_name'},
        // { name: 'bbox'},
        // { name: 'center'}
        { name: 'properties'},
        { name: 'bbox'},
        { name: 'geometry'},
        { name: 'place_id', calculate: function (data) {
            return data.properties.place_id;
        }},
        { name: 'osm_type', calculate: function (data) {
            return data.properties.osm_type;
        }},
        { name: 'osm_id', calculate: function (data) {
            return data.properties.osm_id;
        }},
        { name: 'category', calculate: function (data) {
            return data.properties.category;
        }},
        { name: 'type', calculate: function (data) {
            return data.properties.type;
        }},
        { name: 'display_name', calculate: function (data) {
            return data.properties.display_name;
        }},
        { name: 'icon', calculate: function (data) {
            return data.properties.icon;
        }},
        { name: 'address', calculate: function (data) {
            return data.properties.address;
        }},
        { name: 'centroid', calculate: function (data) {
            return turf.centroid(data.geometry);
        }},
        { name: 'olGeometry', calculate: function (data) {
            return data.properties.category === 'boundary' ? new ol.geom.Polygon(
                data.geometry.coordinates.map(function(item) {
                    return item.map(function(item) {
                        return ol.proj.fromLonLat(item);
                        // return item.map(function(item) {
                        // });
                    });
                })
            ) : data.properties.category === 'highway' ? new ol.geom.LineString(
                data.geometry.coordinates.map(function(item) {
                    return ol.proj.fromLonLat(item);
                })
            ) : new ol.geom.Point(ol.proj.fromLonLat(data.centroid.geometry.coordinates))
        }}
    ],

    requires: [
        'Bigmedia.model.Poi'
    ],
    autoLoad: false,
    groupField: 'name',
    proxy: {
        type: 'searchmapnominatimproxy',
        limitParam: null,
        pageParam: '',
        startParam: ''
    },
    listeners: {
        load: function( refStore, records, successful, operation, eOpts ){
           //var poiFilterStore = Ext.getStore('P')
           // console.log([refStore, records, successful, operation]);
        }
    }

});
