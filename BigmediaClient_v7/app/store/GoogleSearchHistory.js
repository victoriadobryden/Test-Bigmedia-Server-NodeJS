Ext.define('Bigmedia.store.GoogleMapSearchHistory', {
    extend: 'Ext.data.Store',
    alias: 'store.googlemapsearchhistory',
    storeId: 'GoogleMapSearchHistory',

    model: 'Bigmedia.model.GoogleMapSearchCache',

    requires: [
        'Bigmedia.model.GoogleMapSearchCache'
    ],
    autoLoad: false,
    proxy: {
        //type: 'jsonp',
        type: 'ajax',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: '/api/v1/googlemapsearchhistory',
        reader: {
            type: 'json'
        }
    }
});
