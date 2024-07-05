Ext.define('Bigmedia.view.pivot.PivotPlanVariant', {
    extend: 'Ext.pivot.Grid',
    xtype: 'pivot-planvariant',

    requires: [
        'Ext.pivot.Grid'
    ],

    config: {
        source: null
    },

    updateSource: function (newVal) {
        // this.setStore(newVal);
        var store = this.getStore();
        // var store = this.getViewModel().getStore('localStore');
        // var store = Ext.create('Ext.data.Store', {
        //     model: 'Face',
        //     data: [],
        //     proxy: {
        //         type: 'memory'
        //     },
        //     autoLoad: true
        // });
        store.removeAll();
        if (newVal) {
            var recs = [];
            newVal.each(function(f){
                recs.push(f);
            });
            store.add(recs);
            // console.log(store);
            // this.setStore(null);
            this.setStore(store);
            // store.fireEvent('load', store);
        }
        // this.getViewModel().set('source', newVal);
    },

    viewModel: {
        stores: {
            localStore: {
                model: 'Face',
                data: [],
                proxy: {
                    type: 'memory'
                },
                autoLoad: true
            }
        }
    },

    header: false,
    width: 750,
    height: 350,
    // collapsible: true,
    multiSelect: true,

    viewConfig: {
        markDirty: false
    },

    selModel: {
        type: 'rowmodel'
    },

    // Set this to false if multiple dimensions are configured on leftAxis and
    // you want to automatically expand the row groups when calculations are ready.
    startRowGroupsCollapsed: false,
    // enableLocking: true,

    matrix: {
        type: 'local',

        viewLayoutType: 'outline',

        colGrandTotalsPosition: 'first',

        store: new Ext.data.Store({
            model: 'Face',
            data: [],
            proxy: {
                type: 'memory'
            },
            autoLoad: true
        }),

        // collapsibleColumns: true,
        collapsibleRows: true,

        showZeroAsBlank: true,

        textRowLabels: 'City / Size',

        // Configure the aggregate dimensions. Multiple dimensions are supported.
        aggregate: [
            {
                dataIndex: 'finalPrice',
                header: 'Budget',
                aggregator: 'sum',
                width: 80
                ,
                renderer: Ext.util.Format.numberRenderer('0,000')
            }, {
                dataIndex: 'id',
                header: 'Qty',
                aggregator: 'count',
                width: 50
                ,
                renderer: Ext.util.Format.numberRenderer('0,000')
            }, {
                dataIndex: 'finalPrice',
                header: 'Avg. Price',
                aggregator: 'avg',
                width: 80
                ,
                renderer: Ext.util.Format.numberRenderer('0,000')
            }
        ],

        // Configure the left axis dimensions that will be used to generate
        // the grid rows
        leftAxis: [{
            dataIndex: 'city',
            header: 'City',
            width: 80
        }, {
            dataIndex: 'size',
            header: 'Size',
            sortable: false,
            width: 80
        }
        ],

        /**
         * Configure the top axis dimensions that will be used to generate
         * the columns.
         *
         * When columns are generated the aggregate dimensions are also used.
         * If multiple aggregation dimensions are defined then each top axis
         * result will have in the end a column header with children columns
         * for each aggregate dimension defined.
         */
        topAxis: [{
            dataIndex: 'supplier',
            header: 'Supplier'
        }]
    }

    // listeners: {
    //     pivotgroupexpand: 'onPivotGroupExpand',
    //     pivotgroupcollapse: 'onPivotGroupCollapse'
    // },

    // tbar: [{
    //     text: 'Collapsing',
    //     menu: [{
    //         text: 'Collapse all',
    //         handler: 'collapseAll'
    //     },{
    //         text: 'Expand all',
    //         handler: 'expandAll'
    //     }]
    // },{
    //     text: 'Subtotals position',
    //     menu: {
    //         defaults: {
    //             xtype: 'menucheckitem',
    //             group: 'subtotals',
    //             checkHandler: 'subtotalsHandler'
    //         },
    //         items: [{
    //             text: 'First',
    //             checked: true
    //         },{
    //             text: 'Last'
    //         },{
    //             text: 'None'
    //         }]
    //     }
    // },{
    //     text: 'Totals position',
    //     menu: {
    //         defaults: {
    //             xtype: 'menucheckitem',
    //             group: 'totals',
    //             checkHandler: 'totalsHandler'
    //         },
    //         items: [{
    //             text: 'First'
    //         },{
    //             text: 'Last',
    //             checked: true
    //         },{
    //             text: 'None'
    //         }]
    //     }
    // }]
});
