Ext.define('Bigmedia.store.PoiLinkCatFaces', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.poilinkcatfaces',
    storeId: 'PoiLinkCatFaces',

    model: 'Bigmedia.model.PoiCategoryFaces',

    requires: [
        'Bigmedia.model.PoiCategoryFaces'
    ],
    autoLoad: false,
    root: {
        id: 0,
        text: 'Categories',
        name: 'Categories',
        expanded: false,
        checked: null
    },
    proxy: {
        //type: 'jsonp',
        type: 'ajax',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'poicat.json',
        //url:'/freesides.json',
        reader: {
            type: 'json'
            //rootProperty: 'root.children'
        }
    }
    //,
    //listeners: {
    //    load: function (refStore, records, successful, operation, eOpts) {
    //        var store = Ext.getStore('Faces');
    //
    //        function mergeFaces (dst, src) {
    //            for (var key in src) {
    //                if (!dst[key]) {
    //                    dst[key] = src[key];
    //                }
    //                else {
    //                    dst[key].d = Math.min(dst[key].d, src[key].d);
    //                    if (dst[key].b == null) {
    //                        dst[key].b = src[key].b;
    //                    }
    //                    else if (src[key].b != null) {
    //                        dst[key].b = Math.min(dst[key].b, src[key].b);
    //                    }
    //                }
    //            }
    //            return dst;
    //        }
    //
    //        var loaded = {}, missed = {};
    //
    //        if (store.getData().filtered) {
    //            var clonedData = store.getData().getSource().clone();
    //            var appliedFilters = store.getData().getFilters().clone();
    //            if (appliedFilters.get('filterpoi')) {
    //                appliedFilters.removeByKey('filterpoi');
    //            }
    //            clonedData.setFilters(appliedFilters);
    //
    //            clonedData.each(function (record) {
    //
    //                if (store.getData().find('id', record.get('id'))) {
    //                    if (!missed[record.get('id')]) {
    //                        missed[record.get('id')] = 1;
    //                    }
    //                    else {
    //                        missed[record.get('id')]++;
    //                    }
    //                }
    //                if (!loaded[record.get('id')]) {
    //                    loaded[record.get('id')] = 1;
    //                }
    //                else {
    //                    loaded[record.get('id')]++;
    //                }
    //            });
    //            appliedFilters.destroy();
    //
    //            clonedData.destroy();
    //        }
    //
    //        function initCategory (rec) {
    //            var totalLoaded = {};
    //            if (rec.childNodes.length > 0) {
    //                var children = rec.childNodes;
    //                children.forEach(function (child) {
    //                    var childLoaded = initCategory(child);
    //                    totalLoaded = mergeFaces(totalLoaded, childLoaded);
    //                });
    //            }
    //            var faces = {};
    //            if (rec.get('faces') && rec.get('faces') !== null) {
    //                faces = rec.get('faces');
    //            }
    //            totalLoaded = mergeFaces(totalLoaded, faces);
    //            var loaded = Object.keys(totalLoaded).length;
    //
    //            var addVal = 0, subVal = 0;
    //
    //            if (store.getData().filtered) {
    //                Object.keys(totalLoaded).forEach(function (f) {
    //                    var id = f;
    //                    if (loaded[id]) {
    //                        addVal++;
    //                    }
    //                    if (missed[id]) {
    //                        subVal++;
    //                    }
    //                });
    //            }
    //            else {
    //                addVal = loaded;
    //                subVal = loaded;
    //            }
    //            rec.set({totalCount: loaded, faces: totalLoaded, addCount: addVal, subCount: subVal}, {
    //                commit: true,
    //                silent: false
    //            });
    //            return totalLoaded;
    //        }
    //
    //        records.forEach(function (rec) {
    //            initCategory(rec);
    //        });
    //    }
    //}
});
