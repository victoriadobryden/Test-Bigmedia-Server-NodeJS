Ext.define('Bigmedia.store.CampChartStore', {
    extend: 'Ext.data.Store',
    alias: 'store.campchartstore',

    fields: [
        { name: 'label', type: 'string'},
        { name: 'count', type: 'float'},
        { name: 'budget', type: 'float'},
        { name: 'cpt', type: 'float'}
    ]
});
