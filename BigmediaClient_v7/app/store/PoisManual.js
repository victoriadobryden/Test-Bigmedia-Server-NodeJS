Ext.define('Bigmedia.store.PoisManual', {
    extend: 'Ext.data.Store',
    alias: 'store.poismanual',
    storeId: 'PoisManual',

    model: 'Bigmedia.model.PoiManual',

    requires: [
        'Bigmedia.model.PoiManual'
    ],
    autoLoad: true,
    autoSync: true,

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    listeners: {
        update: function (store, record) {
            if (!record.get('mixedAddress') && !record.get('lat') && !record.get('lon') && record.get('resultLat')) {
                record.set({
                    resultName: null,
                    resultCity: null,
                    resultStreet: null,
                    resultHousenumber: null,
                    resultLat: null,
                    resultLon: null,
                    resultLatLon: null,
                    resultGeometry: null
                });
            }
        }
    }
});
