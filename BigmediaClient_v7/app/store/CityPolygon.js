Ext.define('Bigmedia.store.CityPolygon', {
    extend: 'Ext.data.Store',
    alias: 'store.citypolygons',
    storeId: 'CityPolygon',

    model: 'Bigmedia.model.CityPolygon',

    requires: [
        'Bigmedia.model.CityPolygon'
    ],
    autoLoad: false,

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }

});
