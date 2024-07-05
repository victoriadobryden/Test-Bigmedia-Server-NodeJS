Ext.define('Bigmedia.store.CityBoundaries', {
    extend: 'Ext.data.Store',
    alias: 'store.cityboundaries',
    storeId: 'CityBoundaries',

    requires: [
        'Bigmedia.model.Base'
    ],

    model: 'Bigmedia.model.CityBoundary',

    autoLoad: true
});
