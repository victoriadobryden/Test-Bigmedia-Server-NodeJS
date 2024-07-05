Ext.define("Bigmedia.view.cart.CartGrid", {
    extend: "Ext.grid.Panel",

    requires: [
        'Bigmedia.store.Faces',
        'Ext.grid.filters.Filters',
        'Bigmedia.view.grid.FacesModel',
        'Ext.ux.statusbar.StatusBar',
        "Bigmedia.view.grid.FacesController",
        'Ext.ux.rating.Picker',
        'Bigmedia.store.Faces',
        'Ext.window.Toast',
        'Ext.chart.CartesianChart',
        'Bigmedia.view.cart.CartGridController',
        'Bigmedia.view.cart.WinCoverage'
        //,
        //'GeoExt.selection.FeatureModel'
    ],

    controller: 'cartgridcontroller',

    plugins: 'gridfilters',

    xtype: 'cart-grid',

    columnLines: true,
    padding: 0,
    bodyPadding: 0,
    margin: 0,

    config: {
        mapView: null
    },

    referenceHolder: true,

    selModel: {
        type: 'checkboxmodel',
        //type: 'rowmodel',
        checkOnly: true,
        listeners: {
            focuschange: function (selModel, oldFocused, newFocused) {
                // var oldRow =
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
            }
        }
        // ,
        // showHeaderCheckbox: false
    },

    updateMapView: function(newVal) {
        this.winCoverage.getViewModel().set('mapView', newVal);
    },

    features: [{
        ftype: 'rowbody',
        getAdditionalData: function (data, idx, record, orig) {
            // Usually you would style the my-body-class in a CSS file
            var parsedOccupancy = record.get('parsedOccupancy');
            // console.log(parsedOccupancy);
            var totalDays = parsedOccupancy.reduce(function(sum,cur){ return sum + cur.actualDays},0);
            var htmlOccupancy = parsedOccupancy.map(function(month){
                var tmp = '<span class="tableRow_month" style="width: ' + Math.round(month.actualDays * 1000000 / totalDays ) / 10000 +'%;">';
                month.periods.forEach(function(period){
                    tmp += '<span class="month_line month_line-' + period.status + '" style="width: ' + Math.round( period.days * 1000000 / month.actualDays ) / 10000 + '%;" data-qtip="' + Bigmedia.Locales.occupancyTooltip[period.status] + '"></span>';
                });
                tmp += '<div class="date_name">'+Ext.Date.getShortMonthName(month.month) + '`' + month.year.toString().slice(-2) + '</div>';
                tmp += '</span>';
                return tmp;
            });
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

    tbar: [
        // {
        //     text: Bigmedia.Locales.gridBtnShowSelectedOnly,
        //     xtype: 'button',
        //     iconCls: 'x-fa fa-check',
        //     reference: 'showselectedonlybtn',
        //     enableToggle: true,
        //     disabled: false,
        //     listeners: {
        //         toggle: 'showSelectedOnlyToggle'
        //     }
        // },
        '->',
        {
            text: 'Show Coverage',
            xtype: 'button',
            reference: 'showcoveragebtn',
            iconCls: 'x-fa fa-line-chart',
            disabled: false,
            enableToggle: true,
            listeners: {
                toggle: 'onToggleCoverage'
            }
        },
        {
            text: Bigmedia.Locales.gridBtnRemoveFromCartText,
            xtype: 'button',
            reference: 'removefromcartbtn',
            iconCls: 'x-fa fa-minus',
            disabled: true,
            listeners: {
                click: 'removeFromCart'
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
    ],

    bbar: {
        xtype: 'statusbar',
        // id: 'statusGrid',
            reference: 'statusCartGrid',

            // defaults to use when the status is cleared:
            defaultText: '',
            defaultIconCls: 'default-icon',

            // values to set initially:
            text: 'Ready',
            iconCls: 'ready-icon',

            busyText: Bigmedia.Locales.statusBarLoading
    },

    title: Bigmedia.Locales.facesTitle,
    header: false,

    columns: [
        {
            text: Bigmedia.Locales.colFaceNum,
            sortable: true,
            dataIndex: 'num',
            groupable: false,
            width: 80
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
            // flex: 1,
            groupable: false,
            width: 250,
            filter: {
                type: 'string',
                itemDefaults: {
                    emptyText: Bigmedia.Locales.gridColumnStrFilterText
                }
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
        }, {
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
        }, {
            xtype:'actioncolumn',
            width:50,
            items: [{
                iconCls: 'x-fa fa-minus',
                tooltip: 'Delete',
                handler: 'removeItemFromCartAction'
            }]
        }
        // , {
        //     text: '',
        //     width: 50,
        //     xtype: 'widgetcolumn',
        //     groupable: false,
        //     hidable: false,
        //     sortable: false,
        //     ignoreExport: true,
        //     // dataIndex: 'id',
        //     widget: {
        //         width: 40,
        //         // textAlign: 'left',
        //         xtype: 'button',
        //         iconCls: 'x-fa fa-minus',
        //         handler: 'removeItemFromCart'
        //         // function(btn) {
        //         //     var rec = btn.getWidgetRecord();
        //         //     // console.log(rec.get('id'));
        //         //     btn.up('grid').getController().removeFaceFromCart(rec.get('id'));
        //         // }
        //     }
        // }
    ],

    updateCartStatusBar: function () {
        var me = this,
            sb = me.lookupReference("statusCartGrid"),
            store = me.getStore(),
            totalCount = (store.getData().getSource() || store.getData()).getCount(),
            count = store.getCount(),
            selected = me.getSelectionModel().getCount();
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
            removeFromCartBtn = me.lookupReference('removefromcartbtn');

        exportBtn.setDisabled(count == 0 && selected == 0);
        if (removeFromCartBtn) {
            removeFromCartBtn.setDisabled(selected == 0);
        }
        // if ( ( showSelectedOnlyBtn.pressed && (!store.getFilters() || !store.getFilters().getByKey('filterselected') ) ) ||
        //         ( !showSelectedOnlyBtn.pressed && store.getFilters() && store.getFilters().getByKey('filterselected') ) ){
        //             showSelectedOnlyBtn.toggle(false,true); //only toggle because of silent mode
        //         }
        // showSelectedOnlyBtn.setDisabled(selected == 0);

        sb.setStatus({
            text: status,
            iconCls: 'ready-icon'
        });
    },

    listeners: {
        deselect: function (grid, record, index) {
            record.set('selected',false);
        },
        select: function (grid, record, index) {
            record.set('selected',true);
        },
        rowclick: function (grid) {

        },
        // celldblclick: 'onDoubleClick',
        // var store = grid.getStore(),
        //     filters = store.getFilters();
        selectionchange: function (grid, selected) {
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
            this.updateCartStatusBar();
        }
    }
});
