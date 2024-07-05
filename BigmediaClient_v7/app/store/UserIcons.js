Ext.define('Bigmedia.store.UserIcons', {
    extend: 'Ext.data.Store',
    alias: 'store.usericons',
    storeId: 'UserIcons',

    fields: [
        'id',
        { name: 'createdAt', type: 'date', dateFormat: 'c' }
    ],

    requires: [
    ],
    autoLoad: true,
    autoSync: false,

    proxy: {
        type: 'rest',
        url: 'api/v1/icons',
        reader: {
            type: 'json'
        }
    }
});
