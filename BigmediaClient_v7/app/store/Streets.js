/**
 * Created by Alexander.Ustilov on 06.03.2016.
 */
Ext.define('Bigmedia.store.Streets', {
    extend: 'Ext.data.Store',
    alias: 'store.streets',
    storeId: 'Streets',

    model: 'Bigmedia.model.Street',

    requires: [
        'Bigmedia.model.Street'
    ],
    autoLoad: false,
    proxy: {
        //type: 'jsonp',
        type: 'ajax',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: '/api/v1/data?street=1&locale=' + Bigmedia.Locales.currentLocale,
        //url: '{entityName:lowercase}.json',
        //url:'/freesides.json',
        reader: {
            type: 'json'
        }
    }
    //listeners: {
    //    load: function( refStore, records, successful, operation, eOpts ){
    //        var store = Ext.getStore('Faces');
    //        records.forEach(function (rec) {
    //            var faces = rec.get('faces');
    //            //console.log(faces);
    //            var loaded = 0;
    //            faces.forEach(function (item) {
    //                if (store.getById(item)) {
    //                    loaded++;
    //                }
    //            });
    //            //console.log('loaded: ' + loaded);
    //            rec.set({totalCount: loaded}, {
    //                commit: true,
    //                silent: true
    //            });
    //        });
    //
    //        if (store.getData().filtered) {
    //            var clonedData = store.getData().getSource().clone();
    //            var loaded = {}, missed = {};
    //            var appliedFilters = store.getData().getFilters().clone();
    //            if (appliedFilters.get('filterstreet')) {
    //                appliedFilters.removeByKey('filterstreet');
    //            }
    //            clonedData.setFilters(appliedFilters);
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
    //        if (refStore) {
    //            records.forEach(function (refRec) {
    //                    var addVal = 0, subVal = 0;
    //                    if (store.getData().filtered) {
    //                        var faces = refRec.get('faces');
    //                        faces.forEach(function (f) {
    //                            if (loaded[f]) {
    //                                addVal++;
    //                            }
    //                            if (missed[f]) {
    //                                subVal++;
    //                            }
    //                        });
    //                    }
    //                    else {
    //                        addVal = refRec.get('totalCount') || 0;
    //                        subVal = refRec.get('totalCount') || 0;
    //                    }
    //                    refRec.set({addCount: addVal, subCount: subVal}, {
    //                        commit: true,
    //                        silent: false
    //                    });
    //                }
    //            );
    //        }
    //    }
    //}

});
