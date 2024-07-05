Ext.define("Bigmedia.view.grid.Faces", {
    extend: "Ext.grid.Panel",

    // id: 'gridFaces',

    requires: [
        // 'Bigmedia.store.Faces',
        'Ext.grid.filters.Filters',
        'Bigmedia.view.grid.FacesModel',
        // 'OccupancyStateWidget',
        'Ext.ux.statusbar.StatusBar',
        // "Bigmedia.view.det.DetFace",
        "Bigmedia.view.grid.FacesController",
        'Ext.ux.rating.Picker',
        // 'Bigmedia.store.Faces',
        'Ext.window.Toast',
        // 'Bigmedia.view.chart.Reach',
        // 'Ext.chart.CartesianChart',
        'Ext.grid.column.Action'
        //,
        //'GeoExt.selection.FeatureModel'
    ],

    controller: 'grid-faces',

    // focusableContainer: true,
    // plugins: 'gridfilters',

    features: [{
        ftype: 'rowbody',
        getAdditionalData: function (data, idx, record, orig) {
            // if (! this.grid.getShowRowStatus()) {
                //     return null;
                // }
                if (this.view.isLockedView || this.grid.ownerGrid.hideRowBody || !record.get('parsedOccupancy')) {
                    return null;
                }
                // console.log([this, data, idx, record, orig]);
                // Usually you would style the my-body-class in a CSS file
                var parsedOccupancy = record.get('parsedOccupancy');
                // console.log(parsedOccupancy);
                var totalDays = parsedOccupancy.reduce(function(sum,cur){ return sum + cur.actualDays},0);
                var htmlOccupancy = (parsedOccupancy && parsedOccupancy.length > 0) ? parsedOccupancy.map(function(month){
                    var tmp = '<span class="tableRow_month" style="width: ' + Math.round(month.actualDays * 1000000 / totalDays ) / 10000 +'%;">';
                    month.periods.forEach(function(period){
                        tmp += '<span class="month_line month_line-' + period.status + '" style="width: ' + Math.round( period.days * 1000000 / month.actualDays ) / 10000 + '%;" data-qtip="' + Ext.Date.getShortMonthName(month.month) + '`' + month.year.toString().slice(-2) + ' - '+ Bigmedia.Locales.occupancyTooltip[period.status] + '"></span>';
                    });
                    // tmp += '<div class="date_name">'+Ext.Date.getShortMonthName(month.month) + '`' + month.year.toString().slice(-2) + '</div>';
                    tmp += '</span>';
                    return tmp;
                }) : [];
                var maskBefore='', maskAfter='';
                // var fltrs = this.grid.getSource.getFilters();
                if (record.get('startDate') || record.get('endDate')) {
                    var days, months, i, width;
                    if (record.get('startDate') && +record.get('startDate') >= Date.UTC(parsedOccupancy[0].year,parsedOccupancy[0].month,parsedOccupancy[0].day)) {
                        maskBefore = '<div id="before" class="mask_opaque" style="width: calc(';
                        days = Ext.Date.diff(new Date(Date.UTC(parsedOccupancy[0].year,parsedOccupancy[0].month,parsedOccupancy[0].day)), record.get('startDate'), Ext.Date.DAY);
                        months = 0, i = 0;
                        while (i<parsedOccupancy.length && Date.UTC(parsedOccupancy[i].year,parsedOccupancy[i].month,parsedOccupancy[i].day) < +record.get('startDate')){
                            months++;
                            i++;
                        }
                        width = days / totalDays * 100;
                        maskBefore += width + '% - ' + (months * 3 + 3) + 'px)"></div>';
                    }
                    var totalMonths = parsedOccupancy.length,
                    lastDate = new Date(Date.UTC(parsedOccupancy[totalMonths-1].year,parsedOccupancy[totalMonths-1].month,0));
                    if (record.get('endDate') && +record.get('endDate') < +lastDate) {
                        maskAfter = '<div id="after" class="mask_opaque" style="width: calc(';
                        days = Ext.Date.diff(record.get('endDate'), lastDate, Ext.Date.DAY);
                        months = 0, i = totalMonths-1;
                        while (i>=0 && Date.UTC(parsedOccupancy[i].year,parsedOccupancy[i].month,parsedOccupancy[i].day) > +record.get('endDate')){
                            months++;
                            i--;
                        }
                        width = Math.round(days / totalDays * 100);
                        maskAfter += width + '% - ' + (months * 3 + 6) + 'px)"></div>';
                    }
                }
                return {
                    rowBody: '<div class="tableRow_calendar"><div class="tableRow_calendar_inner">'+maskBefore+htmlOccupancy.join('')+maskAfter+'</div></div>',
                    rowBodyCls: "rowbody_occupancy"
                };
            }
        }],
    plugins: {
        gridfilters: {}
        // ,
        // rowexpander: {
        //     rowBodyTpl: new Ext.XTemplate(
        //         '<p><b>No:</b> {supplierNo} </p>',
        //         '<p><b>Address:</b> {address} </p><br>',
        //         '<p><b>Photo:</b> <img href="{urlPhoto}"</p>')
        // }
        // rowwidget: {
        //     // The widget definition describes a widget to be rendered into the
        //     // expansion row. It has access to the application's ViewModel
        //     // hierarchy. Its immediate ViewModel contains a record and
        //     // recordIndex property. These, or any property of the record
        //     // (including association stores) may be bound to the widget.
        //     //
        //     // See the Order model definition with the association declared to
        //     // Company. Every Company record will be decorated with an "orders"
        //     // method which, when called yields a store containing associated
        //     // orders.
        //     widget: {
        //         xtype: 'grid',
        //         autoLoad: true,
        //         hideRowBody: true,
        //         bind: {
        //             store: '{record.pois}',
        //             title: 'POI for {record.num}'
        //         },
        //         columns: [{
        //             text: 'poiId',
        //             dataIndex: 'id',
        //             width: 75
        //         }, {
        //             text: 'Name',
        //             dataIndex: 'name',
        //             width: 265
        //         }, {
        //             text: 'Distance',
        //             dataIndex: 'distance',
        //             xtype: 'numbercolumn',
        //             width: 100,
        //             align: 'right'
        //         }
        //         // , {
        //         //     xtype: 'datecolumn',
        //         //     format: 'Y-m-d',
        //         //     width: 120,
        //         //     text: 'Date',
        //         //     dataIndex: 'date'
        //         // }
        //         , {
        //             text: 'Before object',
        //             xtype: 'checkcolumn',
        //             dataIndex: 'before',
        //             width: 75
        //         }]
        //     }
        // }
    },

    xtype: 'faces-grid',

    columnLines: true,
    padding: 0,
    bodyPadding: 0,
    margin: 0,
    referenceHolder: true,
    split: false,
    // stateful: true,
    // forceFit: true,
    viewConfig: {
        trackOver: false,
        // stripeRows: true,
        enableTextSelection: false,
        markDirty: false
        // ,
        // listeners: {
        //   selectionchange: function (table, selection) {
        //     // console.log(selection);
        //   }
        //     focus: function () {
        //         console.log('focus');
        //     }
        //     ,
        //     beforerowexit: function ( me, keyEvent, prevRow, nextRow, forward, eOpts) {
        //         console.log([me, keyEvent, prevRow, nextRow, forward, eOpts]);
        //     },
        // }
    },
    rowLines: true,
    trackMouseOver: false,
    // {
    //     size: 3,
    //     collapsible: false,
    //     collapseOnDblClick: false
    // },

    viewModel: {
        data: {
            hiddenToolBar: false,
            hiddenStatusBar: false,
            visiblePrice: false,
            visibleSupplier:false,
            // ,
            // showRowStatus: true
        }
    },

    config: {
        hideToolBar: false,
        hideStatusBar: false,
        showPrice: false,
        showAddToCart: true,
        showDelete: false,
        mapView: null,
        detFace: null,
        showKSHitmap:false,
        // ,
        // showRowStatus: true
    },

    // focusCls: 'some-focused',
    updateShowKSHitmap: function(newVal) {
        var me = this;
        me.getViewModel().set('showKSHitmap', newVal);
    },
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
    updateVisibleSupplier: function (newVal) {
        var me = this;
        me.getViewModel().set('visibleSupplier', newVal);
    },
    updateShowDelete: function (newVal) {
        var me = this;
        me.getViewModel().set('showDelete', newVal);
    },

    updateShowAddToCart: function (newVal) {
        var me = this;
        me.getViewModel().set('showAddToCart', newVal);
    },

    // updateShowRowStatus: function (newVal) {
    //     var me = this;
    //     me.getViewModel().set('showRowStatus', newVal);
    //     // me.getView().refresh();
    // },

    //selModel: {
    //    type: 'featuremodel'
    //},

    //selModel: new GeoExt.grid.FeatureSelectionModel(),

    // viewModel: {
    //     type: 'grid-faces'
    // },

    selModel: {
        type: 'checkboxmodel',
        //type: 'rowmodel',
        checkOnly: true,

        listeners: {
            focuschange: function (selModel, oldFocused, newFocused) {
                // var oldRow =
                // console.log('focuschange');
                var tView = selModel.view;
                // console.log(tView.getRow(newFocused));
                // tView.getRow(newFocused).setStyle('background: red');
                if (!newFocused) {
                    if (oldFocused) {
                        tView.oldFocused = oldFocused;
                    }
                    return;
                }
                if (oldFocused) {
                    tView.removeRowCls(oldFocused, 'bm-row-focused');
                }
                if (tView.oldFocused) {
                    tView.removeRowCls(tView.oldFocused, 'bm-row-focused');
                }
                if (newFocused) {
                    tView.addRowCls(newFocused, 'bm-row-focused');
                }
                // tView.focusEl.dom.parentElement.style.background = 'red';
                // tView.
                // console.log([tView, selModel, oldFocused, newFocused]);
            },
            selectionchange: function (selModel, selected) {
                // var store = selModel.getStore(),
                //     chained = new Ext.data.ChainedStore({source: store,
                //         filters: [
                //             function(item) {
                //                 return item.get('selected');
                //             }
                //         ]
                //     });
                // var toClear = [];
                // chained.each(function(rec){
                //     var search = selected.some(function(item){ return rec===item});
                //     if (!search || search.length === 0) {
                //         toClear.push(rec);
                //     }
                // });
                // store.beginUpdate();
                // toClear.forEach(function(rec){rec.set('selected', false)});
                // selected.forEach(function(rec){rec.set('selected', true)});
                // store.endUpdate();
                // chained.destroy();

                // if (selected.length > 0) {
                //   var tView = selModel.view;
                //   tView.grid.fireEvent('selectionchange');
                // }
            }
        }
        // ,
        // showHeaderCheckbox: false
    },

    dockedItems: [
        {
        xtype: 'toolbar',
        dock: 'top',
        reference: 'toolBar',
        bind: {
            hidden: '{hiddenToolBar}'
        },
        items: [
            {
                text: 'Refresh',
                xtype: 'button',
                reference: 'refreshbtn',
                iconCls: 'x-fa fa-refresh',
                listeners: {
                    click: 'onGridRefresh'
                }
            },
            {
                // xtype: 'menu',
                // items: [
                    // {
                    //     text: 'Select All',
                    //     xtype: 'button',
                    //     reference: 'selectallbtn',
                    //     disabled: false,
                    //     listeners: {
                    //         click: 'selectAllClick'
                    //     }
                    // },{
                    //     text: 'Clear selection',
                    //     xtype: 'button',
                    //     reference: 'selectallbtn',
                    //     disabled: false,
                    //     listeners: {
                    //         click: 'clearSelection'
                    //     }
                    // },{
                        text: Bigmedia.Locales.gridBtnShowSelectedOnly,
                        xtype: 'button',
                        iconCls: 'x-fa fa-check',
                        reference: 'showselectedonlybtn',
                        enableToggle: true,
                        disabled: false,
                        // bind: {
                        //     disabled:
                        // },
                        listeners: {
                            toggle: 'showSelectedOnlyToggle'
                        }
                    // }
                // ]
            },
            '->',
            // {
            //     text: 'Test Reach',
            //     xtype: 'button',
            //     reference: 'testreachbtn',
            //     disabled: false,
            //     listeners: {
            //         click: 'testReach'
            //     }
            // },
            {
                text: Bigmedia.Locales.gridBtnAddToCartText,
                xtype: 'button',
                reference: 'addtocartbtn',
                iconCls: 'x-fa fa-cart-plus',
                disabled: true,
                listeners: {
                    click: 'addToCart'
                }
            },
            {
                reference: 'exportbtn',
                xtype: 'button',
                text: Bigmedia.Locales.gridBtnExportToExcelText,
                iconCls: 'x-fa fa-file-excel-o',
                listeners: {
                    click: "exportToExcel"
                }
                //handler: function(){
                //
                //}
            }
        ]
    }],

    title: Bigmedia.Locales.facesTitle,
    header: false,

    columns: [
        //{
        //    xtype: 'rownumberer',
        //    width: 40,
        //    sortable: false,
        //    locked: false
        //},
        {
            text: Bigmedia.Locales.colFaceNum,
            sortable: true,
            dataIndex: 'num',
            groupable: false,
            hideable: false,
            draggable: false,
            width: 80,
            hidden: true
            // ,
            // locked: true
            // ,
            // filter: 'number'
        }, {
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
            //,
            //filter: 'number'
        }, {
            text: Bigmedia.Locales.colSupplier,
            sortable: true,
            dataIndex: 'supplier',
            groupable: false,
            width: 120,
            filter: 'list',

            
            hideable: false,
            // hidden: true,
            // bind: {
            //     hidden: '{!visibleSupplier}'
            // },
            bind: {
                hidden: '{!userLoggedIn}'
            }
        }, {
            text: Bigmedia.Locales.colCity,
            sortable: true,
            dataIndex: 'city',
            groupable: false,
            width: 120,
            filter: 'list'
            // filter: {
            //   type: 'list',
            //   options: ['Полтава', 'Львів']
            // }
        }, {
            text: Bigmedia.Locales.colCityRegion,
            sortable: true,
            dataIndex: 'cityRegion',
            // flex: 1,
            groupable: false,
            width: 90,
            filter: 'list'
        }, {
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
            renderer: function(value, metaData) {
                metaData.tdAttr = 'data-qtip="' + Ext.htmlEncode(value) + '"';
                return Ext.htmlEncode(value);
            }
        }, {
            text: Bigmedia.Locales.colCat,
            sortable: true,
            dataIndex: 'catab',
            groupable: false,
            width: 40,
            filter: 'list'
        }, {
            text: Bigmedia.Locales.colSize,
            sortable: true,
            dataIndex: 'size',
            groupable: false,
            width: 100,
            filter: 'list'
        }, {
            text: Bigmedia.Locales.colLight,
            sortable: true,
            dataIndex: 'light',
            groupable: false,
            width: 40,
            filter: 'list',
            align: 'center',
            width: 40,
            renderer: function(value) {
                var res = '';
                switch (value) {
                    case '+':
                        res = '<span class="x-fa fa-lightbulb-o" style="color: #ffd633"></span>';
                        break;
                    case 'off':
                        res = '<span class="x-fa fa-lightbulb-o" style="color: #8c8c8c"></span>';
                        break;
                }
                return res;
            }
        }, {
            text: Bigmedia.Locales.colNetwork,
            sortable: true,
            dataIndex: 'network',
            groupable: false,
            width: 100,
            filter: 'list'
        }, {
            text: Bigmedia.Locales.colZone,
            sortable: true,
            dataIndex: 'zone',
            groupable: false,
            width: 90,
            filter: 'list'
        }
        // , {
        //     text: Bigmedia.Locales.colRating,
        //     sortable: true,
        //     dataIndex: 'rating',
        //     xtype: 'widgetcolumn',
        //     widget: {
        //         xtype: 'rating',
        //         trackOver: false,
        //         disabled: true
        //         //,
        //         //listeners: {
        //         //    beforechange: function(){ return false;}
        //         //}
        //     },
        //     groupable: false,
        //     width: 90,
        //     filter: 'list'
        // }
        , {
            text: Bigmedia.Locales.colGRP,
            sortable: true,
            dataIndex: 'displayGrp',
            groupable: false,
            width: 60,
            filter: 'number',
            bind: {
                hidden: '{showKSHitmap==true}'
            }
        }, {
            text: Bigmedia.Locales.colOTS,
            sortable: true,
            dataIndex: 'displayOts',
            groupable: false,
            width: 60,
            filter: 'number',
            bind: {
                hidden: '{showKSHitmap==true}'
            }
        }, 
        {
            text: Bigmedia.Locales.colDoorsNo,
            sortable: true,
            dataIndex: 'doors_no',
            groupable: false,
            // hidden: true,
            width: 60,
            filter: {
                type: 'string',
                itemDefaults: {
                    emptyText: Bigmedia.Locales.gridColumnStrFilterText
                }
            }
        }, 
        {
            text: Bigmedia.Locales.colOTS,
            sortable: true,
            dataIndex: 'displayksOTS',
            groupable: false,
            hideable: false,
            width: 60,
            filter: 'number',
            bind: {
                hidden: '{showKSHitmap==false}'
            }
        },
        {
            text: Bigmedia.Locales.colTRP,
            sortable: true,
            dataIndex: 'displayksTRP',
            groupable: false,
            hideable: false,
            width: 60,
            filter: 'number',
            bind: {
                hidden: '{showKSHitmap==false}'
            }
        },
        {
            text: Bigmedia.Locales.colGRP,
            sortable: true,
            dataIndex: 'displayksGRP',
            groupable: false,
            width: 60,
            filter: 'number',
            hideable: false,
            bind: {
                // hideable:'{!hideKSData}',
                hidden: '{showKSHitmap==false}'
            }
        },
        {
            text: 'Price',
            bind: {
                hidden: '{!visiblePrice}'
            },
            width: 60,
            sortable: true,
            // reference: 'columnprice',
            dataIndex: 'price',
            // xtype: 'widgetcolumn',
            // hidden: true,
            hideable: false,
            filter: 'number'
            // ,
            // width: 220,
            // minWidth: 150,
            // widget: {
            //     xtype: 'occupancystate'
            // }
        }, {
            text: 'Net',
            bind: {
                hidden: '{!visiblePrice}'
            },
            width: 60,
            sortable: true,
            reference: 'columnprice',
            dataIndex: 'finalPrice',
            // xtype: 'widgetcolumn',
            // hidden: true,
            hideable: false,
            filter: 'number'
            // ,
            // width: 220,
            // minWidth: 150,
            // widget: {
            //     xtype: 'occupancystate'
            // }
        }, {
            text: 'Client Price',
            hidden: true,
            width: 60,
            sortable: true,
            dataIndex: 'clientPrice',
            // xtype: 'widgetcolumn',
            // hidden: true,
            hideable: true,
            filter: 'number'
            // ,
            // width: 220,
            // minWidth: 150,
            // widget: {
            //     xtype: 'occupancystate'
            // }
        }
        // , {
        //     text: Bigmedia.Locales.colOccupancy,
        //     sortable: false,
        //     dataIndex: 'occupancy',
        //     // xtype: 'widgetcolumn',
        //     hidden: true,
        //     hideable: false
        //     // ,
        //     // width: 220,
        //     // minWidth: 150,
        //     // widget: {
        //     //     xtype: 'occupancystate'
        //     // }
        // }
        ,
        {
            xtype:'actioncolumn',
            dataIndex: 'inCart',
            width:50,
            hideable: false,
            sortable: false,
            menuDisabled: true,
            bind: {
                hidden: '{!showAddToCart}'
            },
            isActionDisabled: function (view, rowIndex, colIndex, item, record) {
              // console.log(record.get('inCart'));
              return !!record.get('inCart');
            },
            // items: [{
            //   isActionDisabled: function (view, rowIndex, colIndex, item, record) {
            //     return !!record.get('inCart');
            //   },
                // iconCls: 'x-fa fa-plus',
                tooltip: 'Add to campaign',
                getClass: function (v) {
                  return 'x-fa fa-' + (v ? 'minus' : 'plus');
                },
                handler: 'cartAction'
            // }]
        },
        {
            xtype:'actioncolumn',
            width:50,
            bind: {
                hidden: '{!showDelete}'
            },
            hideable: false,
            sortable: false,
            menuDisabled: true,
            items: [{
                iconCls: 'x-fa fa-minus',
                tooltip: 'Delete',
                handler: function(tableView, rowIndex, colIndex) {
                    var rec = tableView.getStore().getAt(rowIndex);
                    tableView.ownerGrid.fireEventArgs('deleterecord', [tableView.ownerGrid, rec]);
                }
            }]
        }
        // , {
        //     text: '',
        //     width: 50,
        //     xtype: 'widgetcolumn',
        //     groupable: false,
        //     hidable: false,
        //     sizeable: false,
        //     bind: {
        //         hidden: '{!showAddToCart}'
        //     },
        //     sortable: false,
        //     ignoreExport: true,
        //     widget: {
        //         width: 40,
        //         xtype: 'button',
        //         iconCls: 'x-fa fa-cart-arrow-down',
        //         handler: function(btn) {
        //             var rec = btn.getWidgetRecord();
        //             btn.up('faces-grid').getController().addFaceToCart(rec.get('id'));
        //         }
        //     }
        // }
        // , {
        //     text: '',
        //     width: 50,
        //     xtype: 'widgetcolumn',
        //     groupable: false,
        //     hidable: false,
        //     sortable: false,
        //     sizeable: false,
        //     ignoreExport: true,
        //     bind: {
        //         hidden: '{!showDelete}'
        //     },
        //     widget: {
        //         width: 40,
        //         // textAlign: 'left',
        //         xtype: 'button',
        //         iconCls: 'x-fa fa-minus',
        //         handler: function (btn) {
        //             var rec = btn.getWidgetRecord(),
        //                 grid = btn.up('grid');
        //             grid.fireEventArgs('deleterecord', [grid, rec]);
        //         }
        //     }
        // }
    ],

    updateStatusBar: function () {
        var me = this,
            sb = me.lookupReference("statusGrid"),
            store = me.getStore(),
            totalCount = (store.getData().getSource() || store.getData()).getCount(),
            count = store.getCount(),
            selected = me.getSelectionModel().getCount();

        var exportBtn = me.lookupReference('exportbtn'),
            addToCartBtn = me.lookupReference('addtocartbtn'),
            showSelectedOnlyBtn = me.lookupReference('showselectedonlybtn');

        exportBtn.setDisabled(count == 0 && selected == 0);
        addToCartBtn.setDisabled(selected == 0);
        if ( ( showSelectedOnlyBtn.pressed && (!store.getFilters() || !store.getFilters().getByKey('filterselected') ) ) ||
                ( !showSelectedOnlyBtn.pressed && store.getFilters() && store.getFilters().getByKey('filterselected') ) ){
                    showSelectedOnlyBtn.toggle(false,true); //only toggle because of silent mode
                }
        showSelectedOnlyBtn.setDisabled(selected == 0);
    },

    onStoreEndUpdate: function () {
        var view = this.getViewModel();
        if(view.get('showKSHitmap')!= Bigmedia.Vars.getShowKSHitmap())
            view.set('showKSHitmap',Bigmedia.Vars.getShowKSHitmap())
      this.getView().refresh();
    },

    listeners: {
        show: 'onGridShow',
        viewready: 'onGridLoad',
        // rowclick: 'onRowClick',
        // focus: function () {
        //     console.log('focus');
        // },
        // beforerowexit: function ( me, keyEvent, prevRow, nextRow, forward, eOpts) {
        //     console.log([me, keyEvent, prevRow, nextRow, forward, eOpts]);
        // },
        itemkeydown: function (me, record, item, index, e, eOpts) {
            var sm = me.getSelectionModel();
            if (e.keyCode === 32 && e.position.colIdx !== 0) {
                if (sm.isSelected(record)) {
                    sm.deselect(record);
                } else {
                    sm.select(record, true);
                }
                // console.log(e);
            }
            // console.log([me, record, item, index, e, eOpts]);
        },
        // deselect: function (grid, record, index) {
        //     record.set('selected',false, {silent: true});
        // },
        // select: function (grid, record, index) {
        //     record.set('selected',true, {silent: true});
        //     // celldblclick: 'onDoubleClick',
        // },
        // beforereconfigure: function (grid, store, columns, oldStore, oldColumns) {
        //     grid.suspendLayouts();
        // },

        reconfigure: function (grid, store, columns, oldStore, oldColumns) {
        //   console.log('reconfigure');
          var me = this;
            if (store !== oldStore) {
                if (oldStore) {
                    oldStore.removeListener('endupdate', me.onStoreEndUpdate);
                    oldStore.removeListener('filterchange', grid.getController().onStoreDataChanged);
                    oldStore.removeListener('beforeload', grid.getController().onStoreBeforeLoad);
                    // oldStore.removeListener('beforeworkerload', grid.getController().onStoreBeforeWorkerLoad);
                    oldStore.removeListener('workerload', grid.getController().onStoreLoad);
                }
                if (store) {
                    store.addListener('endupdate', me.onStoreEndUpdate, me);
                    store.addListener('filterchange', grid.getController().onStoreDataChanged, grid.getController());
                    store.addListener('beforeload', grid.getController().onStoreBeforeLoad, grid.getController(), {order: 'before'});
                    // store.addListener('beforeworkerload', grid.getController().onStoreBeforeWorkerLoad, grid.getController());
                    store.addListener('workerload', grid.getController().onStoreLoad, grid.getController(), {order: 'after'});
                }
                var sb = grid.lookupReference("statusGrid")
                grid.updateStatusBar();
                // if (store && (store.isLoading() || store.bgLoading)) {
                  // grid.getController().loadMask.show();
                //     if (sb) {
                //         sb.showBusy();
                //     }
                // }
            }
            // grid.getView().refresh();
            // grid.resumeLayouts();
        },

        selectionchange: function (grid, selected) {
            var store = grid.getStore(),
                filters = store.getFilters();
            if(filters !== undefined && filters.getByKey('filterselected')){
                if(grid.getSelection().length == 0){
                    store.removeFilter('filterselected');
                } else {
                    store.removeFilter('filterselected', true);
                    var ids = grid.getSelection().map(function (item) {
                        return item.id;
                    });
                    var fltr = new Ext.util.Filter({
                        property: 'id',
                        id: 'filterselected',
                        operator: 'in',
                        value: ids
                    });
                    store.addFilter(fltr);
                }
            }
            this.updateStatusBar();
        }
    }
});
