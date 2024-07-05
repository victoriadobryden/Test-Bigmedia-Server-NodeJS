Ext.define('Bigmedia.view.campaign.dashboard.Proposals', {
    extend: 'Ext.panel.Panel',
    xtype: 'campproposals',

    requires: [
        // 'Ext.chart.PolarChart',
        // 'Ext.chart.interactions.Rotate',
        // 'Ext.chart.series.Pie3D'
        'Ext.chart.CartesianChart',
        'Ext.chart.series.Bar',
        'Ext.chart.axis.Category',
        'Ext.chart.axis.Numeric',
        'Ext.form.FieldContainer',
        'Ext.form.field.ComboBox',
        'Ext.chart.interactions.PanZoom',
        'Ext.data.ChainedStore'
    ],

    referenceHolder: true,

    cls: 'dashboard-main-chart shadow',
    height: 380,

    bodyPadding: 15,

    config: {
        dataSource: null
    },
    runStore: null,
    periods: null,

    title: Bigmedia.Locales.dashboardProposalsTitle,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    // viewModel: {
    // },

    items: [
        {
            xtype: 'container',
            layout: 'fit',
            flex: 1,
            items: [
                {
                    xtype: 'cartesian',
                    reference: 'chart',
                    // insetPadding: {
                    //     top: 40,
                    //     bottom: 40,
                    //     left: 20,
                    //     right: 40
                    // },
                    // interactions: {
                    //     type: 'itemedit',
                    //     tooltip: {
                    //         renderer: 'onEditTipRender'
                    //     },
                    //     renderer: 'onColumnEdit'
                    // },
                    axes: [{
                        type: 'numeric',
                        position: 'left',
                        increment: 1,
                        // minimum: 30,
                        titleMargin: 20
                        // title: {
                        //     text: 'Temperature in °F'
                        // },
                        // listeners: {
                        //     rangechange: function (axis, range) {
                        //         // this.lookupReference('chart') will fail here,
                        //         // as at the time of this call
                        //         // the chart is not yet in the component tree,
                        //         // so we have to use axis.getChart() instead.
                        //         var chart = axis.getChart(),
                        //             store = chart.getStore(),
                        //             sum = 0,
                        //             mean;
                        //
                        //         store.each(function (rec) {
                        //             sum += rec.get('count');
                        //         });
                        //
                        //         mean = sum / store.getCount();
                        //
                        //         axis.setLimits({
                        //             value: mean,
                        //             line: {
                        //                 title: {
                        //                     text: 'Average: ' + mean.toFixed(2)
                        //                 },
                        //                 lineDash: [2,2]
                        //             }
                        //         });
                        //     }
                        // }
                    }, {
                        type: 'category',
                        position: 'bottom'
                    }],
                    animation: Ext.isIE8 ? false : true,
                    series: {
                        type: 'bar',
                        xField: 'value',
                        yField: 'count',
                        colors: [
                            '#8561c5'
                        ],
                        style: {
                            minGapWidth: 10
                        },
                        highlight: {
                            strokeStyle: 'black',
                            fillStyle: 'gold'
                        },
                        tooltip: {
                            renderer: function (tooltip, record, item) {
                                var xVal = record.get('value');

                                tooltip.setHtml(xVal + ' - ' +
                                    record.get('count') + ' ' + Bigmedia.Locales.dashboardProposalsTooltipSidesText);
                            }
                        },
                        label: {
                            field: 'count',
                            display: 'insideEnd'
                            // ,
                            // renderer: function (value) {
                            //     return value.toFixed(1);
                            // }
                        }
                    },
                    interactions: [
                        {
                            type: 'panzoom'
                        }
                    ]
                    // sprites: {
                    //     type: 'text',
                    //     text: 'Redwood City Climate Data',
                    //     fontSize: 22,
                    //     width: 100,
                    //     height: 30,
                    //     x: 40, // the sprite x position
                    //     y: 20  // the sprite y position
                    // }
                }
                // {
                //     xtype: 'polar',
                //     reference: 'chart',
                //     // platformConfig: {
                //     //     '!phone': {
                //     //         interactions: 'rotate'
                //     //     }
                //     // },
                //     // bind: '{pieData}',
                //     series: [{
                //         type: 'pie3d',
                //         label: {
                //             display: 'outside',
                //             field: 'value'
                //         },
                //         angleField: 'count',
                //         donut: 30
                //     }]
                // }
            ]
        },
        {
            xtype: 'container',
            width: 170,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype:'fieldset',
                    title: Bigmedia.Locales.dashboardProposalsModeLabel,
                    collapsible: true,
                    defaultType: 'combobox',
                    layout: 'anchor',
                    items :[{
                        reference: 'combomode',
                        anchor: '100%',
                        store: {
                            fields: ['id', 'name'],
                            data: [
                                {id: 1, name: Bigmedia.Locales.dashboardProposalsModeCitiesText},
                                {id: 2, name: Bigmedia.Locales.dashboardProposalsModeSizetypesText},
                                {id: 3, name: Bigmedia.Locales.dashboardProposalsModeSidetypesText},
                                {id: 4, name: Bigmedia.Locales.dashboardProposalsModeSuppliersText},
                                {id: 5, name: Bigmedia.Locales.dashboardProposalsModePeriodsText}
                            ]
                        },
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'id',
                        value: 1,
                        listeners: {
                            change: function (combo, newVal, oldVal) {
                                combo.up('campproposals').onModeChange(combo, newVal, oldVal);
                            }
                        }
                    }]
                }, {
                    xtype:'fieldset',
                    title: Bigmedia.Locales.dashboardFilterText,
                    collapsible: true,
                    collapsed: true,
                    defaultType: 'combobox',
                    defaults: {
                        anchor: '100%',
                        queryMode: 'local',
                        displayField: 'value',
                        valueField: 'value',
                        forceSelection: true,
                        listeners: {
                            change: function (combo, newVal, oldVal) {
                                combo.up('campproposals').onFilterChange(combo, newVal, oldVal);
                            }
                        }
                    },
                    layout: 'anchor',
                    items :[
                        {
                            reference: 'filtercities',
                            emptyText: Bigmedia.Locales.dashboardFilterCityEmptyText,
                            filter: {
                                id: 'filterCities',
                                property: 'city'
                            }
                        },
                        {
                            reference: 'filternetworks',
                            emptyText: Bigmedia.Locales.dashboardFilterSidetypeEmptyText,
                            filter: {
                                id: 'filterNetworks',
                                property: 'type'
                            }
                        },
                        {
                            reference: 'filterperiods',
                            emptyText: Bigmedia.Locales.dashboardFilterPeriodEmptyText,
                            displayField: 'value',
                            valueField: 'startDate',
                            listeners: {
                                change: function (combo, newVal, oldVal) {
                                    combo.up('campproposals').onFilterDateChange(combo, newVal, oldVal);
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ],
    onModeChange: function (combo, newVal, oldVal) {
        if (newVal) {
            this.recalcData(this.runStore);
        }
    },
    onFilterChange: function (combo, newVal, oldVal) {
        var me = this,
            store = me.runStore,
            comboCities = me.lookupReference('filtercities'),
            comboPeriods = me.lookupReference('filterperiods'),
            comboNetworks = me.lookupReference('filternetworks');
        if (combo.config.filter) {
            store.removeFilter(combo.config.filter.id);
            if (newVal) {
                store.addFilter(new Ext.util.Filter({
                    id: combo.config.filter.id,
                    property: combo.config.filter.property,
                    operator: '=',
                    value: newVal
                }));
            } else {
                me.initFilterCombo(combo, store);
            }
        }
        me.initFilterCombo((combo==comboCities?comboNetworks:comboCities),store);
        me.initFilterPeriod(comboPeriods, store);
        me.recalcData(store);
    },
    onFilterDateChange: function (combo, newVal, oldVal) {
        var me = this,
            store = me.runStore,
            comboCities = me.lookupReference('filtercities'),
            comboPeriods = me.lookupReference('filterperiods'),
            comboNetworks = me.lookupReference('filternetworks');
        store.removeFilter('filterPeriodStart', true);
        store.removeFilter('filterPeriodEnd');
        if (newVal) {
            store.addFilter(new Ext.util.Filter({
                id: 'filterPeriodStart',
                property: 'endDate',
                operator: '>=',
                value: newVal
            }));
            store.addFilter(new Ext.util.Filter({
                id: 'filterPeriodEnd',
                property: 'startDate',
                operator: '<=',
                value: new Date(Date.UTC(newVal.getUTCFullYear(), newVal.getUTCMonth()+1, 0))
            }));
            me.initFilterCombo(comboCities, store);
        } else {
            me.initFilterPeriod(combo, store);
            // comboDates.setStore(comboDates.fullStore);
        }
        me.initFilterCombo(comboCities, store);
        me.initFilterCombo(comboNetworks, store);
        me.recalcData(store);
    },
    updateAll: function () {
        var me = this,
            comboCities = me.lookupReference('filtercities'),
            comboPeriods = me.lookupReference('filterperiods'),
            comboNetworks = me.lookupReference('filternetworks');
        me.recalcData(me.runStore);
        me.initFilterCombo(comboCities, me.runStore);
        comboCities.fullStore = comboCities.getStore();
        me.initFilterCombo(comboNetworks, me.runStore);
        comboNetworks.fullStore = comboNetworks.getStore();
        me.initFilterPeriod(comboPeriods, me.runStore);
        comboPeriods.fullStore = comboPeriods.getStore();
    },
    updateDataSource: function (newVal, oldVal) {
        var me = this;
        if (newVal) {
            var comboCities = me.lookupReference('filtercities'),
            comboPeriods = me.lookupReference('filterperiods'),
            comboNetworks = me.lookupReference('filternetworks');
            if (me.runStore) {
                comboCities.setValue();
                comboPeriods.setValue();
                comboNetworks.setValue();
                me.runStore.destroy();
            }
            me.runStore = new Ext.data.ChainedStore({
                source: newVal
            });
            me.updateAll();
            newVal.on('load', me.updateAll, me);
            newVal.on('add', me.updateAll, me);
            newVal.on('remove', me.updateAll, me);
            // me.initFilterCombo(comboDates, me.runStore, 'coverAt', 'coverAt', Ext.util.Format.date, 'd.m.Y');
        }
    },
    recalcData: function (store) {
        var me = this,
            chart = me.lookupReference('chart'),
            grouped = me.getGroupedStore(store),
            vm = me.getViewModel();
        chart.setStore(grouped);
        // var total = grouped.sum('total');
        // grouped.each(function(item){
        //     vm.set('status'+item.get('status'), {
        //         name: Bigmedia.Locales.refServiceOperationStatus[item.get('status')],
        //         count: item.get('total'),
        //         percent: (total && total != 0) ? item.get('total')/total : 0
        //     });
        // });
    },
    getGroupedStore: function (source) {
        var me = this,
            store = Ext.create('Ext.data.ChainedStore',{
                source: source
            }),
            comboMode = me.lookupReference('combomode'),
            groupField, data;
        switch(+comboMode.getValue()){
            case 1: groupField = 'city';
               break;
            case 2: groupField = 'size';
               break;
            case 3: groupField = 'type';
               break;
            case 4: groupField = 'supplier';
               break;
        }
        if (groupField) {
            store.group(groupField);
            var groups = store.getGroups();
            // console.log(groups);
            // create new store basing on groups array
            data = groups.items.map(function(item){
                return { value: item.getGroupKey(), count: item.length};
                // return { value: item.getGroupKey() + ' (' + item.length + ')', count: item.length};
            });
        } else { // period mode
            var periods = me.getPeriods(store);
            data = Object.keys(periods).sort().map(function(item){
                var c = Object.keys(periods[item].sides).length;
                return { value: periods[item].name, count: c};
                // return { value: periods[item].name + ' (' + c + ')', count: c};
            });
        }
        var groupStore = Ext.create('Ext.data.Store', {
            fields: [{
                name:'value'
            }, {
                name: 'count'
            }],
            data: data
        });
        store.destroy();
        // console.log(groupStore);
        return groupStore;
    },
    getPeriods: function (store) {
        var periods = {}, key; //{name: ..., sides: [] }
        function addSide (id, d) {
            var k = d.getUTCFullYear() + '-' + (d.getUTCMonth()<10 ? '0' : '') + d.getUTCMonth();
            if (!periods[k]) {
                periods[k] = {
                    name: Ext.Date.monthNames[d.getUTCMonth()] + "'" + d.getUTCFullYear().toString().slice(-2),
                    startDate: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)),
                    endDate: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 0)),
                    sides: {}
                };
            }
            periods[k].sides[id] = 1;
            return k;
        }
        store.each(function(record){
            key = addSide(record.get('sideId'), record.get('startDate'));
            if (key !== record.get('endDate').getUTCMonth() + "-" + record.get('endDate').getUTCFullYear()) {
                var tmp = record.get('startDate');
                tmp = new Date(Date.UTC(tmp.getUTCFullYear(), tmp.getUTCMonth()+1, tmp.getUTCDate()));
                while (tmp <= record.get('endDate')) {
                    addSide(record.get('sideId'), tmp);
                    tmp = new Date(Date.UTC(tmp.getUTCFullYear(), tmp.getUTCMonth()+1, tmp.getUTCDate()));
                }
            }
        });
        return periods;
    },
    initFilterPeriod: function (combo, store) {
        var periods = this.getPeriods(store);
        var data = Object.keys(periods).sort().map(function(key){
            return {id: key, value: periods[key].name, startDate: periods[key].startDate, endDate: periods[key].endDate};
        });
        combo.setStore({data: data});
    },
    initFilterCombo: function (combo, store, formatFn, formatStr) {
        var obj = {},
            fieldValue = combo.config.filter.property,
            fieldDisplay = combo.config.filter.property;
        store.each(function (record) {
            obj[record.get(fieldValue)] = {display: record.get(fieldDisplay)};
        });
        var data = Object.keys(obj).sort(function(a,b){
            return a - b;
        }).map(function(key){
            return {id: key, value: formatFn ? formatFn(obj[key].display, formatStr) : obj[key].display };
        });
        combo.setStore({data: data});
    }
});
