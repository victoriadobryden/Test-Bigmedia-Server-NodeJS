Ext.define('Bigmedia.view.campaign.dashboard.SidesBars', {
    extend: 'Ext.panel.Panel',
    xtype: 'campsidesbars',

    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Category',
        'Ext.chart.axis.Numeric',
        'Ext.chart.series.Bar',
        'Ext.data.ChainedStore'
    ],

    referenceHolder: true,

    title: Bigmedia.Locales.dashboardSidesTitle,
    ui: 'light',
    iconCls: 'x-fa fa-briefcase',
    headerPosition: 'bottom',

    cls: 'quick-graph-panel shadow',
    height: 130,
    layout: 'fit',

    config: {
        dataStore: null
    },

    items: [
        {
            xtype: 'cartesian',
            reference: 'chart',
            animation : !Ext.isIE9m && Ext.os.is.Desktop,
            height: 75,
            background: '#8561c5',
            colors: [
                '#ffffff'
            ],
            axes: [
                {
                    type: 'category',
                    fields: [
                        'period'
                    ],
                    hidden: true,
                    position: 'bottom'
                },
                {
                    type: 'numeric',
                    fields: [
                        'count'
                    ],
                    grid: {
                        odd: {
                            fill: '#e8e8e8'
                        }
                    },
                    hidden: true,
                    position: 'left'
                }
            ],
            series: [
                {
                    type: 'bar',
                    xField: 'period',
                    yField: [
                        'count'
                    ]
                }
            ],
            interactions: [
                {
                    type: 'panzoom'
                }
            ]
        }
    ],

    updateDataStore: function (newVal, oldVal) {
        if (newVal) {
            var me = this,
                chart = me.lookupReference('chart');
            chart.setStore(me.getGroupedStore());
        }
    },

    getGroupedStore: function () {
        var me = this,
            store = Ext.create('Ext.data.ChainedStore',{
                source: me.getDataStore()
            }),
            periods = me.getPeriods(store),
            data = Object.keys(periods).sort().reduce(function(res, key, i, arr){
                if (i > 0 ) {
                    while (+res[res.length-1].endDate + 1000 * 60 * 60 * 24 < +periods[key].startDate) {
                        var d = new Date(+res[res.length-1].endDate + 1000 * 60 * 60 * 24);
                        res.push({
                            period: Ext.Date.monthNames[d.getUTCMonth()] + "'" + d.getUTCFullYear().toString().slice(-2),
                            startDate: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)),
                            endDate: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 0)),
                            count: 0
                        })
                    }
                }
                res.push({
                    period: periods[key].name,
                    startDate: periods[key].startDate,
                    endDate: periods[key].endDate,
                    count: Object.keys(periods[key].sides).length
                });
                return res;
            }, []);
        var groupStore = Ext.create('Ext.data.Store', {
                fields: [{
                        name: 'period'
                }, {
                        name: 'count'
                }],
                data: data
        });
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
    }
});
