Ext.define('Bigmedia.view.campaign.dashboard.BudgetBars', {
    extend: 'Ext.panel.Panel',
    xtype: 'campbudgetbars',

    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Category',
        'Ext.chart.axis.Numeric',
        'Ext.chart.series.Bar',
        'Ext.data.ChainedStore'
    ],

    referenceHolder: true,

    title: 'Budget',
    ui: 'light',
    iconCls: 'x-fa fa-usd',
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
            background: '#33abaa',
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
                        'total'
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
                        'total'
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
                            total: 0
                        });
                        // console.log(res[res.length-1]);
                    }
                }
                res.push({
                    period: periods[key].name,
                    startDate: periods[key].startDate,
                    endDate: periods[key].endDate,
                    total: periods[key].total
                });
                return res;
            }, []);
        var groupStore = Ext.create('Ext.data.Store', {
                fields: [{
                        name: 'period'
                }, {
                        name: 'total'
                }],
                data: data
        });
        // console.log(groupStore);
        return groupStore;
    },
    getPeriods: function (store) {
        var periods = {}, key; //{name: ..., sides: [] }
        function addAmount (amount, start, end) {
            if (start && end) {
                var k = start.getUTCFullYear() + '-' + (start.getUTCMonth()<10 ? '0' : '') + start.getUTCMonth(),
                    d = start;
                if (!periods[k]) {
                    periods[k] = {
                        name: Ext.Date.monthNames[d.getUTCMonth()] + "'" + d.getUTCFullYear().toString().slice(-2),
                        startDate: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)),
                        endDate: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 0)),
                        total: 0
                    };
                }
                if (k == end.getUTCFullYear() + '-' + (end.getUTCMonth()<10 ? '0' : '') + end.getUTCMonth()) {
                    periods[k].total += amount;
                } else {
                    var dayInMs = 1000 * 60 * 60 * 24,
                        days = ((+end) - (+start)) / dayInMs,
                        tmp = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth()+1, 1));
                    periods[k].total += amount * ((+tmp) - (+start)) / (dayInMs * days) ;
                    var rest = amount - amount * ((+tmp) - (+start)) / (dayInMs * days) ;
                    if (+tmp < +end) {
                        addAmount(rest, tmp, end);
                    }
                }
            }
        }
        store.each(function (record) {
            addAmount(record.get('total'), record.get('startDate'), record.get('endDate'));
        });
        return periods;
    }
});
