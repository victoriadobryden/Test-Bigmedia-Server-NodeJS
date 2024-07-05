Ext.define('Bigmedia.component.AutoPlanSplitOperator', {
  extend: 'Ext.container.Container',
  alias: 'widget.autoplansplitoperator',

  requires: [
  ],

  mixins: [
    'Ext.form.field.Field'
  ],

  controller: {
    bindings: {
      onParamsChange: {
        operator: '{operator}',
        min: '{min}',
        max: '{max}'
      }
    },
    onParamsChange: function (params) {
      var me = this;
      me.getView().setParams(params);
      var cityRec = me.getView().getCityRec();
      if (cityRec) {
        cityRec.set({
          operator: params.operator,
          min: params.min,
          max: params.max
        });
      }
    },
    init: function (view) {
      var me = this;
      me.callParent(view);
      var vm = me.getViewModel();
      vm.set({
        operator: view.getParams() && view.getParams().operator,
        min: view.getParams() && view.getParams().min,
        max: view.getParams() && view.getParams().max,
      })
    }
  },

  config: {
    city: null,
    params: null, // { operators: [], sizes: [], oData: [], sData: []}
    cityRec: null,
    oStore: null,
    removable: true,
    initData: null, // { operator: {value: 'Bigmedia', readOnly: true}, minValue: {value: 25, min: 25}}
    selOperators: []
  },

  updateSelOperators: function (val) {
    if (!val) { return; }
    var me = this,
      vm = me.getViewModel(),
      localOStore = vm.get('operators');
    localOStore.addFilter({
      id: 'filterRemoveSelected',
      filterFn: function (operator) {
        return (val.indexOf(operator.get('name')) < 0) || (operator.get('name') == me.lookup('operator').getValue());
      }
    })
  },

  isValid: function () {
    var me = this,
      operator = me.lookup('operator').getValue(),
      min = me.lookup('min').getValue(),
      max = me.lookup('max').getValue()
    return !!operator && ((min !== null) || (max !== null));
  },

  getValue: function () {
    var me = this;
    return {
      operator: me.lookup('operator').getValue(),
      min: me.lookup('min').getValue(),
      max: me.lookup('max').getValue()
    }
  },

  updateOStore: function (newVal) {
    var localOStore = new Ext.data.ChainedStore({
      source: newVal
    });
    this.getViewModel().set('operators', localOStore);
  },

  updateCity: function (newVal) {
    this.getViewModel().set('city', newVal);
  },

  updateRemovable: function (newVal) {
    this.getViewModel().set('removable', newVal);
  },

  updateInitData: function (newVal) {
    if (!newVal) { return }
    var me = this,
      vm = me.getViewModel();
    vm.set('operatorName', newVal.operator ? newVal.operator.value : null);
    vm.set('operatorReadOnly', newVal.operator ? newVal.operator.readOnly : false);
    vm.set('minValue', newVal.min ? newVal.min.value : null);
    vm.set('minMinValue', newVal.min ? newVal.min.minValue : 0);
    vm.set('maxMinValue', newVal.max ? newVal.max.minValue : 0);
  },

  viewModel: {
    data: {
      city: null,
      operatorName: null,
      operatorReadOnly: false,
      minValue: null,
      minMinValue: 0,
      maxValue: null,
      maxMinValue: 0,
      operators: null,
      removable: true
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
            field.up('autoplansplitoperator').validate();
            if (field.el) {
              field.el.toggleCls('not-empty', value || field.emptyText);
            }
            field.up('autoplansplitoperator').fireEvent('valuechanged');
          }
        }
      },
      items: [
        {
          reference: 'operator',
          xtype: 'combo',
          bind: {
            store: '{operators}',
            value: '{operatorName}',
            readOnly: '{operatorReadOnly}'
          },
          labelStyle: 'z-index: 1',
          fieldLabel: 'Оператор',
          ui: 'plannerfield',
          queryMode: 'local',
          forceSelection: true,
          valueField: 'name',
          grow: true,
          flex: 1,
          displayField: 'name'
        },
        {
          reference: 'min',
          xtype: 'customnumberfield',
          fieldLabel: 'Min',
          labelStyle: 'z-index: 1',
          step: 1,
          ui: 'plannerfield',
          grow: true,
          // minValue: 0,
          maxValue: 100,
          width: 60,
          minWidth: 60,
          margin: '0 0 0 10px',
          bind: {
            value: '{minValue}',
            minValue: '{minMinValue}'
          },
          triggers: {
            percent: {
              cls: 'x-fa fa-percent'
            }
          }
        }, {
          reference: 'max',
          xtype: 'customnumberfield',
          fieldLabel: 'Max',
          labelStyle: 'z-index: 1',
          ui: 'plannerfield',
          margin: '0 0 0 10px',
          grow: true,
          step: 1,
          width: 60,
          minWidth: 60,
          bind: {
            value: '{maxValue}',
            minValue: '{maxMinValue}'
          },
          // minValue: 0,
          maxValue: 100,
          triggers: {
            percent: {
              weight: -1,
              cls: 'x-fa fa-percent'
            }
          }
        }, {
          xtype: 'button',
          iconCls: 'x-fa fa-trash-alt',
          width: 30,
          margin: '0 0 0 10px',
          bind: {
            hidden: '{!removable}'
          },
          handler: function (btn) {
            btn.up('autoplansplitoperator').fireEvent('removeclick', btn.up('autoplansplitoperator'));
          }
        }
      ]
    }
  ]
});
