Ext.define('Bigmedia.view.field.DateRange',{
  extend: 'Ext.panel.Panel',

  xtype: 'customdaterange',

  requires: [
    'Bigmedia.view.field.DateRangeController',
    'Bigmedia.view.field.DateRangeModel',
    'Bigmedia.component.CustomMonthPicker'
  ],

  controller: 'field-daterange',
  viewModel:  {
    type: 'field-daterange'
  },

  config: {
    startDate: null,
    endDate: null,
    hideDaysMode: false,
    hideWholePeriodMode: false,
    hideTwoMonthMode: false,
    wholePeriod: null
  },

  layout: {
    type: 'vbox'
  },

  bodyPadding: 3,

  items: [
    {
      xtype: 'panel',
      layout: {
        type: 'hbox'
      },
      items: [
        {
          xtype: 'panel',
          header: false,
          // title: 'Початок',
          layout: {
            type: 'vbox',
            align: 'stretch'
          },
          items: [
            {
              xtype: 'datefield',
              fieldLabel: 'Початок',
              padding: '0px 3px',
              bind: {
                value: '{period.startDate}'
              }
            },
            {
              xtype: 'datepicker',
              reference: 'startdate',
              bind: {
                hidden: '{!daysmode.checked}',
                value: '{period.startDate}'
              },
              listeners: {
                select: function (picker, date) {
                  picker.lookupViewModel().set('period.startDate', date);
                }
              }
            }, {
              xtype: 'custommonthpicker',
              reference: 'startmonth',
              showButtons: false,
              bind: {
                hidden: '{daysmode.checked}',
                value: '{period.startDate}'
              },
              listeners: {
                select: function (picker, value) {
                  var vm = picker.lookupViewModel(),
                    endDate = vm.get('period.endDate');
                  var newStartDate = new Date(value[1], value[0], 1);
                  if (+newStartDate > endDate) {
                    vm.set('period', {
                      startDate: newStartDate,
                      endDate: new Date(value[1], value[0] + 1, 0)
                    });
                  } else {
                    vm.set('period.startDate', newStartDate);
                  }
                },
                monthdblclick: function (picker, value) {
                  var panel = picker.up('customdaterange'),
                    vm = panel.getViewModel();
                  panel.fireEvent('selectperiod', panel, vm.get('period'));
                }
              }
            }
          ]
        }, 
        {
          xtype: 'panel',
          header: false,
          bind: {
            hidden: '{hideTwoMonthMode}'
          },
          layout: {
            type: 'vbox',
            align: 'stretch'
          },
          defaults: {
            padding: '0px 3px'
          },
          items: [
            {
              xtype: 'datefield',
              fieldLabel: 'Закінчення',
              padding: '0px 3px',
              bind: {
                value: '{period.endDate}'
              }
            }, {
              xtype: 'datepicker',
              reference: 'enddate',
              bind: {
                hidden: '{!daysmode.checked}',
                value: '{period.endDate}'
              },
              listeners: {
                select: function (picker, date) {
                  picker.lookupViewModel().set('period.endDate', date);
                }
              }
            }, {
              xtype: 'custommonthpicker',
              reference: 'endmonth',
              showButtons: false,
              bind: {
                hidden: '{daysmode.checked}',
                value: '{period.endDate}'
              },
              listeners: {
                select: function (picker, value) {
                  var vm = picker.lookupViewModel(),
                    startDate = vm.get('period.startDate');
                  var newEndDate = new Date(value[1], (value[0] + 1), 0);
                  if (+newEndDate < startDate) {
                    vm.set('period', {
                      startDate: new Date(value[1], value[0], 1),
                      endDate: newEndDate
                    });
                  } else {
                    vm.set('period.endDate', newEndDate);
                  }
                },
                monthdblclick: function (picker, value) {
                  var panel = picker.up('customdaterange'),
                    vm = panel.getViewModel();
                  panel.fireEvent('selectperiod', panel, vm.get('period'));
                }
              }
            }
          ]
        }
      ]
    },
    {
      xtype: 'container',
      width: '100%',
      layout: {
        type: 'hbox',
        align: 'stretch'
      },
      items: [
        {
          xtype: 'checkbox',
          boxLabel: 'По днях',
          reference: 'daysmode',
          bind: {
            hidden: '{hideDaysMode}'
          },
          flex: 1
        },
        {
          xtype: 'checkbox',
          boxLabel: 'Без ротації',
          reference: 'wholePeriod',
          bind: {
            value: '{period.wholePeriod}',
            hidden: '{hideWholePeriodMode}'
          //   hidden: '{hideDaysMode}'
          },
          flex: 1
        },
      ]
    }
  ],

  updateHideTwoMonthMode: function (newVal) {
    this.getViewModel().set('hideTwoMonthMode', newVal);
  },

  updateHideWholePeriodMode: function (newVal) {
    this.getViewModel().set('hideWholePeriodMode', newVal);
  },
  updateHideDaysMode: function (newVal) {
    this.getViewModel().set('hideDaysMode', newVal);
  },

  updateStartDate: function (newVal) {
    this.getViewModel().set('period.startDate', newVal);
  },

  updateEndDate: function (newVal) {
    this.getViewModel().set('period.endDate', newVal);
  },

  updateWholePeriod: function (newVal) {
    this.getViewModel().set('period.wholePeriod', newVal);
  },

  updatePeriod: function (period) {
    // console.log('updatePeriod: %o', period);
    this.getViewModel().set('period', period);
  }
});
