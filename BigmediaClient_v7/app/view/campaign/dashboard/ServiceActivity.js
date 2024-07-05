Ext.define('Bigmedia.view.campaign.dashboard.ServiceActivity', {
    extend: 'Ext.panel.Panel',
    xtype: 'campserviceactivity',

    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Category',
        'Ext.chart.axis.Numeric',
        'Ext.chart.series.Area',
        'Ext.chart.interactions.PanZoom',
        'Ext.data.ChainedStore'
    ],

    referenceHolder: true,

    title: Bigmedia.Locales.dashboardServiceActivityTitle,
    ui: 'light',
    iconCls: 'x-fa fa-paint-brush',
    headerPosition: 'bottom',

    config: {
        dataStore: null
    },

    cls: 'quick-graph-panel shadow',
    height: 130,
    layout: 'fit',

    items: [
        {
            xtype: 'cartesian',
            animation : !Ext.isIE9m && Ext.os.is.Desktop,
            reference: 'chart',
            constrain: true,
            constrainHeader: true,
            background: '#70bf73',
            colors: [
                '#a9d9ab'
            ],
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
                    type: 'area',
                    style: {
                        stroke: '#FFFFFF',
                        'stroke-width': '2px'
                    },
                    useDarkerStrokeColor: false,
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
            });
        store.group('performedAtDay');
        var groups = store.getGroups();
        // console.log(groups);
        // create new store basing on groups array
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
        // console.log(groupStore);
        return groupStore;
    }
});
