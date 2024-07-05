Ext.define('Bigmedia.view.campaign.dashboard.ServiceOperations', {
    extend: 'Ext.Panel',
    xtype: 'campservices',

    requires: [
        'Ext.chart.series.Pie',
        'Ext.chart.series.sprite.PieSlice',
        // 'Ext.chart.interactions.Rotate',
        'Ext.chart.PolarChart',
        'Ext.ProgressBar',
        'Ext.form.field.ComboBox',
        'Ext.layout.container.VBox',
        'Ext.data.ChainedStore'
    ],

    referenceHolder: true,

    cls: 'service-type shadow',
    height: 320,
    bodyPadding: 15,
    title: Bigmedia.Locales.dashboardServiceOperationsTitle,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    viewModel: {
        data: {
            status1: {
                count: 0,
                percent: 0
            }, //tasked
            status2: {
                count: 0,
                percent: 0
            }, //performing
            status3: {
                count: 0,
                percent: 0
            }  //done
        }
    },

    config: {
        dataSource: null
    },

    runStore: null,

    items: [
        {
            xtype: 'container',
            width: 170,
            padding: '0 20px 0 0',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'polar',
                    reference: 'chart',
                    // height:126,
                    flex: 1,
                    // insetPadding: '7.5 7.5 7.5 7.5',
                    background: 'rgba(255, 255, 255, 1)',
                    colors: [
                        '#ffc000',
                        '#6aa5db',
                        '#ee929c'
                    ],
                    // bind: '{servicePerformance}',
                    series: [
                        {
                            type: 'pie',
                            // label: {
                            //     field: 'status',
                            //     display: 'rotate',
                            //     contrast: true,
                            //     font: '12px Arial'
                            // },
                            useDarkerStrokeColor: false,
                            xField: 'total',
                            donut: 50,
                            padding:0
                        }
                    ],
                    interactions: [
                        {
                            type: 'rotate'
                        }
                    ]
                }, {
                    xtype: 'combobox',
                    reference: 'filtercities',
                    displayField: 'value',
                    valueField: 'id',
                    forceSelection: true,
                    emptyText: Bigmedia.Locales.dashboardFilterCityEmptyText,
                    listeners: {
                        change: function (combo, newVal, oldVal) {
                            combo.up('campservices').onFilterCityChange(combo, newVal, oldVal);
                        }
                    }
                }, {
                    xtype: 'combobox',
                    reference: 'filterdates',
                    displayField: 'value',
                    valueField: 'id',
                    emptyText: Bigmedia.Locales.dashboardFilterCoverDateEmptyText,
                    forceSelection: true,
                    listeners: {
                        change: function (combo, newVal, oldVal) {
                            combo.up('campservices').onFilterDateChange(combo, newVal, oldVal);
                        }
                    }
                }
            ]
        },
        {
            xtype: 'container',
            flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype:'component',
                    bind: {
                        data: {
                            name: Bigmedia.Locales.refServiceOperationStatus[1] + ' ({status1.count})',
                            value: '{status1.percent}'
                        }
                    },
                    tpl: '<div class="left-aligned-div">{name}</div><div class="right-aligned-div">{value:percent}</div>'
                },
                {
                    xtype: 'progressbar',
                    cls: 'bottom-indent service-tasked',
                    height: 4,
                    minHeight: 4,
                    bind: {
                        value: '{status1.percent}'
                    }
                },
                {
                    xtype:'component',
                    bind: {
                        data: {
                            name: Bigmedia.Locales.refServiceOperationStatus[2] + ' ({status2.count})',
                            value: '{status2.percent}'
                        }
                    },
                    tpl: '<div class="left-aligned-div">{name}</div><div class="right-aligned-div">{value:percent}</div>'
                },
                {
                    xtype: 'progressbar',
                    cls: 'bottom-indent service-performing',
                    height: 4,
                    minHeight: 4,
                    bind: {
                        value: '{status2.percent}'
                    }
                },
                {
                    xtype:'component',
                    bind: {
                        data: {
                            name: Bigmedia.Locales.refServiceOperationStatus[3] + ' ({status3.count})',
                            value: '{status3.percent}'
                        }
                    },
                    tpl: '<div class="left-aligned-div">{name}</div><div class="right-aligned-div">{value:percent}</div>'
                },
                {
                    xtype: 'progressbar',
                    cls: 'bottom-indent service-done',
                    height: 4,
                    bind: {
                        value: '{status3.percent}'
                    }
                },
                {
                    xtype:'component',
                    bind: {
                        data: {
                            status1: Bigmedia.Locales.refServiceOperationStatus[1],
                            status2: Bigmedia.Locales.refServiceOperationStatus[2],
                            status3: Bigmedia.Locales.refServiceOperationStatus[3]
                        }
                    },
                    tpl:
                    // '<div class="services-text">'+
                    //     'Наша сервисная служба старалась из последних сил провести поклеечную в сжатые сроки. '+
                    //     'Ни суровые погодные условия, ни задержки плакатов, ни буйство ОРВИ не помешали нам выполнить свою работу. '+
                    //     'Благодаря слаженной работе всех подразделений нашей компании, Ваш рекламный меседж был доставлен потребителю качественно и в срок.'+
                    // '</div>' +
                    '<div class="services-legend">' +
                        '<span><div class="legend-tasked"></div>{status1}</span>' +
                        '<span><div class="legend-performing"></div>{status2}</span>' +
                        '<span><div class="legend-done"></div>{status3}</span>' +
                    '<div>'
                }
            ]
        }
    ],
    onFilterCityChange: function (combo, newVal, oldVal){
        var me = this,
            // source = me.getDataSource(),
            // store = new Ext.data.ChainedStore({
            //     source: source
            // });
            store = me.runStore,
            comboDates = me.lookupReference('filterdates');
        store.removeFilter('filterCity');
        if (newVal) {
            store.addFilter(new Ext.util.Filter({
                id: 'filterCity',
                property: 'faceCity',
                operator: '=',
                value: newVal
            }));
            me.initFilterCombo(comboDates, store, 'coverAt', 'coverAt', Ext.util.Format.date, 'd.m.Y');
        } else {
            me.initFilterCombo(combo, store, 'faceCity', 'faceCity');
            comboDates.setStore(comboDates.fullStore);
        }
        me.recalcData(store);
    },
    onFilterDateChange: function (combo, newVal, oldVal){
        var me = this,
        // source = me.getDataSource(),
        // store = new Ext.data.ChainedStore({
        //     source: source
        // });
            store = me.runStore,
            comboCities = me.lookupReference('filtercities');
        store.removeFilter('filterDate');
        if (newVal) {
            store.addFilter(new Ext.util.Filter({
                id: 'filterDate',
                property: 'coverAt',
                operator: '=',
                value: newVal
            }));
            me.initFilterCombo(comboCities, store, 'faceCity', 'faceCity');
        } else {
            me.initFilterCombo(combo, store, 'coverAt', 'coverAt', Ext.util.Format.date, 'd.m.Y');
            comboCities.setStore(comboCities.fullStore);
        }
        me.recalcData(store);

        // store.destroy();
    },
    updateDataSource: function (newVal, oldVal) {
        var me = this;
        if (newVal) {
            var comboCities = me.lookupReference('filtercities'),
            comboDates = me.lookupReference('filterdates');
            if (me.runStore) {
                comboCities.setValue();
                comboDates.setValue();
                me.runStore.destroy();
            }
            me.runStore = new Ext.data.ChainedStore({
                source: newVal
            });
            me.recalcData(me.runStore);
            me.initFilterCombo(comboCities, me.runStore, 'faceCity', 'faceCity');
            comboCities.fullStore = comboCities.getStore();
            me.initFilterCombo(comboDates, me.runStore, 'coverAt', 'coverAt', Ext.util.Format.date, 'd.m.Y');
            comboDates.fullStore = comboDates.getStore();
        }
    },
    initFilterCombo: function (combo, store, fieldValue, fieldDisplay, formatFn, formatStr){
        var obj = {};
        // console.log(store);
        store.each(function (record) {
            obj[record.get(fieldValue)] = {display: record.get(fieldDisplay)};
        });
        var data = Object.keys(obj).sort(function(a,b){
            return a - b;
        }).map(function(key){
            return {id: key, value: formatFn ? formatFn(obj[key].display, formatStr) : obj[key].display };
        });
        // console.log(data);
        combo.setStore({data: data});
    },
    // initFilters: function (store) {
    //     var me = this
    //         comboCities = me.lookupReference('filtercities'),
    //         comboDates = me.lookupReference('filterdates'),
    //         // store = Ext.create('Ext.data.ChainedStore',{
    //         //     source: source
    //         // }),
    //         cities = {}, dates = {};
    //     store.each(function (record) {
    //         cities[record.get('faceCityId')] = {name: record.get('faceCity')};
    //         dates[record.get('coverAt')] = {day: record.get('coverAt')};
    //     });
    //     var citiesArr = Object.keys(cities).map(function(key){
    //         return {id: key, value: cities[key].name};
    //     });
    //     var datesArr = Object.keys(dates).sort(function(a,b){
    //         return a - b;
    //     }).map(function(key){
    //         return {id: key, value: Ext.util.Format.date(key,'d.m.Y')};
    //     });
    //     comboCities.setStore({data: citiesArr});
    //     comboDates.setStore({data: datesArr});
    //     store.destroy();
    // },
    recalcData: function (store) {
        var me = this,
            chart = me.lookupReference('chart'),
            grouped = me.getGroupedStore(store),
            vm = me.getViewModel();
        chart.setStore(grouped);
        var total = grouped.sum('total');
        grouped.each(function(item){
            vm.set('status'+item.get('status'), {
                name: Bigmedia.Locales.refServiceOperationStatus[item.get('status')],
                count: item.get('total'),
                percent: (total && total != 0) ? item.get('total')/total : 0
            });
        });
    },
    getGroupedStore: function (source) {
        var me = this,
            store = Ext.create('Ext.data.ChainedStore',{
                source: source
            });
        store.group('status');
        var groups = store.getGroups();
        // console.log(groups);
        // create new store basing on groups array
        // var data = groups.items.map(function(item){
        //     return { status: item.getGroupKey(), total: item.length};
        // });
        var data = [
            { status: 1, total: groups.map[1] ? groups.map[1].length : 0 },
            { status: 2, total: groups.map[2] ? groups.map[2].length : 0 },
            { status: 3, total: groups.map[3] ? groups.map[3].length : 0 }
        ];
        var groupStore = Ext.create('Ext.data.Store', {
                fields: [{
                        name:'status'
                }, {
                        name: 'total'
                }],
                data: data
        });
        store.destroy();
        // console.log(groupStore);
        return groupStore;
    }
});
