Ext.define('Bigmedia.view.dialog.DlgImportRules', {
  extend: 'Ext.window.Window',
  xtype: 'dlgimportrules',

  title: Bigmedia.Locales.discountBuilder.dlgImportRulesTitle,

  layout: 'fit',
  modal: true,
  width: 600,
  height: 420,
  resizable: true,
  closable: true,

  viewModel: {
      data: {
          rulesselected: false
      }
  },

  selectedObj: {},

  buttons: [
    { text: Bigmedia.Locales.btnCancelText, handler: 'onImportRulesCancelClick'},
    {
      text: Bigmedia.Locales.btnImportText,
      bind: {
        disabled: '{(!importRulesGrid.selection) && (!rulesselected)}'
      },
      handler: 'onImportRulesImportClick'
    }
  ],

  items: [
    {
    xtype: 'grid',
    reference: 'importRulesGrid',
    bind: {
      store: '{groupsForImport}'
    },
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
            selModel: {
              type: 'checkboxmodel',
              checkOnly: true
            },
            autoLoad: true,
            // multiSelect: true,
            bind: {
              store: '{record.rules}',
              title: Bigmedia.Locales.discountBuilder.rulesForTitle + '{record.name}'
            },
            columns: [
              { text: Bigmedia.Locales.discountBuilder.colCondition,  dataIndex: 'conditionText', flex: 1},
              // { text: 'Type', dataIndex: 'ruleType', flex: 1 },
              { text: Bigmedia.Locales.discountBuilder.colValue, dataIndex: 'valueText', width: 80 }
          ],
            listeners: {
                select: function (grid, record) {
                    var win = this.up('window'),
                        vm = win.getViewModel();
                    win.selectedObj[record.getId()] = record;
                    vm.set('rulesselected', Object.keys(win.selectedObj).length > 0);
                },
                deselect: function (grid, record) {
                    var win = this.up('window'),
                        vm = win.getViewModel();
                    delete win.selectedObj[record.getId()];
                    vm.set('rulesselected', Object.keys(win.selectedObj).length > 0);
                }
                // selectionchange: function (grid, selection) {
                //     console.log([this.lookupViewModel().get('rulesselected'), selection]);
                //     this.lookupViewModel().set('rulesselected', this.lookupViewModel().get('rulesselected') || (selection.length > 0));
                // }
            }
          }
        }
    },
    // store: {
    //   model: 'RulesGroup',
    //   proxy: {
    //     type: 'memory'
    //   },
    //   autoLoad: true,
    //   autoSync: true
    // },

    columns: [
      {
        text: Bigmedia.Locales.discountBuilder.colGroupName,
        dataIndex: 'name',
        flex: 1
        // editor: {
        //   completeOnEnter: true,
        //   field: {
        //     xtype: 'textfield',
        //     allowBlank: false
        //   }
        // }
      }
    ]
  }]
});
