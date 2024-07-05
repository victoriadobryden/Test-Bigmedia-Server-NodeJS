Ext.define('Bigmedia.view.chart.CampStatModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.campstat',

    requires: [
        'Ext.data.Store',
        'Bigmedia.model.Base',
        'Bigmedia.store.CampChartStore'
    ],

    stores: {
        srcStore: {
            type: 'plannerstore'
        },
        // campStore: {
        //     source: '{srcStore}',
        //     filters: [{
        //         property: 'city',
        //         value: '{selectedCity && selectedCity.label}',
        //         operator: '='
        //     }]
        // },
        campByCities: {
            type: 'campchartstore'
        },
        campBySizes: {
            type: 'campchartstore'
        },
        campByNetworks: {
            type: 'campchartstore'
        },
        campByCatabs: {
            type: 'campchartstore'
        },
        campByZones: {
            type: 'campchartstore'
        },
        campBySuppliers: {
            type: 'campchartstore'
        }
        // ,
        // finalChartStore: {
        //     fields: [
        //         { name: 'label', type: 'string'},
        //         { name: 'quantity', type: 'float'},
        //         { name: 'budget', type: 'float'},
        //         { name: 'cpt', type: 'float'}
        //     ]
        // }
    },

    data: {
        selectedCity: null,
        citiesHidden: true
    }

});
