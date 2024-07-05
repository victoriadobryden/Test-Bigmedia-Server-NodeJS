Ext.define('Bigmedia.model.PoiManual', {
    extend: 'Ext.data.Model',

    idProperty: 'id',
    fields: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'mixedAddress', type: 'string'},
        { name: 'address'},
        { name: 'housenumber'},
        { name: 'city'},
        { name: 'lon', defaultValue: null},
        { name: 'lat', defaultValue: null},
        { name: 'resultName'},
        { name: 'resultAddress'},
        { name: 'resultHousenumber'},
        { name: 'resultCity'},
        { name: 'resultLon', type: 'number', defaultValue: null},
        { name: 'resultLat', type: 'number', defaultValue: null},
        { name: 'resultLatLon',
            calculate: function (data) {
                return data.resultLat ? (data.resultLat.toString() + ', ' + data.resultLon.toString()) : '';
            }
        },
        { name: 'resultGeometry'}
    ]
});
