Ext.define('Bigmedia.component.AutoPlanSplitSize', {
  extend: 'Ext.container.Container',
  alias: 'widget.autoplansplitsize',

  requires: [
  ],

  mixins: [
    'Ext.form.field.Field'
  ],

  controller: {
    bindings: {
      onParamsChange: {
        size: '{size}',
        count: '{count}'
      }
    },
    onParamsChange: function (params) {
      var me = this;
      me.getView().setParams(params);
      var cityRec = me.getView().getCityRec();
      if (cityRec) {
        cityRec.set({
          size: params.size,
          count: params.count
        });
      }
    },
    init: function (view) {
      var me = this;
      me.callParent(view);
      var vm = me.getViewModel();
      // console.log(view.getParams());
      // vm.set({
      //   size: view.getParams() && view.getParams().size,
      //   count: view.getParams() && view.getParams().count
      // })
    }
  },

  config: {
    city: null,
    params: null, // { sizes: [], sizes: [], oData: [], sData: []}
    cityRec: null,
    sStore: null,
    removable: true,
    initData: null, // { size: size, count: count}
    selSizes: []
  },

  updateSelSizes: function (val) {
    if (!val) { return; }
    var me = this,
      vm = me.getViewModel(),
      localSStore = vm.get('sizes');
    localSStore.addFilter({
      id: 'filterRemoveSelected',
      filterFn: function (size) {
        return (val.indexOf(size.get('name')) < 0) || (size.get('name') == me.lookup('size').getValue());
      }
    })
  },

  isValid: function () {
    var me = this,
      size = me.lookup('size').getValue(),
      count = me.lookup('countfield').getValue();
    return !!size && (count !== null);
  },

  getValue: function () {
    var me = this;
    return {
      size: me.lookup('size').getValue(),
      count: me.lookup('countfield').getValue()
    }
  },

  updateSStore: function (newVal) {
    var localSStore = new Ext.data.ChainedStore({
      source: newVal
    });
    this.getViewModel().set('sizes', localSStore);
  },

  updateCity: function (newVal) {
    this.getViewModel().set('city', newVal);
  },

  updateInitData: function (newVal) {
    if (!newVal) { return }
    var me = this,
      vm = me.getViewModel();
    vm.set('sizeName', newVal.size);
    vm.set('count', newVal.count);
  },

  viewModel: {
    data: {
      city: null,
      sizeName: null,
      count: null,
      sizes: null
    }
  },
  layout: 'anchor',

  defaults: {
    anchor: '100%'
  },

  margin: '20px 0 10px 0',
  items: [
    {
      layout: {
        type: 'hbox',
        align: 'stretchmax'
      },
      defaults: {
        labelAlign: 'top',
        hideTrigger: false,
        allowDecimals: false,
        minWidth: 30,
        listeners: {
          change: function (field, value) {
            field.up('autoplansplitsize').validate();
            if (field.el) {
              field.el.toggleCls('not-empty', value || field.emptyText);
            }
            field.up('autoplansplitsize').fireEvent('valuechanged');
          }
        }
      },
      items: [
        {
          reference: 'size',
          xtype: 'combo',
          bind: {
            store: '{sizes}',
            value: '{sizeName}'
          },
          labelStyle: 'z-index: 1',
          fieldLabel: 'Розмір',
          ui: 'plannerfield',
          queryMode: 'local',
          forceSelection: true,
          valueField: 'name',
          grow: true,
          flex: 1,
          displayField: 'name'
        },
        {
          reference: 'countfield',
          xtype: 'customnumberfield',
          fieldLabel: 'Кількість',
          labelStyle: 'z-index: 1',
          step: 1,
          ui: 'plannerfield',
          grow: true,
          minValue: 0,
          // maxValue: 100,
          width: 60,
          minWidth: 60,
          margin: '0 0 0 10px',
          bind: {
            value: '{count}',
            maxValue: '{size.selection.maxValue}'
          },
          triggers: {
            // percent: {
            //   cls: 'x-fa fa-percent'
            // }
          }
        }, {
          xtype: 'button',
          iconCls: 'x-fa fa-trash-alt',
          width: 30,
          margin: '0 0 0 10px',
          handler: function (btn) {
            btn.up('autoplansplitsize').fireEvent('removeclick', btn.up('autoplansplitsize'));
          }
        }
      ]
    }
  ]
});
