Ext.define('Bigmedia.store.CartCoverages', {
    extend: 'Ext.data.Store',

    requires: [
        'Bigmedia.model.Coverage'
    ],

    storeId: 'CartCoverages',

    alias: 'store.cartcoverages',

    idProperty: 'id',

    model: 'Bigmedia.model.Coverage'

});
