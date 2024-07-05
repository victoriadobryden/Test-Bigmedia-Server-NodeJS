Ext.define('Bigmedia.view.dialog.DlgEditRule', {
    extend: 'Ext.window.Window',
    xtype: 'dlgeditrule',

    title: Bigmedia.Locales.discountBuilder.dlgEditRuleTitle,

    layout: 'fit',
    modal: true,
    width: 500,
    height: 420,
    resizable: true,
    closable: true,

    items: {
        xtype: 'form',
        reference: 'form',
        bodyPadding: 10,
        border: false,
        modelValidation: true,
        scrollable: 'y',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
            {
                xtype: 'tagfield',
                fieldLabel: Bigmedia.Locales.discountBuilder.selSuppliersLabel,
                allowBlank: false,
                displayField: 'name',
                valueField: 'id',
                queryMode: 'local',
                filterPickList: true,
                bind: {
                    value: '{theRule.suppliers}',
                    store: '{lookupSuppliers}'
                }
            }, {
                xtype: 'tagfield',
                fieldLabel: Bigmedia.Locales.discountBuilder.selCitiesLabel,
                displayField: 'name',
                valueField: 'id',
                queryMode: 'local',
                filterPickList: true,
                bind: {
                    value: '{theRule.cities}',
                    store: '{lookupCities}'
                }
            }, {
                xtype: 'tagfield',
                fieldLabel: Bigmedia.Locales.discountBuilder.selSizesLabel,
                displayField: 'name',
                valueField: 'id',
                queryMode: 'local',
                filterPickList: true,
                bind: {
                    value: '{theRule.sizes}',
                    store: '{lookupSizes}'
                }
            }, {
                xtype: 'tagfield',
                fieldLabel: Bigmedia.Locales.discountBuilder.selTypesLabel,
                displayField: 'name',
                valueField: 'id',
                queryMode: 'local',
                filterPickList: true,
                bind: {
                    value: '{theRule.sidetypes}',
                    store: '{lookupSidetypes}'
                }
            }, {
                xtype: 'combobox',
                // store: 'DiscountTypes',
                fieldLabel: Bigmedia.Locales.discountBuilder.discountTypeLabel,
                displayField: 'name',
                valueField: 'id',
                queryMode: 'local',
                allowBlank: false,
                bind: {
                    value: '{theRule.type}',
                    store: '{lookupTypes}'
                }
            }, {
                xtype: 'numberfield',
                fieldLabel: Bigmedia.Locales.discountBuilder.discountValueLabel,
                allowBlank: false,
                bind: {
                    value: '{theRule.value}'
                }
            }, {
                xtype: 'combobox',
                // store: 'DiscountTypes',
                fieldLabel: 'Тип націнки/маржа',
                displayField: 'name',
                valueField: 'id',
                queryMode: 'local',
                allowBlank: true,
                bind: {
                    value: '{theRule.marginType}',
                    store: '{lookupMarginType}'
                }
            }, {
                xtype: 'numberfield',
                fieldLabel: 'Значення націнки/маржі',
                allowBlank: true,
                bind: {
                    value: '{theRule.marginValue}'
                }
            }, {
                xtype: 'combobox',
                // store: 'DiscountTypes',
                fieldLabel: 'Тип округлення',
                displayField: 'name',
                valueField: 'id',
                queryMode: 'local',
                allowBlank: true,
                bind: {
                    value: '{theRule.marginRoundType}',
                    store: '{lookupMarginRoundType}'
                }
            }
        ]
    },
    buttons: [{
        text: Bigmedia.Locales.btnCancelText,
        handler: 'onCancelClick'
    }, {
        text: Bigmedia.Locales.btnSaveText,
        formBind: true,
        handler: 'onSaveClick'
    }]
});
