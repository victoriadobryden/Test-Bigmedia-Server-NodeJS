Ext.define('Bigmedia.view.dialog.DlgAutoPlanOldModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.dialog-dlgautoplanold',

    stores: {
        planVarStore: {
            type: 'planvarstore'
        },
        chainedVarStore: {
            source: '{planVarStore}',
            filters: [{
                property: 'id_city',
                value: '{selectedCity.id}',
                operator: '='
            }],
            sorters: [{
                property: 'city',
                direction: 'ASC'
            }
            // , {
            //     property: 'cpt',
            //     direction: 'ASC'
            // }, {
            //     property: 'budget',
            //     direction: 'ASC'
            // }
        ]
        },
        finalStore: {
            type: 'plannerstore'
        },
        resCitiesStore: {
            fields: [
                'id', 'name'
            ],
            proxy: 'memory'
        },
        catabStore: {
            data: [{ dimension: 'A/B', data0: 80, data1: 20, name0: 'A', name1: 'B'}],
            fields: ['dimension', 'data0', 'data1', 'name0', 'name1'],
            autoLoad: true,
            proxy: { type: 'memory'}
        },
        rulesgroups: {
            type: 'rulesgroups'
        }
    },
    formulas: {
        fieldcata: {
            bind: {
                bindTo: '{catabStore.first}',
                deep: true
            },
            get: function (rec) {
                return rec.get('data0');
            },
            set: function (val) {
                this.get('catabStore').first().set({'data0': val, 'data1': 100 - val});
                return val;
            }
        },
        fieldcatb: {
            bind: {
                bindTo: '{catabStore.first}',
                deep: true
            },
            get: function (rec) {
                return rec.get('data1');
            },
            set: function (val) {
                this.get('catabStore').first().set({'data0': 100 - val, 'data1': val});
                return val;
            }
        }
    },
    data: {
        splitab: {
            cata: 80,
            catb: 20
        },
        startFrom: 'blank',
        startFromNew: null,
        startFromCart: null,
        startFromCampaign: null,
        startFromCampaignId: null,
        cartIsEmpty: true,
        selectedCity: null,
        selectedVariant: null,
        thirdpartySource: true,
        promo: {
            code: '',
            status: 'frown',
            value: null
        },
        availableFaces: 0,

        startDate: new Date(Date.UTC((new Date()).getFullYear(), (new Date()).getMonth()+1, 1)),
        endDate: new Date(Date.UTC((new Date()).getFullYear(), (new Date()).getMonth()+2, 0)),

        maxOnStreet: 5,
        minDistanceOnStreet: 500,
        minDistance: 700,
        planBoards: null,

        textTypicals: '',
        textBests: '',
        textWorsts: '',
        planSplits: {
            bigmedia: 0.5
        },
        planBudget: null,
        planCoverage: null,
        descrSelectedCampaign: '',
        saveToNewCampaign: null,
        saveToNewCampaignName: '',
        saveToCampaign: null,
        saveToCampaignId: null,
        savepriceoption: '1',
        savepricepassword: null,
        savepriceglobaldisable: false,
        savepricepasswordglobal: false,
        ruleType: '1',
        discountSimple: 0,
        theGroup: null,
        planReady: false
    }
});
