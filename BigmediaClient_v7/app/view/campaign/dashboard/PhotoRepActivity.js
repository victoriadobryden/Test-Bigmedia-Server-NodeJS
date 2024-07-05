Ext.define('Bigmedia.view.campaign.dashboard.PhotoRepActivity', {
    extend: 'Ext.panel.Panel',
    xtype: 'campphotorepactivity',

    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Category',
        'Ext.chart.axis.Numeric',
        'Ext.chart.series.Line',
        'Ext.chart.interactions.PanZoom',
        'Ext.panel.Tool',
        'Ext.data.ChainedStore'
    ],

    referenceHolder: true,

    title: Bigmedia.Locales.dashboardPhotosReceivedTitle,
    ui: 'light',
    iconCls: 'x-fa fa-camera',
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
            background: '#35baf6',
            colors: [
                '#483D8B',
                '#94ae0a',
                '#a61120',
                '#ff8809',
                '#ffd13e',
                '#a61187',
                '#24ad9a',
                '#7c7474',
                '#a66111'
            ],
            bind: {
                store: '{earnings}'
            },
            axes: [
                {
                    type: 'category',
                    fields: [
                        'day'
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
                    type: 'line',
                    style: {
                        stroke: '#FFFFFF',
                        'stroke-width': '2px'
                    },
                    xField: 'day',
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
    tools: [
        {
            xtype: 'tool',
            cls: 'quick-graph-panel-tool x-fa fa-ellipsis-v'
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
            store = me.getDataStore();
        store.group('takenAtDay');
        var groups = store.getGroups();
        var data = groups.items.map(function(item){
            return { day: item.getGroupKey(), total: item.length};
        });
        var groupStore = Ext.create('Ext.data.Store', {
                fields: [{
                        name:'day'
                }, {
                        name: 'total'
                }],
                data: data
        });
        return groupStore;
    }
});
