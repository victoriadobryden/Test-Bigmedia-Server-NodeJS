Ext.define('Bigmedia.store.PlanVariantStore', {
    extend: 'Ext.data.Store',
    //extend: 'Ext.data.ChainedStore',
    alias: 'store.planvarstore',

    model: 'Bigmedia.model.PlanVariant',

    requires: [
        'Bigmedia.model.PlanVariant',
        'Bigmedia.store.Faces'
    ],

    // asynchronousLoad: false,

    // autoLoad: true,
    // remoteSort: true,
    // remoteFilter: true,

    // pageSize: 3,

    proxy: {
        type: 'memory'
        // ,
        // enablePaging: true
    },

    listeners: {
        add: function (store, records) {
            records.forEach(function(rec){
                rec.faces().on('datachanged', function() {
                    var stat = rec.getCovStat();
                    rec.set({
                        boards: rec.faces().getCount(),
                        ots: rec.faces().sum('ots'),
                        grp: rec.faces().sum('grp'),
                        budget: rec.faces().sum('finalPrice'),
                        coverage: Math.round(stat.covMax * stat.grps * 100 / (stat.covMax + stat.grps)) / 100
                    });
                });
            });
        },
        update: function (store, record, operation, modifiedFieldNames) {
            if (record.get('selected')) {
                var city = record.get('city');
                store.each(function(rec){
                    if (rec.get('city') === city && rec !== record) {
                        rec.set('selected', false);
                    }
                });
            }
        }
    }
});
