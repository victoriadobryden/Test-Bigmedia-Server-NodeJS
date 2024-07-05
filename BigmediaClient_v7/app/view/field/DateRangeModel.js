Ext.define('Bigmedia.view.field.DateRangeModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.field-daterange',
    data: {
        name: 'Bigmedia',
        period: {
          startDate: null,
          endDate: null
        },
        hideDaysMode: false,
        hideWholePeriodMode: false,
        hideTwoMonthMode: false
    }

});
