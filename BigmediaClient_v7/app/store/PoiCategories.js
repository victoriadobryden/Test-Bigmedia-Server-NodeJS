Ext.define('Bigmedia.store.PoiCategories', {
    extend: 'Ext.data.Store',
    alias: 'store.poicategories',
    storeId: 'PoiCategories',

    fields: [
        {name: 'id', type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'totalCount', type: 'int', defaultValue: '0'},
        {name: 'addCount', type: 'int', defaultValue: '0'},
        {name: 'subCount', type: 'int', defaultValue: '0'}
    ],

    data: Bigmedia.Locales.getRefStoreData('refPoiCategory'),

    proxy: {
        type: 'memory'
    },
    autoLoad: true
});
