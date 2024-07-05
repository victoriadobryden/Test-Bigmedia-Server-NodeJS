Ext.define('Bigmedia.store.Advertisers', {
    extend: 'Ext.data.Store',
    alias: 'store.advertisers',
    storeId: 'Advertisers',

    model: 'Bigmedia.model.Advertiser',

    requires: [
        'Bigmedia.model.Campaign'
    ],

    autoLoad: true
});
