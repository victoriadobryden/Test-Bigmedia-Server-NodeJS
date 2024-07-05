Ext.define('Bigmedia.store.ThirdPartyBoards', {
    extend: 'Ext.data.Store',
    alias: 'store.thirdpartyboards',
    storeId: 'ThirdPartyBoards',

    model: 'Bigmedia.model.ThirdParty',

    requires: [
        'Bigmedia.model.ThirdParty'
    ],

    autoLoad: true,

    proxy: {
        type: 'memory'
    }
    // ,
    // autoSync: true
});
