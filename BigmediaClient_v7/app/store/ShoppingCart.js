/**
 * Created by Alexander.Ustilov on 01.01.2016.
 */
Ext.define('Bigmedia.store.ShoppingCart', {
    // extend: 'Ext.data.Store',
    extend: 'Bigmedia.store.PlannerStore',

    alias: 'store.shoppingcart',
    storeId: 'ShoppingCart',

    model: 'Bigmedia.model.Face',

    //session: Ext.create('Ext.data.Session'),

    requires: [
        'Bigmedia.model.Base',
        'Bigmedia.store.Faces',
        'Bigmedia.store.PlannerStore'
    ],

    //source: 'Faces',

    //filters: new Ext.util.Filter({
    //    property: 'inCart',
    //    id: 'filter_in_cart',
    //    operator: '=',
    //    value: true
    //})

    //autoLoad: true,

    proxy: {
        type: 'memory'
    }

 /*
     proxy: {
     type: 'jsonp',
     limitParam: null,
     url: 'http://192.168.4.12:3000/data/',
     //url:'/freesides.json',
     reader: {
     type: 'json'
     }
     }
     */
});
