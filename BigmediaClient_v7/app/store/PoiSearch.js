Ext.define('Bigmedia.store.PoiSearch', {
    extend: 'Ext.data.Store',
    alias: 'store.poisearch',
    storeId: 'PoiSearch',

    model: 'Bigmedia.model.Poi',

    requires: [
        'Bigmedia.model.Poi'
    ],
    autoLoad: false,
    groupField: 'name',
    proxy: {
        //type: 'jsonp',
        type: 'ajax',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: '/api/v1/data?poi=1&locale=' + Bigmedia.Locales.currentLocale,
        //url: '{entityName:lowercase}.json',
        //url:'/freesides.json',
        reader: {
            type: 'json'
        }
    },
    listeners: {
        load: function( refStore, records, successful, operation, eOpts ){
           //var poiFilterStore = Ext.getStore('P')
        }
    }

});
