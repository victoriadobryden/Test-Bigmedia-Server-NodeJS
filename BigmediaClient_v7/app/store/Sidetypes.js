/**
 * Created by Alexander.Ustilov on 22.01.2016.
 */
Ext.define('Bigmedia.store.Sidetypes', {
    extend: 'Ext.data.Store',
    alias: 'store.sidetypes',
    storeId: 'Sidetypes',

    fields: [
        {name: 'id', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'totalCount', type: 'int', defaultValue: '0'},
        {name: 'addCount', type: 'int', defaultValue: '0'},
        {name: 'subCount', type: 'int', defaultValue: '0'}
    ],

    data: Bigmedia.Locales.getRefStoreData('refSupplierSidetype'),

    proxy: {
        type: 'memory'
    },
    autoLoad: true
});
