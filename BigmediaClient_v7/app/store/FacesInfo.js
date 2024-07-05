/**
 * Created by Alexander.Ustilov on 04.03.2016.
 */
Ext.define('Bigmedia.store.FacesInfo', {
    //extend: 'GeoExt.data.store.Features',
    extend: 'Ext.data.Store',
    alias: 'store.facesinfo',
    storeId: 'FacesInfo',

    model: 'Bigmedia.model.FaceInfo',

    //session: true,

    requires: [
        'Bigmedia.model.FaceInfo',
        'Ext.data.proxy.JsonP'
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    autoLoad: false
});