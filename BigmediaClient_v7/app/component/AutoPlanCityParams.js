Ext.define('Bigmedia.component.AutoPlanCityParams', {
  extend: 'Ext.container.Container',
  alias: 'widget.autoplancityparams',

  requires: [
    'Bigmedia.component.AutoPlanCityParamsController'
  ],

  controller: 'autoplancityparams',

  config: {
    city: null,
    params: null, // { operators: [], sizes: [], oData: [], sData: []}
    cityRec: null,
    hideParams: false
  },

  updateCity: function (newVal) {
    this.getViewModel().set('city', newVal);
  },

  updateCityRec: function (newVal) {
    this.getViewModel().set('cityRec', newVal);
  },

  updateHideParams: function (newVal) {
    this.getViewModel().set('hideParams', newVal);
  },

  // bind: {
  //   title: '{city}'
  // },
  //
  // tools: [],

  viewModel: {
    data: {
      city: null,
      budget: null,
      count: null,
      coverage: null,
      hasSplits: false,
      cityRec: null,
      hideParams: false
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
        align: 'stretch'
      },
      items: [
        {
          bind: {
            html: '<span style="font-weight: bold; font-size: 12px; line-height: 13px">{city}</span>',
            margin: '10px 0 0 0'
          },
          flex: 1
        },
        {
          xtype: 'button',
          iconCls: 'x-fa fa-sliders-h',
          bind: {
            text: '<div style="margin-top: -4px; font-size: 13px">{hasSplits ? "●": "&nbsp"}</div>',
            hidden: '{hideParams}'
          },
          handler: function () {
            var params = this.up('autoplancityparams'),
              vm = params.getViewModel(),
              city = vm.get('city');
            var dlg = Ext.create('Bigmedia.view.dialog.DlgAutoPlanSplit');
            dlg.setCity(city);
            dlg.setParams(params.getParams());
            dlg.on('saveclick', params.getController().onSaveSplitsClick, params.getController());
            dlg.show();
          }
        }
      ]
    },
    {
      layout: {
        type: 'hbox',
        align: 'stretch'
      },
      defaults: {
        labelAlign: 'top',
        hideTrigger: false,
        allowDecimals: false
      },
      items: [
        {
          xtype: 'customnumberfield',
          fieldLabel: 'Бюджет',
          labelStyle: 'z-index: 1',
          step: 1000,
          ui: 'plannerfield',
          grow: true,
          flex: 1,
          minValue: 0,
          bind: '{cityRec.budget}',
          triggers: {
            hryvnia: {
              cls: 'x-fa fa-hryvnia'
            }
          }
        }, {
          xtype: 'customnumberfield',
          fieldLabel: 'К-ть щитів',
          labelStyle: 'z-index: 1',
          ui: 'plannerfield',
          padding: '0 0 0 10px',
          grow: true,
          step: 1,
          width: 100,
          bind: '{cityRec.quantity}',
          minValue: 1,
          maxValue: 999
        }, {
          xtype: 'customnumberfield',
          fieldLabel: 'Охоплення',
          labelStyle: 'z-index: 1',
          ui: 'plannerfield',
          padding: '0 0 0 10px',
          grow: true,
          step: 1,
          width: 100,
          bind: '{cityRec.coverage}',
          minValue: 1,
          maxValue: 100,
          triggers: {
            percent: {
              weight: -1,
              cls: 'x-fa fa-percent'
            }
          }
        }
      ]
    }
  ]
});
