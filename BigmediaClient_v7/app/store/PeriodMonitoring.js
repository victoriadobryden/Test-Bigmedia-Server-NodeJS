Ext.define('Bigmedia.store.PeriodMonitoring', {
    extend: 'Ext.data.Store',
    alias: 'store.periodMonitoring',
    storeId: 'PeriodMonitoring',

    model: 'Bigmedia.model.PeriodMonitoring',

    requires: [
        'Bigmedia.model.PeriodMonitoring'
    ],
    autoLoad: true
});
