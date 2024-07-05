Ext.define("Bigmedia.view.grid.DiscountRules", {
    extend: "Ext.grid.Panel",

    requires: [
        'Bigmedia.view.grid.ReplacesController'
    ],

    // controller: 'grid-replaces',

    xtype: 'rules-grid',

    // plugins: {
    //     gridfilters: true
    // },

    // bufferedRenderer: false,
    columnLines: true,
    padding: '0 20 0 0',
    bodyPadding: 0,
    margin: 0,
    // referenceHolder: true,
    split: false,
    // stateful: true,
    // forceFit: true,
    // trackMouseOver: false,

    // viewModel: {
    //     data: {
    //         hiddenToolBar: false,
    //         hiddenStatusBar: false,
    //         visiblePrice: false
    //     }
    // },

    config: {
        parentGroup: null
    },

    autoLoad: true,
    config: {
        parentGroup: null
    },
    // multiSelect: true,
    // tools: [
    //     {
    //   // type: 'right',
    //   // glyph: 'xf069@FontAwesome',
    //   iconCls: 'x-fa fa-file-import',
    //   style: 'color: white',
    //   tooltip: Bigmedia.Locales.discountBuilder.btnCopyRulesFromTooltip,
    //   callback: 'onImportRulesToolClick'
    // },
    // { xtype: 'container', width: 10},
    // {
    //   // type: 'plus',
    //   iconCls: 'x-fa fa-plus-square',
    //   style: 'color: white',
    //   tooltip: Bigmedia.Locales.discountBuilder.btnAddRuleTooltip,
    //   callback: 'onAddRuleToolClick'
    // }],
    tbar: {
      items: [
        {
          // type: 'plus',
          iconCls: 'x-fa fa-plus-square',
          text: 'Додати знижку',
          tooltip: Bigmedia.Locales.discountBuilder.btnAddRuleTooltip,
          handler: 'onAddRuleToolClick'
        },
        {
          // type: 'right',
          // glyph: 'xf069@FontAwesome',
          iconCls: 'x-fa fa-file-import',
          text: 'Імпорт знижок',
          tooltip: Bigmedia.Locales.discountBuilder.btnCopyRulesFromTooltip,
          handler: 'onImportRulesToolClick'
        }
      ]
    },
    columns: [
      { text: Bigmedia.Locales.discountBuilder.colCondition,  dataIndex: 'conditionText', tdCls: 'tip', flex: 1},
      // { text: 'Type', dataIndex: 'ruleType', flex: 1 },
      { text: Bigmedia.Locales.discountBuilder.colValue, dataIndex: 'valueText', tdCls: 'tip', width: 80 },
      {
        xtype: 'actioncolumn',
        width: 30,
        menuDisabled: true,
        sortable: false,
        hideable: false,
        items: [{
            iconCls: 'x-fa fa-list green',
            tooltip: Bigmedia.Locales.discountBuilder.btnEditRuleTooltip,
            handler: 'onEditRuleActionClick'
        }]
      }, {
        xtype: 'actioncolumn',
        width: 30,
        menuDisabled: true,
        sortable: false,
        hideable: false,
        items: [{
            iconCls: 'x-fa fa-ban red',
            tooltip: Bigmedia.Locales.discountBuilder.btnDeleteRuleTooltip,
            handler: 'onRemoveRuleActionClick'
        }]
      }
  ],
    listeners: {
        render: function (grid) {
            var view = grid.getView();
            grid.tip = Ext.create('Ext.tip.ToolTip', {
                // The overall target element.
                target: view.getId(),
                // Each grid row causes its own separate show and hide.
                delegate: view.itemSelector + ' .tip',
                // Moving within the row should not hide the tip.
                trackMouse: true,
                // Render immediately so that tip.body can be referenced prior to the first show.
                // renderTo: Ext.getBody(),
                listeners: {
                    // Change content dynamically depending on which element triggered the show.
                    beforeshow: function (tip) {
                        var tipGridView = tip.target.component,
                            rec = tipGridView.getRecord(tip.triggerElement);
                        // tip.update(rec.get('address'));
                        tip.update(rec.get('description'));
                    }
                }
            });
        },
        destroy: function (grid) {
            delete grid.tip;
        },
    }
});
