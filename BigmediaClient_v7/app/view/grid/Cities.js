Ext.define("Bigmedia.view.grid.Cities", {
    extend: "Ext.grid.Panel",

    requires: [
    ],

    xtype: 'cities-grid',

    // config: {
    //     facesStore: null
    // },
    // bind: {
    //     store: '{cities}'
    // },
    // viewModel: {
    //     stores: {
    //         allCities: new Ext.data.Store({
    //             model: 'PlanCity',
    //             proxy: 'memory'
    //         }),
    //         cities: {
    //             source: '{allCities}',
    //             filters: [
    //                 function(item) {
    //                     // console.log(item);
    //                     // return item.get('facesCount') > 0;
    //                     return item.faces().count() > 0;
    //                 }
    //             ],
    //             sorters: [
    //                 {
    //                     property: 'population',
    //                     direction: 'DESC'
    //                 }
    //             ]
    //         }
    //     }
    // },
    // controller: {
    //     loadCities: function () {
    //         var me = this,
    //             allCities = me.getViewModel().getStore('allCities'),
    //             citiesStore = Ext.getStore('Cities'),
    //             cityBoundStore = Ext.getStore('CityBoundaries');
    //         citiesStore.each(function(rec){
    //             var cityBound = cityBoundStore.getById(rec.getId());
    //             allCities.add({
    //                 id: rec.getId(),
    //                 name: rec.get('name'),
    //                 area: cityBound ? cityBound.get('area') / 1000000 : null
    //             });
    //         });
    //     },
    //     init: function(config) {
    //         var me = this,
    //             cityBoundStore = Ext.getStore('CityBoundaries');
    //         if (!cityBoundStore.isLoaded()) {
    //             cityBoundStore.on({
    //                 load: {
    //                     fn: me.loadCities,
    //                     scope: me,
    //                     single: true
    //                 }
    //             });
    //         } else {
    //             me.loadCities();
    //         }
    //     }
    // },
    updateFacesStore: function (newStore, oldStore) {
        var me = this;
        if (oldStore) {
            oldStore.removeListener('datachanged', me.onFacesStoreDataChanged);
            oldStore.removeListener('beforeload', me.onFacesStoreDataChanged);
            oldStore.removeListener('load', me.onFacesStoreDataChanged);
        }
        if (newStore) {
            newStore.on('datachanged', me.onFacesStoreDataChanged, me);
            newStore.on('beforeload', me.onFacesStoreDataChanged, me);
            newStore.on('load', me.onFacesStoreDataChanged, me);
        }
        me.onFacesStoreDataChanged();
    },
    onFacesStoreDataChanged: function (store) {
        if (!store) {
            return;
        }
        var me = this,
            allCities = me.getViewModel().getStore('allCities');
        allCities.each(function(rec){
            rec.faces().removeAll();
        });
        store.each(function(face){
            var city = allCities.getById(face.get('id_city'));
            if (city) {
                city.faces().add(face);
            }
        });
        allCities.each(function(rec){
            rec.set('facesCount', rec.faces().count());
        });
    },
    columnLines: true,
    padding: 0,
    bodyPadding: 0,
    margin: 0,
    referenceHolder: true,
    split: false,
    stateful: true,
    forceFit: true,
    features: [{
        ftype: 'summary',
        dock: 'bottom'
    }],
    viewConfig: {
        trackOver: false,
        stripeRows: true,
        enableTextSelection: false,
        markDirty: false
    },
    trackMouseOver: false,

    selModel: {
        type: 'checkboxmodel',
        checkOnly: true
        //     selectionchange: function (selModel, selected) {
        //         var store = selModel.getStore(),
        //             chained = new Ext.data.ChainedStore({source: store,
        //                 filters: [
        //                     function(item) {
        //                         return item.selected;
        //                     }
        //                 ]
        //             });
        //         var toClear = [];
        //         chained.each(function(rec){
        //             var search = selected.some(function(item){ return rec===item});
        //             if (!search || search.length === 0) {
        //                 toClear.push(rec);
        //             }
        //         });
        //         store.beginUpdate();
        //         toClear.forEach(function(rec){rec.set('selected', false)});
        //         selected.forEach(function(rec){rec.set('selected', true)});
        //         store.endUpdate();
        //     }
        // }
    },

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
        ]
    }],

    title: 'Cities',
    header: false,

    columns: [
        {
            text: Bigmedia.Locales.colCity,
            sortable: true,
            dataIndex: 'name',
            groupable: false,
            hideable: false,
            draggable: false,
            width: 150
        },{
            text: 'Faces amount',
            sortable: true,
            dataIndex: 'facesCount',
            groupable: false,
            hideable: true,
            draggable: false,
            width: 100,
            summaryType: 'sum',
            summaryFormatter: 'number("0")',
            formatter: 'number("0")'
        }, {
            text: 'Population (thousands)',
            sortable: true,
            dataIndex: 'population',
            groupable: false,
            width: 80,
            summaryType: 'sum',
            summaryFormatter: 'number("0")',
            formatter: 'number("0")'
        }, {
            text: 'Area (square kms)',
            sortable: true,
            dataIndex: 'area',
            groupable: false,
            width: 80,
            summaryType: 'sum',
            summaryFormatter: 'number("0.00")',
            formatter: 'number("0.00")'
        }, {
            text: 'Part of total population',
            sortable: true,
            dataIndex: 'populationPart',
            // flex: 1,
            groupable: false,
            width: 250,
            summaryType: 'sum',
            summaryFormatter: 'number("0.00%")',
            formatter: 'number("0.00%")'
        }
    ],

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
        // reconfigure: function (grid, store, columns, oldStore, oldColumns) {
        //     if (store !== oldStore) {
        //         if (oldStore) {
        //             oldStore.removeListener('datachanged', grid.getController().onStoreDataChanged);
        //             oldStore.removeListener('beforeload', grid.getController().onStoreBeforeLoad);
        //             oldStore.removeListener('load', grid.getController().onStoreLoad);
        //         }
        //         if (store) {
        //             store.addListener('datachanged', grid.getController().onStoreDataChanged, grid.getController());
        //             store.addListener('beforeload', grid.getController().onStoreBeforeLoad, grid.getController());
        //             store.addListener('load', grid.getController().onStoreLoad, grid.getController());
        //         }
        //         var sb = grid.lookupReference("statusGrid")
        //         grid.updateStatusBar();
        //         if (store && store.isLoading()) {
        //             if (sb) {
        //                 sb.showBusy();
        //             }
        //         }
        //     }
        //     // grid.getView().refresh();
        //     // grid.resumeLayouts();
        // },

        selectionchange: function (selModel, selected) {
            var store = selModel.getStore();
            store.beginUpdate();
            store.each(function(rec){
                if (rec.get('selected') && ! selected.some(function(sel){
                    return rec.getId() === sel.getId();
                })) {
                    rec.set('selected', false);
                }
            });
            selected.forEach(function(selRec){
                if (!selRec.get('selected')) {
                    selRec.set('selected', true);
                }
            });
            store.endUpdate();
        }

        // selectionchange: function (grid, selected) {
        //     var store = grid.getStore(),
        //         filters = store.getFilters();
        //     // if(filters !== undefined && filters.getByKey('filterselected')){
        //     //     if(grid.getSelection().length == 0){
        //     //         store.removeFilter('filterselected');
        //     //     } else {
        //     //         store.removeFilter('filterselected', true);
        //     //         var ids = grid.getSelection().map(function (item) {
        //     //             return item.id;
        //     //         });
        //     //         var fltr = new Ext.util.Filter({
        //     //             property: 'id',
        //     //             id: 'filterselected',
        //     //             operator: 'in',
        //     //             value: ids
        //     //         });
        //     //         store.addFilter(fltr);
        //     //     }
        //     // }
        //     // this.updateStatusBar();
        // }
    }
});
