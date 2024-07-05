Ext.define('Bigmedia.store.Sizes', {
    extend: 'Ext.data.Store',
    alias: 'store.sizes',
    storeId: 'Sizes',

    fields: [
        {name: 'id', type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'totalCount', type: 'int', defaultValue: '0'},
        {name: 'addCount', type: 'int', defaultValue: '0'},
        {name: 'subCount', type: 'int', defaultValue: '0'}
    ],

    data: Bigmedia.Locales.getRefStoreData('refSize'),

    proxy: {
        type: 'memory'
    },
    autoLoad: true
});
