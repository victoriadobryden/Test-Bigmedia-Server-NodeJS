Ext.define("Bigmedia.view.dialog.DlgManagePOI", {
    extend: "Ext.window.Window",

    xtype: 'dlgmanagepoi',

    requires: [
        'Bigmedia.view.grid.ManagePoi',
        'Bigmedia.view.dialog.DlgSearchPoi'
    ],

    config: {
        poiStore: null,
        mapView: null
    },

    // tools: [
    // {
    //     xtype: 'button',
    //     bind: {
    //         pressed: '{showToolbar}'
    //     },
    //     padding: 2,
    //     iconCls: 'x-fa fa-gear',
    //     enableToggle: true
    // }],

    viewModel: {
        data: {
            // poiStore: null,
            // replaceRadius: 300,
            showToolbar: true
        }
    },

    initComponent: function () {
        this.callParent();
        this.enableBubble(['radiuschanged', 'addclick', 'replaceclick', 'sourcechanged']);
    },

    updatePoiStore: function (newVal) {
        // this.getViewModel().set('poiStore', newVal);
        this.lookup('poigrid').setStore(newVal);
    },

    width: 700,
    minWidth: 400,
    height: 250,
    minHeight: 200,
    autoShow: false,
    alwaysOnTop: true,
    closeAction: "hide",
    modal: false,
    closable: true,
    title: 'Manage POI',
    referenceHolder: true,
    layout: 'fit',

    items: [
        {
            xtype: 'managepoi-grid',
            reference: 'poigrid',
            // bind: {
            //     store: '{poiStore}'
            // },
            listeners: {
                // radiuschanged: function (radius) {
                //     this.up('window').fireEventArgs('radiuschanged', [radius]);
                // },
                select: function (selModel, record) {
                    this.up('window').fireEventArgs('recordselected', [record]);
                }
            }
        }
    ]
});
