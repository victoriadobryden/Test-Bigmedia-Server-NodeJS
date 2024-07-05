Ext.define('Bigmedia.store.KSStreets', {
    extend: 'Ext.data.Store',
    alias: 'store.ksstreets',
    storeId: 'KSStreets',

    fields: ['id', 'direction', 'geometry'],

    autoLoad: false,

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }

});
