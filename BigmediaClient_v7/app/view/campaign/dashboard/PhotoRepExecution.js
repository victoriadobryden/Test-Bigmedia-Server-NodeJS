Ext.define('Bigmedia.view.campaign.dashboard.PhotoRepExecution', {
    extend: 'Ext.Panel',
    xtype: 'campphotorepexecution',

    requires: [
        'Ext.chart.PolarChart',
        'Ext.chart.series.Gauge',
        'Ext.ProgressBar',
        'Ext.form.field.ComboBox',
        'Ext.layout.container.VBox',
        'Ext.data.ChainedStore'
    ],

    // requires: [
    //     'Ext.chart.series.Pie',
    //     'Ext.chart.series.sprite.PieSlice',
    //     'Ext.chart.interactions.Rotate',
    //     'Ext.chart.PolarChart'
    // ],

    referenceHolder: true,

    cls: 'service-type shadow',
    height: 320,
    bodyPadding: 15,
    title: Bigmedia.Locales.dashboardPhotorepExecutionTitle,
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
            width: 240,
            padding: '0 20px 0 0',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'polar',
                    colors: [
                        '#aed581',
                        '#6aa5db'
                    ],
                    flex: 1,
                    reference: 'chart',
                    series: [{
                        type: 'gauge',
                        angleField: 'done',
                        minimum: 0,
                        needleLength: 100
                    }]
                },
                {
                    xtype:'component',
                    bind: {
                        data: {
                            status1: Bigmedia.Locales.refServiceOperationStatus[1],
                            status3: Bigmedia.Locales.refServiceOperationStatus[3]
                        }
                    },
                    tpl: '<div class="photorep-legend">' +
                        '<span><div class="legend-tasked"></div>{status1}</span>' +
                        '<span><div class="legend-done"></div>{status3}</span>' +
                    '</div>'
                }
                // {
                //     xtype: 'polar',
                //     reference: 'chart',
                //     flex: 1,
                //     background: 'rgba(255, 255, 255, 1)',
                //     colors: [
                //         '#ffc000',
                //         '#ee929c'
                //     ],
                //     series: [
                //         {
                //             type: 'pie',
                //             useDarkerStrokeColor: false,
                //             xField: 'total',
                //             donut: 50,
                //             padding:0
                //         }
                //     ],
                //     interactions: [
                //         {
                //             type: 'rotate'
                //         }
                //     ]
                // },
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
                    cls: 'bottom-indent photorep-tasked',
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
                            name: Bigmedia.Locales.refServiceOperationStatus[3] + ' ({status3.count})',
                            value: '{status3.percent}'
                        }
                    },
                    tpl: '<div class="left-aligned-div">{name}</div><div class="right-aligned-div">{value:percent}</div>'
                },
                {
                    xtype: 'progressbar',
                    cls: 'bottom-indent photorep-done',
                    height: 4,
                    bind: {
                        value: '{status3.percent}'
                    }
                },
                {
                    flex: 1
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    defaults: {
                        xtype: 'combobox',
                        displayField: 'value',
                        valueField: 'id',
                        forceSelection: true,
                        flex: 1,
                        margin: '0 10px 0 0'
                    },
                    items: [
                        {
                            // xtype: 'combobox',
                            reference: 'filtercities',
                            emptyText: 'City',
                            // displayField: 'value',
                            // valueField: 'id',
                            // forceSelection: true,
                            listeners: {
                                change: function (combo, newVal, oldVal) {
                                    combo.up('campphotorepexecution').onFilterCityChange(combo, newVal, oldVal);
                                }
                            }
                        }, {
                            // xtype: 'combobox',
                            reference: 'filtertypes',
                            emptyText: 'Type',
                            // displayField: 'value',
                            // valueField: 'id',
                            // forceSelection: true,
                            listeners: {
                                change: function (combo, newVal, oldVal) {
                                    combo.up('campphotorepexecution').onFilterTypeChange(combo, newVal, oldVal);
                                }
                            }
                        }, {
                            // xtype: 'combobox',
                            reference: 'filterdates',
                            margin: '0',
                            emptyText: 'Deadline',
                            // displayField: 'value',
                            // valueField: 'id',
                            // forceSelection: true,
                            listeners: {
                                change: function (combo, newVal, oldVal) {
                                    combo.up('campphotorepexecution').onFilterDateChange(combo, newVal, oldVal);
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ],
    onFilterCityChange: function (combo, newVal, oldVal){
        var me = this,
            store = me.runStore,
            comboTypes = me.lookupReference('filtertypes')
            comboDates = me.lookupReference('filterdates');
        store.removeFilter('filterCity');
        if (newVal) {
            store.addFilter(new Ext.util.Filter({
                id: 'filterCity',
                property: 'faceCity',
                operator: '=',
                value: newVal
            }));
        } else {
            me.initFilterCombo(combo, store, 'faceCity', 'faceCity');
        }
        me.initFilterCombo(comboTypes, store, 'type', 'typeName');
        me.initFilterCombo(comboDates, store, 'deadline', 'deadline', Ext.util.Format.date, 'd.m.Y');
        me.recalcData(store);
    },
    onFilterTypeChange: function (combo, newVal, oldVal){
        var me = this,
            store = me.runStore,
            comboCities = me.lookupReference('filtercities'),
            comboDates = me.lookupReference('filterdates');
        store.removeFilter('filterType');
        if (newVal) {
            store.addFilter(new Ext.util.Filter({
                id: 'filterType',
                property: 'type',
                operator: '=',
                value: +newVal
            }));
        } else {
            me.initFilterCombo(combo, store, 'type', 'typeName');
        }
        me.initFilterCombo(comboDates, store, 'deadline', 'deadline', Ext.util.Format.date, 'd.m.Y');
        me.initFilterCombo(comboCities, store, 'faceCity', 'faceCity');
        me.recalcData(store);
    },
    onFilterDateChange: function (combo, newVal, oldVal){
        var me = this,
            store = me.runStore,
            comboTypes = me.lookupReference('filtertypes'),
            comboCities = me.lookupReference('filtercities');
        store.removeFilter('filterDate');
        if (newVal) {
            store.addFilter(new Ext.util.Filter({
                id: 'filterDate',
                property: 'deadline',
                operator: '=',
                value: newVal
            }));
        } else {
            me.initFilterCombo(combo, store, 'deadline', 'deadline', Ext.util.Format.date, 'd.m.Y');
        }
        me.initFilterCombo(comboCities, store, 'faceCity', 'faceCity');
        me.initFilterCombo(comboTypes, store, 'type', 'typeName');
        me.recalcData(store);

        // store.destroy();
    },
    updateDataSource: function (newVal, oldVal) {
        var me = this;
        if (newVal) {
            var comboCities = me.lookupReference('filtercities'),
            comboTypes = me.lookupReference('filtertypes'),
            comboDates = me.lookupReference('filterdates');
            if (me.runStore) {
                comboCities.setValue();
                comboTypes.setValue();
                comboDates.setValue();
                me.runStore.destroy();
            }
            me.runStore = new Ext.data.ChainedStore({
                source: newVal
            });
            me.recalcData(me.runStore);
            me.initFilterCombo(comboCities, me.runStore, 'faceCity', 'faceCity');
            me.initFilterCombo(comboTypes, me.runStore, 'type', 'typeName');
            // comboCities.fullStore = comboCities.getStore();
            me.initFilterCombo(comboDates, me.runStore, 'deadline', 'deadline', Ext.util.Format.date, 'd.m.Y');
            // comboDates.fullStore = comboDates.getStore();
        }
    },
    initFilterCombo: function (combo, store, fieldValue, fieldDisplay, formatFn, formatStr){
        var obj = {};
        store.each(function (record) {
            obj[record.get(fieldValue)] = {display: record.get(fieldDisplay)};
        });
        var data = Object.keys(obj).sort(function(a,b){
            return a - b;
        }).map(function(key){
            return {id: key, value: formatFn ? formatFn(obj[key].display, formatStr) : obj[key].display };
        });
        combo.setStore({data: data});
    },
    recalcData: function (store) {
        var me = this,
            chart = me.lookupReference('chart'),
            grouped = me.getGroupedStore(store),
            vm = me.getViewModel();
        // console.log('count: %d, value: %d', store.getCount(), grouped.getAt(1).get('total'));
        // if (store.getCount() == 0) {
        //     chart.redraw();
        //     return;
        // }
        var total = grouped.sum('total');
        // console.log(chart);
        chart.getSeries()[0].setMaximum(total || 1);
        chart.setStore(grouped);

        vm.set({
            status1: {
                name: Bigmedia.Locales.refServiceOperationStatus[1],
                count: grouped.getAt(0).get('tasked'),
                percent: (total && total != 0) ? grouped.getAt(0).get('tasked')/total : 0
            },
            status3: {
                name: Bigmedia.Locales.refServiceOperationStatus[3],
                count: grouped.getAt(0).get('done'),
                percent: (total && total != 0) ? grouped.getAt(0).get('done')/total : 0
            }
        })
        // grouped.each(function(item){
            // vm.set('status'+item.get('status'), {
            //     name: Bigmedia.Locales.refServiceOperationStatus[item.get('status')],
            //     count: item.get('total'),
            //     percent: (total && total != 0) ? item.get('total')/total : 0
            // });
        // });
    },
    getGroupedStore: function (source) {
        var me = this,
            // store = Ext.create('Ext.data.ChainedStore',{
            //     source: source
            // }),
            tasked = 0, done = 0;
        source.each(function(record){
            if(record.get('photoRecs') && record.get('photoRecs').length>0) {
                done++;
            } else {
                tasked++;
            }
        });
        // var data = [
        //     { status: 1, total: tasked },
        //     { status: 3, total: done }
        // ];
        var data = [{
            tasked: tasked,
            done: done,
            total: tasked + done
        }]
        var groupStore = Ext.create('Ext.data.Store', {
                // fields: [{
                //         name:'status'
                // }, {
                //         name: 'total'
                // }],
                fields: ['tasked', 'done', 'total'],
                data: data
        });
        // store.destroy();
        return groupStore;
    }
});
