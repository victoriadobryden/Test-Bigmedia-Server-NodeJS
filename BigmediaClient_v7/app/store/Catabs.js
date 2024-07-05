Ext.define('Bigmedia.store.Catabs', {
    extend: 'Ext.data.Store',
    alias: 'store.catabs',
    storeId: 'Catabs',

    fields: [
        {name: 'id', type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'totalCount', type: 'int', defaultValue: '0'},
        {name: 'addCount', type: 'int', defaultValue: '0'},
        {name: 'subCount', type: 'int', defaultValue: '0'}
    ],

    data: Bigmedia.Locales.getRefStoreData('refAB'),

    // requires: [
    //     'Bigmedia.model.Base'
    // ],
    proxy: {
        type: 'memory'
    },
    autoLoad: true
});
