Ext.define('Bigmedia.store.Pois', {
    extend: 'Ext.data.Store',
    alias: 'store.pois',
    storeId: 'Pois',

    model: 'Bigmedia.model.Poi',

    requires: [
        'Bigmedia.model.Poi'
    ],
    autoLoad: false,

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    listeners: {
        load: function( refStore, records, successful, operation, eOpts ){
            // console.log('here');
            // if (successful) {
            //     records.forEach(function(rec){
            //         rec.set({
            //             geometry: Bigmedia.Vars.readFeatureGeometry(rec.get('geometry')),
            //             centroid: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(rec.get('lon')), parseFloat(rec.get('lat'))]))
            //         }
            //         , {
            //             commit: true,
            //             dirty: false
            //         }
            //     );
            // });
            // }
           //var poiFilterStore = Ext.getStore('P')
        }
    }

});
