Ext.define('Bigmedia.store.Sides', {
    extend: 'Ext.data.Store',
    alias: 'store.sides',
    storeId: 'Sides',

    model: 'Bigmedia.model.Side',

    requires: [
        'Bigmedia.model.Base'
    ],

    // autoLoad: true
    autoLoad: false
});
