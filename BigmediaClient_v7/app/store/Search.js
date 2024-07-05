/**
 * Created by Alexander.Ustilov on 06.03.2016.
 */
Ext.define('Bigmedia.store.Search', {
    extend: 'Ext.data.Store',
    alias: 'store.search',
    storeId: 'Search',

    model: 'Bigmedia.model.Search',

    requires: [
        'Bigmedia.model.Search'
    ],
    autoLoad: false,
    proxy: {
        //type: 'jsonp',
        type: 'ajax',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: '/api/v1/data?search=1&locale=' + Bigmedia.Locales.currentLocale,
        //url: '{entityName:lowercase}.json',
        //url:'/freesides.json',
        reader: {
            type: 'json'
        }
    }
});
