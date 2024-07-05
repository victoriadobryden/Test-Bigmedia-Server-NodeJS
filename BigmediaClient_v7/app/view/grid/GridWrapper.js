Ext.define("Bigmedia.view.grid.GridWrapper", {
    xtype: 'gridwrapper',
    extend: "Ext.panel.Panel",

    requires: [
        'Bigmedia.view.grid.GridWrapperController'
    ],

    controller: 'gridwrappercontroller',

    config: {
        // grid: null,
        store: null,
        hideToolBar: null,
        hideStatusBar: null,
        showPrice: null,
        showAddToCart: null,
        showDelete: null,
        mapView: null,
        showSupplier: null
    },

    layout: 'fit',

    // bubbleEvents: [],

    // constructor: function(config) {
    //     console.log(config);
    // },

    getSelectionModel: function () {
        var me = this;
        return me.child().getSelectionModel();
    },

    updateStore: function (newVal) {
        if (!newVal) {
            return;
        }
        var me = this;
        me.child().setStore(newVal);
        // if (me.getGrid() !== null) {
        //     me.getGrid().setStore(newVal);
        // }
    },

    listeners: {
        render: function () {
            var me = this;
            me.getController().initParamsConfig();
        //     var detFace = Ext.create('Bigmedia.view.det.DetFace', {
        //         reference: 'detface',
        //         title: 'Face #',
        //         stateId: 'detFace',
        //         stateful: {
        //             x: true,
        //             y: true,
        //             width: true,
        //             height: true
        //         },
        //         closeAction: 'hide',
        //         // Force the Window to be within its parent
        //         // constrain: true,
        //         // hidden: true,
        //         // autoShow: true,
        //         // alwaysOnTop: true,
        //         x: 0,
        //         y: 0,
        //         width: 300,
        //         heigth: 250,
        //         closable: true
        //     });
        //     var grid = me.items.getAt(0);
        //     if (grid) {
        //         grid.setDetFace(detFace);
        //     }
        //     me.add(detFace);
        }
    },

    items: [
        {
            xtype: 'faces-grid'
        },
        {
            xtype: 'detface',
            reference: 'detface',
            title: 'Face #',
            closeAction: 'hide',
            // Force the Window to be within its parent
            // constrain: true,
            hidden: true,
            // autoShow: true,
            // alwaysOnTop: true,
            x: 0,
            y: 0,
            width: 300,
            heigth: 250,
            closable: true
        }
    ]
});
