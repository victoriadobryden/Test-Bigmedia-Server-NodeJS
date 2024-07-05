Ext.define('Bigmedia.view.dialog.DlgEditRulesGroups',{
    extend: 'Ext.window.Window',
    xtype: 'editgroupsdialog',
    requires: [
        'Bigmedia.view.dialog.DlgEditRulesGroupsController',
        'Bigmedia.view.dialog.DlgEditRulesGroupsModel',
        "Bigmedia.view.grid.DiscountRules"
    ],

    controller: 'dialog-dlgeditrulesgroups',
    viewModel: {
        type: 'dialog-dlgeditrulesgroups'
    },

    title: Bigmedia.Locales.discountBuilder.dlgEditGroupsTitle,

  layout: 'fit',
  modal: true,
  width: 700,
  height: 520,
  resizable: true,
  closable: true,

  items: {
    xtype: 'grid',
    reference: 'groupGrid',
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
              xtype: 'rules-grid',
              bind: {
                  store: '{record.rules}',
                  parentGroup: '{record}',
                  title: Bigmedia.Locales.discountBuilder.rulesForTitle + '{record.name}'
                }
              // xtype: 'grid',
          //   autoLoad: true,
          //   config: {
          //       parentGroup: null
          //   },
          //   updateParentGroup: function (newVal) {
          //       console.log(newVal);
          //   },
          //   // multiSelect: true,
          //   tools: [
          //       {
          //     type: 'down',
          //     callback: 'onImportRulesToolClick'
          //   },
          //   {
          //     type: 'plus',
          //     callback: 'onAddRuleToolClick'
          //   }],
          //   bind: {
          //     store: '{record.rules}',
          //     parentGroup: '{record}',
          //     title: 'Rules for {record.name}'
          //   },
          //   columns: [
          //     { text: 'Condition',  dataIndex: 'conditionText', tdCls: 'tip', flex: 1},
          //     // { text: 'Type', dataIndex: 'ruleType', flex: 1 },
          //     { text: 'Value', dataIndex: 'valueText', tdCls: 'tip', width: 80 },
          //     {
          //       xtype: 'actioncolumn',
          //       width: 30,
          //       menuDisabled: true,
          //       sortable: false,
          //       hideable: false,
          //       items: [{
          //           iconCls: 'x-fa fa-list green',
          //           tooltip: 'Edit',
          //           handler: 'onEditRuleActionClick'
          //       }]
          //     }, {
          //       xtype: 'actioncolumn',
          //       width: 30,
          //       menuDisabled: true,
          //       sortable: false,
          //       hideable: false,
          //       items: [{
          //           iconCls: 'x-fa fa-ban red',
          //           tooltip: 'Delete',
          //           handler: 'onRemoveRuleActionClick'
          //       }]
          //     }
          // ],
          //   listeners: {
          //       render: function (grid) {
          //           var view = grid.getView();
          //           grid.tip = Ext.create('Ext.tip.ToolTip', {
          //               // The overall target element.
          //               target: view.getId(),
          //               // Each grid row causes its own separate show and hide.
          //               delegate: view.itemSelector + ' .tip',
          //               // Moving within the row should not hide the tip.
          //               trackMouse: true,
          //               // Render immediately so that tip.body can be referenced prior to the first show.
          //               // renderTo: Ext.getBody(),
          //               listeners: {
          //                   // Change content dynamically depending on which element triggered the show.
          //                   beforeshow: function (tip) {
          //                       var tipGridView = tip.target.component,
          //                           rec = tipGridView.getRecord(tip.triggerElement);
          //                       // tip.update(rec.get('address'));
          //                       tip.update(rec.get('description'));
          //                   }
          //               }
          //           });
          //       },
          //       destroy: function (grid) {
          //           delete grid.tip;
          //       },
          //   }
          }
        }
    },
    store: 'RulesGroups',
    // bind: {
    //   store: '{groups}',
    // },
    tbar: [
      {
        text: Bigmedia.Locales.discountBuilder.addGroupText,
        handler: 'onAddGroupClick'
      }, '->', {
        text: Bigmedia.Locales.discountBuilder.importGroupsText,
        handler: 'onImportClick'
      }, {
        text: Bigmedia.Locales.discountBuilder.saveToFileText,
        handler: 'onSaveToFileClick',
        bind: {
            disabled: '{!groupGrid.selection}'
        }
    }],
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
      }, {
          xtype: 'widgetcolumn',
          width: 90,
          widget: {
              xtype: 'button',
              text: Bigmedia.Locales.discountBuilder.btnDeleteText,
              handler: 'onRemoveGroupClick'
          }
      }
    ]
  }
});
