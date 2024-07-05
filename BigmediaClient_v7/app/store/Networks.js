/**
 * Created by Alexander.Ustilov on 29.01.2016.
 */
Ext.define('Bigmedia.store.Networks', {
    extend: 'Ext.data.Store',
    alias: 'store.networks',
    storeId: 'Networks',

    //model: 'Bigmedia.model.Network',

    fields: [
        {name: 'id', type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'totalCount', type: 'int', defaultValue: '0'},
        {name: 'addCount', type: 'int', defaultValue: '0'},
        {name: 'subCount', type: 'int', defaultValue: '0'}
    ],

    data: Bigmedia.Locales.getRefStoreData('refNetwork'),

    proxy: {
        type: 'memory'
    },
    autoLoad: true
});
