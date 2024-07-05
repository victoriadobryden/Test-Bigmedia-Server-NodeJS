Ext.define('Bigmedia.view.field.DateRangeController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.field-daterange',

  bindings: {
    // onStartDateChanged: '{startDate}',
    // onEndDateChanged: '{endDate}'
    onPeriodChanged: {
      bindTo: '{period}',
      deep: true
    }
  },

  onPeriodChanged: function (val, old) {
    // console.log('onPeriodChanged: %o', val);
    if (old && val.startDate && val.endDate) {
      this.getView().fireEventArgs('periodchanged', [val]);
    }
  },

  onStartDateChanged: function (val, old) {
    var me = this,
      vm = me.getViewModel();
    if (old && vm.get('endDate')) {
      // me.getView().setStartDate(val);
      // me.getView().fireEventArgs('periodchanged', [{startDate: vm.get('startDate'), endDate: vm.get('endDate')}]);
    }
  },

  onEndDateChanged: function (val, old) {
    var me = this,
      vm = me.getViewModel();
    if (old && vm.get('startDate')) {
      // me.getView().setEndDate(val);
      // me.getView().fireEventArgs('periodchanged', [{startDate: vm.get('startDate'), endDate: vm.get('endDate')}]);
    }
  }
});
