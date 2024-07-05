Ext.define('Bigmedia.store.DataMonitoring', {
    extend: 'Ext.data.Store',
    alias: 'store.DataMonitoring',
    storeId: 'DataMonitoring',

    model: 'Bigmedia.model.MonitoringData',
    // autoLoad: true,

    //refTables: {},
    // model: 'MonitoringData',
    // requires: [
    //     'Bigmedia.model.MonitoringData'
    // ],

    // proxy: {
    //     // type: 'rest',
    //     type: 'ajax',
    //     url: '/api/v1/monitoring/data',
    //     reader: {
    //         type: 'json'
    //         // root: 'data'
    //     },
    // },

    // listeners: {
    //     beforesync: function (options) {
    //         return { update: [], create: [], destroy: [] };
    //     },
    //     beforesort: function (store, sorters, eOpts) {
    //         this.isSorting = true;
    //     },
    //     sort: function (store, eOpts) {
    //         this.isSorting = false;
    //     },
    //     beforeload: function (store) {
    //         var me = this;
    //     },
    //     filterchange: function () {
    //         var me = this;
    //         if (me.isLoading() || me.bgLoading) {
    //           // console.log('filterchange - skipped');
    //             return;
    //         }
    //         console.log('filterchange');
    //         // me.fireEvent('updatemap', me);
    //     },
    //     load: function (store, records, successful, operation, eOpts) {
    //         var me = this;

    //         // var cartStore = Ext.getStore('ShoppingCart');
    //         // if(me.cartRelays === undefined) {
    //         //     me.cartRelays = this.relayEvents(cartStore, ['add', 'remove', 'clear'], 'cart');
    //         // }
    //         if (successful) {
    //             // var sidesStore = Ext.getStore('Sides');
    //             // sidesStore.load();
    //             console.log('here');
    //             // Bigmedia.Vars.updateFacesFinalPrice();
    //         }
    //         // me.fireEventArgs('updatemap', [me]);
    //     }
    // }
})