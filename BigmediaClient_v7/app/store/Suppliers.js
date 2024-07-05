Ext.define('Bigmedia.store.Suppliers', {
    extend: 'Ext.data.Store',
    alias: 'store.suppliers',
    storeId: 'Suppliers',

    fields: [
        {name: 'id', type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'totalCount', type: 'int', defaultValue: '0'},
        {name: 'addCount', type: 'int', defaultValue: '0'},
        {name: 'subCount', type: 'int', defaultValue: '0'}
    ],

    data: Bigmedia.Locales.getRefStoreData('refSupplier'),

    proxy: {
        type: 'memory'
    },
    autoLoad: true
});
