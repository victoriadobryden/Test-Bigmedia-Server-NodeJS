Ext.define("Bigmedia.view.grid.ManagePoi", {
    extend: "Ext.grid.Panel",

    requires: [
        'Bigmedia.view.grid.ManagePoiController',
        "Bigmedia.view.dialog.DlgSelectCampaign",
        'Bigmedia.store.FormatsTree',
        'Bigmedia.view.dialog.DlgLinkFacesToPOISettings'
    ],

    controller: 'grid-managepoi',

    xtype: 'managepoi-grid',

    columnLines: true,
    padding: 0,
    bodyPadding: 0,
    margin: 0,
    referenceHolder: true,
    split: false,
    stateful: true,
    stateId: 'managePoi',
    // forceFit: true,
    viewConfig: {
        cartStore: null,
        trackOver: false,
        stripeRows: true,
        enableTextSelection: false,
        markDirty: true
    },
    trackMouseOver: false,

    viewModel: {
        data: {
            hiddenToolBar: false,
            hiddenStatusBar: false,
            visiblePrice: false
        }
    },

    config: {
        // hideToolBar: false,
        // hideStatusBar: false,
        // showToolbar: false,
        showPrice: true,
        // showAddToCart: true,
        showDelete: true
        // ,
        // showRowStatus: true
    },

    // initComponent: function () {
        // this.callParent();
        // this.enableBubble(['addclick', 'replaceclick', 'sourcechanged']);
    // },

    updateHideToolBar: function (newVal) {
        var me = this;
        me.getViewModel().set('hiddenToolBar', newVal);
    },

    updateHideStatusBar: function (newVal) {
        var me = this;
        me.getViewModel().set('hiddenStatusBar', newVal);
    },

    updateShowPrice: function (newVal) {
        var me = this;
        me.getViewModel().set('visiblePrice', newVal);
    },

    updateShowDelete: function (newVal) {
        var me = this;
        me.getViewModel().set('showDelete', newVal);
    },

    updateShowAddToCart: function (newVal) {
        var me = this;
        me.getViewModel().set('showAddToCart', newVal);
    },

    selModel: {
      type: 'checkboxmodel',
      checkOnly: true
    },
    plugins: {
        cellediting: {
            clicksToEdit: 1
        },
        gridfilters: true
    },
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        reference: 'toolBar',
        bind: {
            hidden: '{!showToolbar}'
        },
        items: [
            {
                xtype: 'button',
                iconCls: 'x-fa fa-map-marker-alt',
                text: 'Додати локації', //TODO
                menu: {
                  plain: true,
                  items: [
                    {
                      // xtype: 'button',
                      reference: 'addpoibtn',
                      text: 'Довідник локацій',
                      listeners: {
                        click: 'onAddPOIClick'
                      }
                    }, {
                      // xtype: 'button',
                      reference: 'addpoimanualbtn',
                      text: 'Власний перелік адрес/координат',
                      // TODO: from campaigns
                      // disabled: true,
                      listeners: {
                        click: 'onAddUserPOIClick'
                      }
                    }, {
                    //   // xtype: 'button',
                    //   reference: 'addpoicampaignbtn',
                    //   text: 'From campaigns',
                    //   // TODO: from campaigns
                    //   disabled: true,
                    //   listeners: {
                    //     click: 'onAddCampaignPOIClick'
                    //   }
                    // }, {
                      // xtype: 'button',
                      text: 'Імпорт файлу',
                      reference: 'addpoifilebtn',
                      listeners: {
                        click: 'onAddFilePOIClick'
                      }
                    }
                  ]
                }
            }, {
                text: 'Змінити іконку', //TODO
                xtype: 'button',
                reference: 'changeiconbtn',
                iconCls: 'x-fa fa-wrench',
                bind: {
                    disabled: '{!poigrid.selection}'
                },
                // disabled: true,
                listeners: {
                    click: 'onChangeIconClick'
                }
            }, {
                xtype: 'splitbutton',
                iconCls: 'x-fa fa-filter',
                enableToggle: true,
                tooltip: 'Відібрати площини',
                bind: {
                  pressed: '{filterPoi}'
                },
                // text: 'Filter',
                // handler: 'onFilter',
                menu: {
                  plain: true,
                  items: [
                    {
                      xtype: 'container',
                      layout: {
                        type: 'vbox',
                        align: 'stretch'
                      },
                      items: [
                        {
                          xtype: 'container',
                          layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'middle'
                          },
                          items:[
                            {
                              xtype: 'slider',
                              fieldLabel: Bigmedia.Locales.mapViewBufferText,
                              padding: 10,
                              width: 350,
                              // value: 500,
                              bind: '{buffer}',
                              increment: 10,
                              minValue: 0,
                              maxValue: 1500
                              // ,
                              // listeners: {
                                //     changecomplete: 'onBufferChanged'
                                // }
                            }, {
                              xtype: 'numberfield',
                              width: 50,
                              minValue: 0,
                              maxValue: 1500,
                              step: 100,
                              value: 500,
                              hideTrigger: true,
                              bind: '{buffer}'
                            }, {
                              xtype: 'checkbox',
                              // width: 50,
                              hideLabel: true,
                              bind: {
                                // hidden:
                                // {
                                  //   bindTo: '{!user.showPlanner}',
                                  //   deep: true
                                  // },
                                value: '{beforepoi}'
                              },
                              padding: 10,
                              boxLabel: 'перед об\'єктом'
                            }
                          ]
                        },
                        // TODO settings button
                        {
                          xtype: 'button',
                          iconCls: 'x-fa fa-cogs',
                          text: 'Налаштувати критерії відбору площин',
                          handler: function (btn) {
                            var dlg = Ext.getCmp('dlglinkfacestopoisettings');
                            dlg.show();
                          }
                        }
                      ]
                    }
                  ]
                }
            }
            // , {
            //    xtype: 'fileuploadfield', // Same as filefield above
            //    buttonOnly: true,
            //    // hideLabel: true,
            //    label: 'From file',
            //    listeners: {
            //        change: 'uploadFileChange'
            //    }
            // }
            , '->',
            {
                xtype: 'button',
                text: 'Зберегти',
                iconCls: 'x-fa fa-download',
                // menu: [
                    // {
                    //     text: 'To campaign',
                    //     handler: 'onSaveToCampaignClick',
                    //     bind: {
                    //         disabled: '{!poigrid.selection}'
                    //     }
                    // }, {
                        // text: 'В файл',
                        handler: 'onSaveToFileClick',
                        bind: {
                            disabled: '{!poigrid.selection}'
                        }
                    // }
                // ]
            }, {
                text: 'Видалити', //TODO
                xtype: 'button',
                reference: 'clearpoibtn',
                iconCls: 'x-fa fa-trash',
                bind: {
                    disabled: '{!poigrid.selection}'
                },
                // disabled: true,
                listeners: {
                    click: 'onRemovePOIClick'
                }
            }
            // {
            //     xtype: 'slider',
            //     fieldLabel: 'Radius',
            //     labelWidth: 80,
            //     bind: {
            //         value: '{replaceRadius}'
            //     },
            //     minValue: 10,
            //     maxValue: 2000,
            //     width: 400,
            //     useTips: true,
            //     tipText: function(thumb){
            //         return thumb.value < 1000 ? thumb.value + ' m' : Math.round(thumb.value / 1000 * 100) / 100 + ' km';
            //     },
            //     listeners: {
            //         changecomplete: 'onRadiusChange'
            //     }
            // }
        ]
    }],

    // title: Bigmedia.Locales.facesTitle,
    header: false,

    columns: [
        {
            text: 'POI name',
            tdCls: 'tip',
            sortable: true,
            dataIndex: 'name',
            groupable: false,
            hideable: false,
            draggable: false,
            width: 120,
            filter: {
                type: 'string',
                itemDefaults: {
                    emptyText: Bigmedia.Locales.gridColumnStrFilterText
                }
            },
            editor: {
              completeOnEnter: true,
              field: {
                xtype: 'textfield',
                allowBlank: false
              }
            }
        },{
            text: 'POI category',
            tdCls: 'tip',
            sortable: true,
            dataIndex: 'category',
            groupable: true,
            hideable: true,
            draggable: true,
            width: 120,
            filter: {
                type: 'list'
            }
            // ,
            // editor: {
            //   completeOnEnter: true,
            //   field: {
            //     xtype: 'treepicker',
            //     store: 'PoiCategoriesTree',
            //     // queryMode: 'local',
            //     displayField: 'name',
            //     // valueField: 'id',
            //     allowBlank: true
            //   }
            // }
        },{
            text: 'City',
            tdCls: 'tip',
            sortable: true,
            dataIndex: 'city',
            groupable: false,
            hideable: true,
            hidden: false,
            draggable: false,
            width: 80,
            filter: {
                type: 'string',
                itemDefaults: {
                    emptyText: Bigmedia.Locales.gridColumnStrFilterText
                }
            },
            editor: {
              completeOnEnter: true,
              field: {
                xtype: 'textfield',
                allowBlank: false
              }
            }
        }, {
            text: Bigmedia.Locales.colAddress,
            tdCls: 'tip',
            sortable: true,
            dataIndex: 'address',
            flex: 1,
            groupable: false,
            width: 250,
            filter: {
                type: 'string',
                itemDefaults: {
                    emptyText: Bigmedia.Locales.gridColumnStrFilterText
                }
            },
            editor: {
              completeOnEnter: true,
              field: {
                xtype: 'textfield',
                allowBlank: false
              }
            }
        }, {
            text: 'House number',
            tdCls: 'tip',
            sortable: true,
            dataIndex: 'housenumber',
            groupable: false,
            width: 100,
            filter: {
                type: 'string',
                itemDefaults: {
                    emptyText: Bigmedia.Locales.gridColumnStrFilterText
                }
            },
            editor: {
              completeOnEnter: true,
              field: {
                xtype: 'textfield',
                allowBlank: false
              }
            }
        }, {
            // xtype: 'treecolumn',
            text: 'Icon',
            dataIndex: 'iconPath',
            width: 80,
            renderer: function (value) {
                return value ? '<img src="' + value + '">' : '';
            }
        }
        // , {
        //     text: 'Lon',
        //     tdCls: 'tip',
        //     hidden: true,
        //     sortable: false,
        //     dataIndex: 'lon',
        //     groupable: false,
        //     width: 80
        // }, {
        //     text: 'Lat',
        //     tdCls: 'tip',
        //     hidden: true,
        //     sortable: false,
        //     dataIndex: 'lat',
        //     groupable: false,
        //     width: 80
        // }
        // // {
        // //     text: Bigmedia.Locales.colLight,
        // //     sortable: true,
        // //     dataIndex: 'light',
        // //     groupable: false,
        // //     width: 40,
        // //     filter: 'list',
        // //     align: 'center',
        // //     width: 40,
        // //     renderer: function(value) {
        // //         var res = '';
        // //         switch (value) {
        // //             case '+':
        // //                 res = '<span class="x-fa fa-lightbulb-o" style="color: #ffd633"></span>';
        // //                 break;
        // //             case 'off':
        // //                 res = '<span class="x-fa fa-lightbulb-o" style="color: #8c8c8c"></span>';
        // //                 break;
        // //         }
        // //         return res;
        // //     }
        // // },
        // // {
        // //     text: Bigmedia.Locales.colNetwork,
        // //     sortable: true,
        // //     dataIndex: 'network',
        // //     groupable: false,
        // //     width: 100,
        // //     filter: 'list'
        // // },
        // // {
        // //     text: Bigmedia.Locales.colZone,
        // //     sortable: true,
        // //     dataIndex: 'zone',
        // //     groupable: false,
        // //     width: 90,
        // //     filter: 'list'
        // // }
        // // , {
        // //     text: Bigmedia.Locales.colRating,
        // //     sortable: true,
        // //     dataIndex: 'rating',
        // //     xtype: 'widgetcolumn',
        // //     widget: {
        // //         xtype: 'rating',
        // //         trackOver: false,
        // //         disabled: true
        // //         //,
        // //         //listeners: {
        // //         //    beforechange: function(){ return false;}
        // //         //}
        // //     },
        // //     groupable: false,
        // //     width: 90,
        // //     filter: 'list'
        // // }
        // ,
        // {
        //     xtype:'actioncolumn',
        //     width:70,
        //     items: [{
        //         iconCls: 'x-fa fa-retweet',
        //         bind: {
        //             disabled: '{!replaceFaceId}'
        //         },
        //         tooltip: 'Replace',
        //         handler: 'onReplaceClick'
        //         // function(tableView, rowIndex, colIndex) {
        //         //     var rec = tableView.getStore().getAt(rowIndex),
        //         //         cartStore = tableView.lookupViewModel().get('cartStore'),
        //         //         replaceFaceId = tableView.lookupViewModel().get('replaceFaceId');
        //         //     if (cartStore) {
        //         //         var faceToRemove = cartStore.getById(replaceFaceId);
        //         //         if (faceToRemove) {
        //         //             cartStore.remove(faceToRemove);
        //         //             cartStore.add(rec);
        //         //         }
        //         //     }
        //         // }
        //     },
        //     { xtype: 'tbspacer' }, {
        //         iconCls: 'x-fa fa-plus',
        //         tooltip: 'Add',
        //         handler: 'onAddClick'
        //         // function(tableView, rowIndex, colIndex) {
        //         //     var rec = tableView.getStore().getAt(rowIndex);
        //         //     var cartStore = tableView.lookupViewModel().get('cartStore');
        //         //     if (cartStore) {
        //         //         cartStore.add(rec);
        //         //     }
        //         // }
        //     }]
        // }
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
                        tip.update(rec.get('name') + ' ' + (rec.get('city') ? '(' + rec.get('city') + ') ' : '') + (rec.get('address') || '') + (rec.get('housenumber') ? ', ' + rec.get('housenumber') : ''));
                    }
                }
            });
        },
        destroy: function (grid) {
            delete grid.tip;
        },
        reconfigure: function (grid, store, columns, oldStore, oldColumns) {
        },
        selectionchange: function (grid, selected) {
            var store = grid.getStore(),
                filters = store.getFilters();
        }
    }
});
