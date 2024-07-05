Ext.define('Bigmedia.view.grid.GridWrapperController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.gridwrappercontroller',

    requires: [
    ],

    init: function (args) {
        var me = this,
            view = me.getView(),
            grid = view.child(),
            detFace = me.lookup('detface');
        me.callParent(args);
        grid.setDetFace(detFace);
        // console.log(args);
        // me.initParamsConfig();
        // Bigmedia.Vars.on('promocodechanged', function(promocode) {
        //     me.initPriceColumn();
        // });

    },

    initParamsConfig: function () {
        var me = this,
            view = me.getView(),
            grid = view.child();
        // console.log(view.getStore());

        if (view.getStore() !== null) {
            grid.setStore(view.getStore());
        }
        if (view.getHideToolBar() !== null) {
            grid.setHideToolBar(view.getHideToolBar());
        }
        if (view.getHideStatusBar() !== null) {
            grid.setStatusBar(view.getHideStatusBar());
        }
        if (view.getShowPrice() !== null) {
            grid.setShowPrice(view.getShowPrice());
        }
        if (view.getShowAddToCart() !== null) {
            grid.setShowAddToCart(view.getShowAddToCart());
        }
        if (view.getShowDelete() !== null) {
            grid.setShowDelete(view.getShowDelete());
        }
        if (view.getMapView() !== null) {
            grid.setMapView(view.getMapView());
        }
        if (view.getShowSupplier() !== null) {
            grid.setShowSupplier(view.getShowSupplier());
        }
        // newVal.enableBubble(['rowclick', 'reconfigure', 'selectionchange', 'focuschange']);
        // me.insert(newVal);
    },

});
