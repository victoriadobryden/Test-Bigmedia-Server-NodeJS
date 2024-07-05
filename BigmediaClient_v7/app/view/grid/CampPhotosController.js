Ext.define('Bigmedia.view.grid.CampPhotosController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.grid-photos',
    
    init: function (args) {
        var me = this;
        me.callParent(args);
        // console.log('args',args)
        // // Bigmedia.Vars.on('promocodechanged', function(promocode) {
        // //     me.initPriceColumn();
        // // });
        // Bigmedia.Vars.on('discountgroupchanged', function(promocode) {
        //     me.initPriceColumn();
        // });
        // Bigmedia.Vars.on('userchanged', function(user) {
        //     me.initPriceColumn();
        // });
    },
    
    onGridRefresh: function () {
        var me = this,
            store = me.getView().getStore();
        // console.log('onGridRefresh',store)
        // store.load(function(){
        //     // console.log('here');
        //     me.getView().getView().refresh();
        //     store.fireEventArgs('datachanged', [store]);
        // });
        // console.log(store.hasListeners);
    },

    onStoreDataChanged: function (store) {
        // console.log('store',store)
        var me = this,
            view = me.getView(),
            store = view.getStore();
        if (store.isLoading() || store.bgLoading) {
            return;
        }
        // console.log('onStoreDataChanged: %o', store.isLoading());
    },

    onStoreBeforeLoad: function (store) {
        // var me = this,
        //     sb = me.lookup('statusGrid');
        // if (sb) {
        //     sb.showBusy();
        // }
    },
    onStoreLoad: function (store) {
        // this.initPriceColumn();
    },
    showSelectedOnlyToggle: function (btn, pressed) {
        var me = this,
            grid = me.getView(),
            store = grid.getStore();
        // console.log('pressed',pressed)
        if (pressed) {
            store.removeFilter('filterselected', true);
            var ids = grid.getSelectionModel().getSelection().map(function (item) {
                return item.id;
            });
            var fltr = new Ext.util.Filter({
                property: 'id',
                id: 'filterselected',
                operator: 'in',
                value: ids
            });
            store.addFilter(fltr);
        } else {
            store.removeFilter('filterselected');
        }
    },
    destroy: function () {
        if (this.timer) {
            window.clearTimeout(this.timer);
        }
        // Ext.Msg.hide();
        this.callParent();
    }
})