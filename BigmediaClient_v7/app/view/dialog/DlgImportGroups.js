Ext.define('Bigmedia.view.dialog.DlgImportGroups', {
  extend: 'Ext.window.Window',
  xtype: 'dlgimportgroups',

  title: Bigmedia.Locales.discountBuilder.dlgImportGroupsTitle,

  layout: 'fit',
  modal: true,
  width: 600,
  height: 420,
  resizable: true,
  closable: true,

  buttons: [
    { text: Bigmedia.Locales.btnCancelText, handler: 'onImportGroupsCancelClick'},
    {
      text: Bigmedia.Locales.btnImportText,
      bind: {
        disabled: '{!importGroupGrid.selection}'
      },
      handler: 'onImportGroupsImportClick'
    }
  ],

  items: [
    {
    xtype: 'grid',
    reference: 'importGroupGrid',
    selModel: {
      type: 'checkboxmodel',
      checkOnly: true
    },
    plugins: {
        cellediting: {
            clicksToEdit: 1
        },
        rowwidget: {
          widget: {
            xtype: 'grid',
            autoLoad: true,
            // tools: [{
            //   type: 'refresh'
            // }, {
            //   type: 'help'
            // }],
            bind: {
              store: '{record.rules}',
              title: Bigmedia.Locales.discountBuilder.rulesForTitle + '{record.name}'
            },
            columns: [
              { text: Bigmedia.Locales.discountBuilder.colCondition,  dataIndex: 'conditionText', flex: 1},
              // { text: 'Type', dataIndex: 'ruleType', flex: 1 },
              { text: Bigmedia.Locales.discountBuilder.colValue, dataIndex: 'valueText', width: 80 }
            ]
          }
        }
    },
    store: {
      model: 'RulesGroup',
      proxy: {
        type: 'memory'
      },
      autoLoad: true,
      autoSync: true
    },
    tbar: [
      '->', {
        xtype: 'fileuploadfield', // Same as filefield above
        buttonOnly: true,
        hideLabel: true,
        listeners: {
            change: 'uploadFileChange'
        }
      }
    ],
    columns: [
      {
        text: Bigmedia.Locales.discountBuilder.colGroupName,
        dataIndex: 'name',
        flex: 1,
        editor: {
          completeOnEnter: true,
          field: {
            xtype: 'textfield',
            allowBlank: false
          }
        }
      }
    ]
  }]
});
