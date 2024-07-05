Ext.define("Bigmedia.view.dialog.DlgSelectCampaign", {
    extend: "Ext.window.Window",

    xtype: 'dlgselectcampaign',

    viewModel: {
      stores: {
        dialogcampaigns: {
          source: 'Campaigns',
          grouper: {
            property: 'timeAgo',
            sortProperty: 'createdAt',
            direction: 'DESC'
          },
          sorters: [{
            property: 'createdAt',
            direction: 'DESC'
          }],
        }
      },
      data: {
          selCamp: null
      }
    },

    config: {
      curCamp: null
    },

    updateCurCamp: function (newVal) {
      var me = this,
        grid = me.lookup('campgrid');
      // if (newVal) {
        grid.setSelection(newVal);
      // }
    },

    width: 700,
    minWidth: 400,
    height: 500,
    minHeight: 380,
    modal: true,
    closable: true,
    title: 'Вибрати кампанію',
    referenceHolder: true,
    layout: 'fit',
    // alwaysOnTop: true,
    bodyPadding: 10,
    // plugins: {
    //     gridfilters: true
    // },
    tbar: [{
        xtype: 'textfield',
        flex: 1,
        name: 'searchCamp',
        emptyText: Bigmedia.Locales.campViewSearchCampEmptyText,
        enableKeyEvents: true,
        listeners: {
            change: function (input, newVal, oldVal) {
                // console.log('change ' + newVal);
                var store = this.up('window').lookup('campgrid').getStore();
                if (input.getValue()) {
                    store.removeFilter('filterName',true);
                    store.addFilter(new Ext.util.Filter({
                        id: 'filterName',
                        filterFn: function(item) {
                            var re = new RegExp(newVal, 'i');
                            return re.test(item.get('name'));
                        }
                    }));
                } else {
                    store.removeFilter('filterName');
                }
            }
        }
    }],
    bbar: [
        '->',
        {
            xtype: 'button',
            text: 'Cancel',
            handler: function () {
                var me = this,
                    win = me.up('window');
                win.close();
            }
        }, {
            xtype: 'button',
            bind: {
                disabled: '{!selCamp}'
            },
            text: 'OK',
            handler: function () {
                var me = this,
                    win = me.up('window'),
                    vm = win.getViewModel();
                win.fireEventArgs('selectcampaign', [vm.get('selCamp')]);
                win.close();
            }
        }
    ],
    items: [
        {
            xtype: 'grid',
            reference: 'campgrid',
            headerBorders: false,
            enableColumnHide: false,
            enableColumnMove: false,
            stateId: 'campsgrid',
            stateful: {
              storeState: false
            },
            selModel: {
                type: 'checkboxmodel',
                mode: 'SINGLE'
            },
            bind: {
                store: '{dialogcampaigns}',
                selection: {
                    bindTo: '{selCamp}'
                }
            },
            features: [{
              ftype: 'grouping',
              collapsible: false,
              enableGroupingMenu: false,
              enableNoGroups: false,
              groupHeaderTpl: 'Створена: {name}'
            }],
            listeners: {
              rowdblclick: function (grid, record) {
                var me = this,
                    win = me.up('window'),
                    vm = win.getViewModel();
                win.fireEventArgs('selectcampaign', [record]);
                win.close();
              }
            },
            hideHeaders: false,
            columns: [
                {
                    text: 'Назва',
                    dataIndex: 'name',
                    menuDisabled: true,
                    flex: 1,
                    filter: {
                        type: 'list',
                        itemDefaults: {
                            emptyText: Bigmedia.Locales.gridColumnStrFilterText
                        }
                    },
                }, {
                  text: 'Період кампанії',
                  sortable: true,
                  dataIndex: 'periodText',
                  menuDisabled: true,
                  width: 120,
                  sorter: {
                    property: 'startDate'
                  }
                //     text: Bigmedia.Locales.colStartDate,
                //     sortable: true,
                //     dataIndex: 'startDate',
                //     groupable: false,
                //     xtype: 'datecolumn',
                //     format: 'd.m.Y',
                //     width: 100
                // }, {
                //     text: Bigmedia.Locales.colEndDate,
                //     sortable: true,
                //     dataIndex: 'endDate',
                //     xtype: 'datecolumn',
                //     format: 'd.m.Y',
                //     groupable: false,
                //     width: 100
                }, {
                  text: 'Менеджер',
                  dataIndex: 'managerName',
                  menuDisabled: true,
                  groupable: false,
                  width: 100
                }, {
                  text: 'Створив',
                  dataIndex: 'owner',
                  menuDisabled: true,
                  groupable: false,
                  width: 100
                }, {
                  text: 'Створена',
                  dataIndex: 'createdAt',
                  menuDisabled: true,
                  xtype: 'datecolumn',
                  format: 'd.m.Y',
                  groupable: false,
                  width: 100
                }, {
                  xtype: 'widgetcolumn',
                  menuDisabled: true,
                  width: 40,
                  widget: {
                    xtype: 'button',
                    width: 20,
                    iconCls: 'x-fa fa-ellipsis-v grid-btn',
                    arrowVisible: false,
                    menuAlign: 'tr-br?',
                    menu: {
                      plain: true,
                      items: [
                        {
                          iconCls: 'x-fa fa-edit',
                          text: 'Змінити назву/період кампанії'
                        },
                        {
                          iconCls: 'x-fa fa-link',
                          text: 'Посилання на презентацію',
                          handler: function (menuitem) {
                            var camp = menuitem.parentMenu.up('button').getWidgetRecord(),
                              dlg = Ext.create('Bigmedia.view.det.DetPublishedCampaign', {

                                campaignId: camp.getId(),
                                publishedId: camp.get('publishedId')
                              });
                            dlg.show();
                          }
                        },
                        {
                          iconCls: 'x-fa fa-copy',
                          text: 'Зробити копію'
                        },
                        {
                          iconCls: 'x-fa fa-trash-alt',
                          text: 'Видалити'
                        }
                      ]
                    }
                  }
                }
            ]
        }
    ]
});
