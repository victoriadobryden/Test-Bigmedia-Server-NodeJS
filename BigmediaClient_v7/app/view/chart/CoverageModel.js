Ext.define('Bigmedia.view.chart.CoverageModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.coverage',

    requires: [
        'Ext.data.Store',
        'Bigmedia.model.Coverage'
    ],

    stores: {
        allCovers: {
            model: 'Bigmedia.model.Coverage',
            autoLoad: true
        },
        coverStore: {
            source: '{allCovers}',
            filters: [{
                property: 'id_city',
                value: '{cityId}',
                exactMatch: true
            }]
        },
        citiesStore: new Ext.data.Store()
    },

    data: {
        cityId: null,
        hideCitiesBar: true
    }

});
