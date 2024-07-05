Ext.define('Bigmedia.store.KSPolygons', {
    extend: 'Ext.data.Store',
    alias: 'store.kspolygons',
    storeId: 'KSPolygons',

    model: 'Bigmedia.model.KSPolygon',

    requires: [
        'Bigmedia.model.KSPolygon'
    ],
    autoLoad: false,

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }

});
