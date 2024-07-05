Ext.define('Bigmedia.component.AutoPlanCityParamsController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.autoplancityparams',

  onParamsChange: function (params) {
    var me = this;
    var newParams = Ext.merge(me.getView().getParams(), params);
    me.getView().setParams(newParams);
    // var cityRec = me.getView().getCityRec();
    // if (cityRec) {
    //   cityRec.set({
    //     budget: params.budget,
    //     quantity: params.count,
    //     coverage: params.coverage
    //   });
    // }
  },
  // init: function (view) {
  //   var me = this;
  //   me.callParent(view);
  //   var vm = me.getViewModel();
  //   vm.set({
  //     budget: view.getParams() && view.getParams().budget,
  //     count: view.getParams() && view.getParams().count,
  //     coverage: view.getParams() && view.getParams().coverage,
  //   })
  // },
  onSaveSplitsClick: function (data) {
    var me = this,
      view = me.getView();
    view.getParams().oData = data.oData;
    view.getParams().sData = data.sData;
    me.getViewModel().set('hasSplits', !!data.oData || !!data.sData);
  }
});
