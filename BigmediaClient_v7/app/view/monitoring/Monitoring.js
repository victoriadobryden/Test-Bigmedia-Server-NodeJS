Ext.define("Bigmedia.view.monitoring.Monitoring", {
  extend: "Ext.grid.Panel",

  requires: [
    'Ext.grid.filters.Filters',
    'Ext.ux.rating.Picker',
    'Ext.window.Toast',
    'Ext.grid.column.Action',
    'Bigmedia.view.map.MapView',
    'Bigmedia.view.det.DetFace',
    'Bigmedia.view.monitoring.MonitoringController'
  ],
  viewModel: {
    data: {
        selection: null,
        //detMonitoring: null,
    }
  },
  config :{
    mapView: null,
    detMonitoring: null,
    //detFace: null,
  },
  controller: 'monitoring-grid-controller',
  // store: store,

  header: false,
  xtype: 'monitoring-grid',
  hideRowBody: true,
  columnLines: true,
  // selType: 'checkboxmodel',
  // selModel: {
  //   type: 'checkboxmodel',
  //   checkOnly: false,
  //   listeners: {
  //     focuschange: function (selModel, oldFocused, newFocused) {
  //       var tView = selModel.view;
  //       if (!newFocused) {
  //         if (oldFocused) {
  //           tView.oldFocused = oldFocused;
  //         }
  //         return;
  //       }
  //       if (oldFocused) {
  //         tView.removeRowCls(oldFocused, 'bm-row-focused');
  //       }
  //       if (tView.oldFocused) {
  //         tView.removeRowCls(tView.oldFocused, 'bm-row-focused');
  //       }
  //       if (newFocused) {
  //         tView.addRowCls(newFocused, 'bm-row-focused');
  //       }
  //     },
  //     // selectionchange: function (selModel, selected) {
  //     //   console.log('checkboxmodel selectionchange')
  //     //   // var store = selModel.getStore(),
  //     //   //     chained = new Ext.data.ChainedStore({source: store,
  //     //   //         filters: [
  //     //   //             function(item) {
  //     //   //                 return item.get('selected');
  //     //   //             }
  //     //   //         ]
  //     //   //     });
  //     //   // var toClear = [];
  //     //   // chained.each(function(rec){
  //     //   //     var search = selected.some(function(item){ return rec===item});
  //     //   //     if (!search || search.length === 0) {
  //     //   //         toClear.push(rec);
  //     //   //     }
  //     //   // });
  //     //   // store.beginUpdate();
  //     //   // toClear.forEach(function(rec){rec.set('selected', false)});
  //     //   // selected.forEach(function(rec){rec.set('selected', true)});
  //     //   // store.endUpdate();
  //     //   // chained.destroy();

  //     //   // if (selected.length > 0) {
  //     //   //   var tView = selModel.view;
  //     //   //   tView.grid.fireEvent('selectionchange');
  //     //   // }
  //     // }
  //   }
  // },
  dockedItems: [
    {
      tbar: {
        items: [
          {
            xtype: 'button',
            iconCls: 'x-fa fa-calendar-alt',
            bind: {
              text: '{curMonitoring.periodText}',
            },
            menu: {
              plain: true,
              allowOtherMenus: true,
              items: [
                {
                  xtype: 'customdaterange',
                  reference: 'daterange',
                  bind: {
                    startDate: '{curMonitoring.startDate}',
                    endDate: '{curMonitoring.endDate}',
                    hideDaysMode: true,
                    hideWholePeriodMode: true,
                    hideTwoMonthMode: true
                  },
                  listeners: {
                    periodchanged: 'onDateRangePeriodChanged',
                    selectperiod: function (range) {
                      range.up('menu').hide();
                    }
                  }
                }
              ]
            }
          },
        ]
      },
    }
  ],
  plugins: {
    gridfilters: true,
  },
  // layout: 'column',
  columns: [
    {
      text: 'Дата моніторінгу',
      sortable: true,
      dataIndex: 'date',
      groupable: false,
      hideable: true,
      draggable: false,
      width: 30,
      filter: 'list',
      hidden: true
    },
    {
      text: 'Constr №',
      sortable: true,
      dataIndex: 'fConstr',
      groupable: false,
      hideable: true,
      draggable: false,
      width: 50,
      //   hidden: true
    },
    {
      text: Bigmedia.Locales.colOriginalNo,
      sortable: true,
      dataIndex: 'supplierNo',
      groupable: false,
      hideable: true,
      hidden: false,
      draggable: false,
      width: 80,
      locked: false,
      filter: {
        type: 'string',
        itemDefaults: {
          emptyText: Bigmedia.Locales.gridColumnStrFilterText
        }
      }
    }, {
      text: Bigmedia.Locales.colCity,
      sortable: true,
      dataIndex: 'city',
      groupable: false,
      width: 120,
      filter: 'list'
    },
    {
      text: Bigmedia.Locales.colAddress,
      sortable: true,
      dataIndex: 'address',
      // flex: 1,
      groupable: false,
      width: 250,
      filter: {
        type: 'string',
        itemDefaults: {
          emptyText: Bigmedia.Locales.gridColumnStrFilterText
        }
      },
      renderer: function (value, metaData) {
        metaData.tdAttr = 'data-qtip="' + Ext.htmlEncode(value) + '"';
        return Ext.htmlEncode(value);
      }
    },
    {
      text: Bigmedia.Locales.colNetwork,
      sortable: true,
      dataIndex: 'constrtype',
      groupable: false,
      width: 100,
      filter: 'list'
    },
    {
      text: Bigmedia.Locales.colSize,
      sortable: true,
      dataIndex: 'sizetype',
      groupable: false,
      width: 100,
      filter: 'list'
    },
    {
      text: 'А/Б',
      sortable: true,
      dataIndex: 'catab',
      groupable: false,
      width: 100,
      filter: 'list',
    },
    {
      text: Bigmedia.Locales.colSupplier,
      sortable: true,
      dataIndex: 'owner',
      groupable: false,
      width: 120,
      filter: 'list',
    },
    {
      text: 'Категорія',
      sortable: true,
      dataIndex: 'advertisingCategory',
      groupable: false,
      width: 100,
      filter: 'list',
    },
    {
      text: 'Brand',
      sortable: true,
      dataIndex: 'brand',
      groupable: false,
      width: 100,
      filter: 'list',
    },
    {
      text: 'Advevents',
      sortable: true,
      dataIndex: 'advevents',
      groupable: false,
      width: 100,
      filter: 'list',
    },
    {
      text: 'Переклад',
      sortable: true,
      dataIndex: 'translate',
      groupable: false,
      width: 100,
      filter: 'list',
      hidden: true,
      bind: {
        disabled: true
      },
    },
    {
      text: 'Пошкодження',
      sortable: true,
      dataIndex: 'damage',
      groupable: false,
      width: 10,
      filter: 'list',
    },
    {
      text: 'примітка',
      sortable: true,
      dataIndex: 'note',
      groupable: false,
      width: 100,
      filter: 'list',
    },
    {
      // text: 'brandId',
      // sortable: true,
      // dataIndex: 'brandId',
      // groupable: false,
      // hidden: true,
      // hideable: false,
      // width: 20,
      header: Bigmedia.Locales.colPhoto,
      dataIndex: 'brandId',
      sortable: false,
      width: 100,
      renderer: function (value) {
        var res = '<div class="poster-monitoring"></div>';
        var url = '/photohub/monitoring/'+value;
        // console.log(url);
        //if (value && value.length > 0) { //&& value.id
        res = '<a href="' + url + '" target="_blank"><div class="poster-monitoring" style="background-image: url(' + url + ')"></div></a>';
        //}
        return res;
      }
      //   filter: 'list',        
    },
    {
      text: 'lon',
      sortable: true,
      dataIndex: 'lon',
      groupable: false,
      width: 20,
      hidden: true,
      hideable: false,
      bind: {
        disabled: true
      },
    },
    {
      text: 'lat',
      sortable: true,
      dataIndex: 'lat',
      groupable: false,
      width: 20,
      hidden: true,
      hideable: false,
      bind: {
        disabled: true
      },
    }
  ],
  listeners: {
    show: 'onGridShow',
    viewready: 'onGridLoad',
    selectionchange: 'grid_selectionchange',
    render: function (grid) {
      var view = grid.getView(),
        me = this,
        view = me.getView(),
        vm = me.getViewModel(),
        curMonitoringId = vm.get('curMonitoring').id,
        dm = Ext.getStore('DataMonitoring');
      view.mask('Data Loading.......');
      dm.load({params: {MonitoringId:encodeURIComponent(curMonitoringId)}});
      view.unmask();
    },
    itemkeydown: function (me, record, item, index, e, eOpts) {
      var sm = me.getSelectionModel();
      // console.log('itemkeydown  ----->', me, record, item, index, e, eOpts)
      // if (e.keyCode === 32 && e.position.colIdx !== 0) {
      //   if (sm.isSelected(record)) {
      //     sm.deselect(record);
      //   } else {
      //     sm.select(record, true);
      //   }
      //   // console.log(e);
      // }
      // console.log([me, record, item, index, e, eOpts]);
    },
    afterrender: function (view) {     
    },
    selectionchange: function (grid, selected) {
      console.log('-------->',grid, selected)
    }
  }
  ,
  grid_selectionchange: function (self, selected) {
    var rec = selected[0];
    
    connsole.log('grid_selectionchange',self, selected,rec);
    // if (rec) {
    //   this.down('#removeButton').setText('Remove ' + rec.get('name'));
    // }
  }
})