Ext.define("Bigmedia.view.grid.ThirdParty", {
    extend: "Ext.grid.Panel",

    requires: [
        'Ext.grid.filters.Filters',
        'Ext.ux.statusbar.StatusBar',
        'Ext.grid.column.Action',
        'Bigmedia.view.grid.ThirdPartyController'
    ],

    controller: 'grid-thirdparty',

    plugins: [
        {
            ptype: 'cellediting',
            clicksToEdit: 1
        },
        {
            ptype: 'gridfilters'
        }
    ],

    xtype: 'thirdparty-grid',

    // bufferedRenderer: false,
    columnLines: true,
    padding: 0,
    bodyPadding: 0,
    margin: 0,
    referenceHolder: true,
    split: false,
    stateful: true,
    forceFit: true,
    viewConfig: {
        trackOver: false,
        stripeRows: true,
        enableTextSelection: false,
        markDirty: false
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
        hideToolBar: false,
        hideStatusBar: false,
        showPrice: true,
        // showAddToCart: true,
        showDelete: true
        // ,
        // showRowStatus: true
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

    updateShowDelete: function (newVal) {
        var me = this;
        me.getViewModel().set('showDelete', newVal);
    },

    updateShowAddToCart: function (newVal) {
        var me = this;
        me.getViewModel().set('showAddToCart', newVal);
    },

    // selModel: {
    //     type: 'checkboxmodel',
    //     checkOnly: true,
    //
    //     listeners: {
    //         selectionchange: function (selModel, selected) {
    //             var store = selModel.getStore(),
    //                 chained = new Ext.data.ChainedStore({source: store,
    //                     filters: [
    //                         function(item) {
    //                             return item.selected;
    //                         }
    //                     ]
    //                 });
    //             var toClear = [];
    //             chained.each(function(rec){
    //                 var search = selected.some(function(item){ return rec===item});
    //                 if (!search || search.length === 0) {
    //                     toClear.push(rec);
    //                 }
    //             });
    //             store.beginUpdate();
    //             toClear.forEach(function(rec){rec.set('selected', false)});
    //             selected.forEach(function(rec){rec.set('selected', true)});
    //             store.endUpdate();
    //         }
    //     }
    // },

    // features: [{
    //     ftype: 'rowbody',
    //     getAdditionalData: function (data, idx, record, orig) {
    //         // if (! this.grid.getShowRowStatus()) {
    //         //     return null;
    //         // }
    //         if (this.view.isLockedView || this.grid.ownerGrid.hideRowBody) {
    //             return null;
    //         }
    //         // Usually you would style the my-body-class in a CSS file
    //         var parsedOccupancy = record.get('parsedOccupancy');
    //         // console.log(parsedOccupancy);
    //         var totalDays = parsedOccupancy.reduce(function(sum,cur){ return sum + cur.actualDays},0);
    //         var htmlOccupancy = parsedOccupancy.map(function(month){
    //             var tmp = '<span class="tableRow_month" style="width: ' + Math.round(month.actualDays * 1000000 / totalDays ) / 10000 +'%;">';
    //             month.periods.forEach(function(period){
    //                 tmp += '<span class="month_line month_line-' + period.status + '" style="width: ' + Math.round( period.days * 1000000 / month.actualDays ) / 10000 + '%;" data-qtip="' + Bigmedia.Locales.occupancyTooltip[period.status] + '"></span>';
    //             });
    //             tmp += '<div class="date_name">'+Ext.Date.getShortMonthName(month.month) + '`' + month.year.toString().slice(-2) + '</div>';
    //             tmp += '</span>';
    //             return tmp;
    //         });
    //         var maskBefore='', maskAfter='';
    //         // var fltrs = this.grid.getSource.getFilters();
    //         if (record.get('startDate') || record.get('endDate')) {
    //             var days, months, i, width;
    //             if (record.get('startDate') && +record.get('startDate') >= Date.UTC(parsedOccupancy[0].year,parsedOccupancy[0].month,parsedOccupancy[0].day)) {
    //                 maskBefore = '<div id="before" class="mask_opaque" style="width: calc(';
    //                 days = Ext.Date.diff(new Date(Date.UTC(parsedOccupancy[0].year,parsedOccupancy[0].month,parsedOccupancy[0].day)), record.get('startDate'), Ext.Date.DAY);
    //                 months = 0, i = 0;
    //                 while (i<parsedOccupancy.length && Date.UTC(parsedOccupancy[i].year,parsedOccupancy[i].month,parsedOccupancy[i].day) < +record.get('startDate')){
    //                     months++;
    //                     i++;
    //                 }
    //                 width = days / totalDays * 100;
    //                 maskBefore += width + '% - ' + (months * 3 + 3) + 'px)"></div>';
    //             }
    //             var totalMonths = parsedOccupancy.length,
    //                 lastDate = new Date(Date.UTC(parsedOccupancy[totalMonths-1].year,parsedOccupancy[totalMonths-1].month,0));
    //             if (record.get('endDate') && +record.get('endDate') < +lastDate) {
    //                 maskAfter = '<div id="after" class="mask_opaque" style="width: calc(';
    //                 days = Ext.Date.diff(record.get('endDate'), lastDate, Ext.Date.DAY);
    //                 months = 0, i = totalMonths-1;
    //                 while (i>=0 && Date.UTC(parsedOccupancy[i].year,parsedOccupancy[i].month,parsedOccupancy[i].day) > +record.get('endDate')){
    //                     months++;
    //                     i--;
    //                 }
    //                 width = Math.round(days / totalDays * 100);
    //                 maskAfter += width + '% - ' + (months * 3 + 6) + 'px)"></div>';
    //             }
    //         }
    //         return {
    //             rowBody: '<div class="tableRow_calendar"><div class="tableRow_calendar_inner">'+maskBefore+htmlOccupancy.join('')+maskAfter+'</div></div>',
    //             rowBodyCls: "rowbody_occupancy"
    //         };
    //     }
    // }],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        reference: 'toolBar',
        bind: {
            hidden: '{hiddenToolBar}'
        },
        items: [
            // {
            //     text: 'Refresh',
            //     xtype: 'button',
            //     reference: 'refreshbtn',
            //     iconCls: 'x-fa fa-refresh',
            //     listeners: {
            //         click: 'onGridRefresh'
            //     }
            // },
            {
                xtype: 'button',
                reference: 'addthirdpartybtn',
                iconCls: 'x-fa fa-plus',
                text: 'Add boards',
                listeners: {
                    click: 'onGridAddThirdParty'
                }
            },
            // {
            //     text: Bigmedia.Locales.gridBtnShowSelectedOnly,
            //     xtype: 'button',
            //     iconCls: 'x-fa fa-check',
            //     reference: 'showselectedonlybtn',
            //     enableToggle: true,
            //     disabled: false,
            //     // bind: {
            //     //     disabled:
            //     // },
            //     listeners: {
            //         toggle: 'showSelectedOnlyToggle'
            //     }
            // },
            '->',
            // {
            //     text: 'Test Reach',
            //     xtype: 'button',
            //     reference: 'testreachbtn',
            //     disabled: false,
            //     listeners: {
            //         click: 'testReach'
            //     }
            // }
            ,
            {
                text: 'Clear', //TODO
                xtype: 'button',
                reference: 'clearbtn',
                iconCls: 'x-fa fa-trash',
                disabled: true,
                listeners: {
                    click: 'onClearClick'
                }
            }
            // ,
            // {
            //     reference: 'exportbtn',
            //     xtype: 'button',
            //     text: Bigmedia.Locales.gridBtnExportToExcelText,
            //     iconCls: 'x-fa fa-file-excel-o',
            //     listeners: {
            //         click: "exportToExcel"
            //     }
            // }
        ]
    }, {
        xtype: 'statusbar',
        dock: 'bottom',
        reference: 'statusGrid',
        bind: {
            hidden: '{hiddenStatusBar}'
        },
        defaultText: '',
        defaultIconCls: 'default-icon',
        text: '',
        iconCls: 'x-status-ready',
        busyText: Bigmedia.Locales.statusBarLoading
    }],

    title: Bigmedia.Locales.facesTitle,
    header: false,

    columns: [
        {
            text: Bigmedia.Locales.colDoorsNo,
            sortable: true,
            dataIndex: 'doors_no',
            groupable: false,
            hideable: false,
            draggable: false,
            width: 60
            // ,
            // locked: true
            //,
            //filter: 'number'
        },{
            text: 'SupplierNo',
            sortable: true,
            dataIndex: 'supplier_no',
            groupable: false,
            hideable: true,
            hidden: true,
            draggable: false,
            width: 80
            // ,
            // locked: true
            //,
            //filter: 'number'
        }, {
            text: Bigmedia.Locales.colSupplier,
            sortable: true,
            dataIndex: 'supplier',
            groupable: false,
            width: 120,
            filter: 'list'
        }, {
            text: Bigmedia.Locales.colCity,
            sortable: true,
            dataIndex: 'city',
            groupable: false,
            width: 120,
            filter: 'list'
        }, {
            text: Bigmedia.Locales.colAddress,
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
            }
        }
        , {
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
        },
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
        {
            text: Bigmedia.Locales.colGRP,
            sortable: true,
            dataIndex: 'grp',
            groupable: false,
            width: 60,
            filter: 'number'
            //,
            //renderer: function(value) {
            //    return Math.round(value * 100)/100;
            //}
        }, {
            text: Bigmedia.Locales.colOTS,
            sortable: true,
            dataIndex: 'ots',
            groupable: false,
            width: 60,
            filter: 'number'
        }
        // // , {
        // //     text: Bigmedia.Locales.colDoorsNo,
        // //     sortable: true,
        // //     dataIndex: 'doors_no',
        // //     groupable: false,
        // //     // hidden: true,
        // //     width: 60,
        // //     filter: {
        // //         type: 'string',
        // //         itemDefaults: {
        // //             emptyText: Bigmedia.Locales.gridColumnStrFilterText
        // //         }
        // //     }
        // // }
        , {
            text: 'Price',
            // bind: {
            //     hidden: '{!visiblePrice}'
            // },
            width: 100,
            sortable: true,
            reference: 'columnprice',
            dataIndex: 'price',
            // xtype: 'widgetcolumn',
            // hidden: true,
            hideable: false,
            filter: 'number',
            editor: {
                xtype: 'numberfield',
                allowBlank: true,
                minValue: 0,
                maxValue: 100000
            }
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
        // {
        //     xtype:'actioncolumn',
        //     width:50,
        //     bind: {
        //         hidden: '{!showAddToCart}'
        //     },
        //     items: [{
        //         iconCls: 'x-fa fa-cart-arrow-down',
        //         tooltip: 'Add to cart',
        //         handler: 'addFaceToCartAction'
        //     }]
        // },
        ,
        {
            xtype:'actioncolumn',
            width:50,
            bind: {
                hidden: '{!showDelete}'
            },
            items: [{
                iconCls: 'x-fa fa-minus',
                tooltip: 'Delete',
                handler: function(tableView, rowIndex, colIndex) {
                    var rec = tableView.getStore().getAt(rowIndex);
                    tableView.getStore().remove(rec);
                    // tableView.ownerGrid.fireEventArgs('deleterecord', [tableView.ownerGrid, rec]);
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

    // updateStore: function (newVal, oldVal) {
    //     console.log('updateStore');
    //     console.log(oldVal);
    //     console.log(newVal);
    //     var me = this;
    //     if (oldVal) {
    //         oldVal.removeListener('datachanged', me.updateStatusBar);
    //     }
    //     if (newVal) {
    //         newVal.addListener('datachanged', me.updateStatusBar, me);
    //     }
    // },

    updateStatusBar: function () {
        var me = this,
            sb = me.lookupReference("statusGrid"),
            store = me.getStore(),
            totalCount = (store.getData().getSource() || store.getData()).getCount(),
            count = store.getCount(),
            selected = me.getSelectionModel().getCount();
        if (!totalCount) {
            totalCount = count;
        }
        var status = Ext.String.format(Bigmedia.Locales.statusBarTotal, totalCount);
        if (totalCount != count) {
            status += ' | ' + Ext.String.format(Bigmedia.Locales.statusBarFiltered, count);
        }
        if (selected > 0) {
            status += ' | ' + Ext.String.format(Bigmedia.Locales.statusBarChecked, selected);
        }
        var ots = [store.min('ots'), store.max('ots'), Math.round(store.average('ots') * 100) / 100, Math.round(store.sum('ots') * 100) / 100];

        status += '  | OTS(min,max,avg) = ' + ots.slice(0,3).join(', ') + ' | OTS(sum) = ' + ots[3];

        var cities = store.collect('city');
        if(cities.length == 1) {
            grp = [store.min('grp'), store.max('grp'), Math.round(store.average('grp') * 100) / 100, Math.round(store.sum('grp') * 100) / 100];
            status += '  | GRP ' + cities[0] + '(min,max,avg) = ' + grp.slice(0, 3).join(', ') + ' | GRP(sum) = ' + grp[3];
        }

        var exportBtn = me.lookupReference('exportbtn'),
            clearbtn = me.lookupReference('clearbtn');

        // exportBtn.setDisabled(count == 0 && selected == 0);
        clearbtn.setDisabled(count == 0);
        // if ( ( showSelectedOnlyBtn.pressed && (!store.getFilters() || !store.getFilters().getByKey('filterselected') ) ) ||
        //         ( !showSelectedOnlyBtn.pressed && store.getFilters() && store.getFilters().getByKey('filterselected') ) ){
        //             showSelectedOnlyBtn.toggle(false,true); //only toggle because of silent mode
        //         }
        // showSelectedOnlyBtn.setDisabled(selected == 0);

        if (store && store.isLoading()) {
            if (sb) {
                sb.showBusy();
            }
        } else {
            sb.setStatus({
                text: status,
                iconCls: 'x-ready-icon'
            });
        }
    },

    listeners: {
        // show: 'onGridShow',
        reconfigure: function (grid, store, columns, oldStore, oldColumns) {
            if (store !== oldStore) {
                if (oldStore) {
                    oldStore.removeListener('datachanged', grid.getController().onStoreDataChanged);
                    oldStore.removeListener('beforeload', grid.getController().onStoreBeforeLoad);
                    oldStore.removeListener('load', grid.getController().onStoreLoad);
                }
                if (store) {
                    store.addListener('datachanged', grid.getController().onStoreDataChanged, grid.getController());
                    store.addListener('beforeload', grid.getController().onStoreBeforeLoad, grid.getController());
                    store.addListener('load', grid.getController().onStoreLoad, grid.getController());
                }
                var sb = grid.lookupReference("statusGrid")
                grid.updateStatusBar();
                if (store && store.isLoading()) {
                    if (sb) {
                        sb.showBusy();
                    }
                }
            }
            // grid.getView().refresh();
            // grid.resumeLayouts();
        },

        selectionchange: function (grid, selected) {
            var store = grid.getStore(),
                filters = store.getFilters();
            // if(filters !== undefined && filters.getByKey('filterselected')){
            //     if(grid.getSelection().length == 0){
            //         store.removeFilter('filterselected');
            //     } else {
            //         store.removeFilter('filterselected', true);
            //         var ids = grid.getSelection().map(function (item) {
            //             return item.id;
            //         });
            //         var fltr = new Ext.util.Filter({
            //             property: 'id',
            //             id: 'filterselected',
            //             operator: 'in',
            //             value: ids
            //         });
            //         store.addFilter(fltr);
            //     }
            // }
            this.updateStatusBar();
        }
    }
});
