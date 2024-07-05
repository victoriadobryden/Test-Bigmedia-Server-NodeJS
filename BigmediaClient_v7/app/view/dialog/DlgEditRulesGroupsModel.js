Ext.define('Bigmedia.view.dialog.DlgEditRulesGroupsModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.dialog-dlgeditrulesgroups',

    stores: {
        lookupSuppliers: {
            source: 'Suppliers'
        },
        lookupCities: {
            source: 'Cities'
        },
        lookupSizes: {
            source: 'Sizes'
        },
        lookupSidetypes: {
            source: 'Networks'
        },
        lookupTypes: {
            source: 'DiscountTypes'
        },
        groupsForImport: {
            source: 'RulesGroups'
        },
        lookupMarginType: {
          source: 'MarginTypes'
        },
        lookupMarginRoundType: {
          source: 'MarginRoundTypes'
        }
        // groups: {
        //   model: 'RulesGroup',
        //   autoLoad: true,
        //   autoSync: true
        // }
    }

});
