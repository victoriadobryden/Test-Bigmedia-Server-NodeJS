Ext.define('Bigmedia.store.RulesGroups', {
    extend: 'Ext.data.Store',
    alias: 'store.rulesgroups',
    storeId: 'RulesGroups',
    model: 'Bigmedia.model.RulesGroup',
    autoLoad: true,
    autoSync: true
});
