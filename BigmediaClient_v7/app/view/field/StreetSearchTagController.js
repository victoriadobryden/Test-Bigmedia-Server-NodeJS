Ext.define('Bigmedia.view.field.StreetSearchTagController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.field-streetsearchtag',

    filterChanged: false,
    suppressRefresh: false,

    init: function (view) {
        this.selStore = new Ext.data.Store({
            model: 'Bigmedia.model.Street'
        });
    },

    listen: {
        store: {
            '#Streets': {
                load: 'onStreetsLoad'
            }
        }
    },

    listeners: {
        // targetstoredatachanged: function () {
        targetstoreadd: function () {
            this.onTargetStoreDataChanged();
        },
        targetstoreremove: function () {
            this.onTargetStoreDataChanged();
        }
    },

    connectToStore: function (targetStore) {
        var me = this,
            tag = me.getView();
        //if(store.refTables){
        //    var refTable = store.refTables[tag.filterField];
        //    tag.setStore(refTable);
        //}
        if (this.storeRelayers) {
            Ext.destroy(this.storeRelayers);
            this.storeRelayers = null;
            var reconnect = true;
        }
        // this.storeRelayers = this.relayEvents(targetStore, ['datachanged'], 'targetstore');
        this.storeRelayers = this.relayEvents(targetStore, ['add', 'remove'], 'targetstore');
        if (reconnect) {
            this.syncAll();
        }
    },

    onStreetsLoad: function (refStore, records, successful, operation, eOpts) {
        if (!successful) {
            return;
        }
        var me = this;
        me.selStore.each(function(selRec){
            refStore.add(selRec);
        });
        me.initTotal();
        if (me.getView().targetStore.getData().filtered) {
            me.syncAll();
        }
        //if (refStore) {
        //    records.forEach(function (refRec) {
        //            var addVal = 0, subVal = 0;
        //            if (store.getData().filtered) {
        //                var faces = refRec.get('faces');
        //                faces.forEach(function (f) {
        //                    if (loaded[f]) {
        //                        addVal++;
        //                    }
        //                    if (missed[f]) {
        //                        subVal++;
        //                    }
        //                });
        //            }
        //            else {
        //                addVal = refRec.get('totalCount') || 0;
        //                subVal = refRec.get('totalCount') || 0;
        //            }
        //            refRec.set({addCount: addVal, subCount: subVal}, {
        //                commit: true,
        //                silent: false
        //            });
        //        }
        //    );
        //}
    },

    onTargetStoreDataChanged: function () {
        var me = this,
            tag = me.getView();
        if (!tag.targetStore.isSorting && !me.suppressRefresh) {
            me.filterChanged = true;
            if (tag.getValue().length > 0) {
                me.syncVisible();
                tag.updateValue();
            }
        }
        me.suppressRefresh = false;
    },

    onTagValueChanged: function (tag, newVal, oldVal) {
        var me = this;
        me.selStore.each(function(selRec){
            var isSelected = Ext.Array.some(newVal,function(selId){
                return selId == selRec.id;
            });
            if(!isSelected){
                me.selStore.remove(selRec);
            }
        });
        if (newVal !== oldVal) {
            var store = tag.targetStore,
                refStore = tag.getStore();
            if (newVal.length > 0) {
                if (oldVal.length > 0) {
                    me.suppressRefresh = true;
                    store.removeFilter('filter' + tag.filterField, true);
                }
                var faces = [];
                newVal.forEach(function (item) {
                    var rec = me.selStore.getById(item);
                    if(!rec){
                        rec = refStore.getById(item);
                        me.selStore.add(rec);
                    }
                    if (rec && rec.get('faces')) {
                        faces = faces.concat(Object.keys(rec.get('faces')));
                    }
                });
                //console.log(faces);
                faces = faces.map(function (f) {
                    return +f;
                });
                //console.log(faces);
                var cityFilter = new Ext.util.Filter({
                    property: 'id',
                    id: 'filter' + tag.filterField,
                    operator: 'in',
                    value: faces
                });
                me.suppressRefresh = true;
                store.addFilter(cityFilter);
            }
            else {
                me.suppressRefresh = true;
                store.removeFilter('filter' + tag.filterField);
            }
        }
    }
    ,

    //onBeforeTagExpand: function () {
    //    var me = this,
    //        view = me.getView();
    //    if (me.filterChanged) {
    //        me.syncAll();
    //        view.getPicker().refresh();
    //    }
    //}
    //,

    initTotal: function () {
        var me = this,
            tag = me.getView(),
            tagStore = tag.getStore();
        tagStore.each(function (rec) {
            var faces = rec.get('faces'),
                loaded = 0;
            if (faces) {
                loaded = Object.keys(faces).length;
            }
            //faces.forEach(function (item) {
            //    if (store.getById(item)) {
            //        loaded++;
            //    }
            //});
            //console.log('loaded: ' + loaded);
            rec.set({totalCount: loaded, addCount: loaded}, {
                commit: true,
                silent: false
            });
        });
    }
    ,

    syncVisible: function () {
        var me = this,
            tag = me.getView(),
            tagStore = tag.getStore(),
            store = tag.targetStore,
            tagVal = tag.getValue(),
            loaded = {};
        if (tagVal.length == 0) {
            return;
        }
        store.each(function (rec) {
            tagVal.forEach(function (refId) {
                var refRec = tagStore.getById(refId);
                if (!refRec) {
                    // console.log(refId);
                }
                else {
                    var faces = refRec.get('faces');
                    if (faces && faces[rec.id]) {
                        if (!loaded[refId]) {
                            loaded[refId] = 1;
                        }
                        else {
                            loaded[refId]++;
                        }
                    }
                }
            });
        });
        tagVal.forEach(function (refId) {
            var rec = tagStore.getById(refId);
            if (rec) {
                rec.set('addCount', loaded[refId]);
            }
        });
    },

    syncAll: function () {
        var me = this,
            tag = me.getView(),
            store = tag.targetStore,
            tagStore = tag.getStore();

        if (store.getData().filtered) {

            var appliedFilters = store.getData().getFilters().clone();
            if (appliedFilters.get('filter' + tag.filterField)) {
                appliedFilters.removeByKey('filter' + tag.filterField);
            }
            if (appliedFilters.length == 0) {
                Ext.destroy(appliedFilters);
                tagStore.each(function (refRec) {
                    refRec.set('addCount', refRec.get('totalCount'));
                });
            } else {
                var clonedData = store.getData().getSource().clone();
                clonedData.setFilters(appliedFilters);
                var loaded = {};

                tagStore.each(function (refRec) {
                    if (!loaded[refRec.id]) {
                        loaded[refRec.id] = 0;
                    }
                    var faces = refRec.get('faces');
                    if (faces) {
                        Object.keys(faces).forEach(function (idf) {
                            if (clonedData.find('id', idf)) {
                                loaded[refRec.id]++;
                            }
                        });
                    }
                });
                tagStore.each(function (refRec) {
                    refRec.set('addCount', loaded[refRec.id]);
                });
                Ext.destroy(clonedData);
                Ext.destroy(appliedFilters);
            }

            //clonedData.each(function (record) {
            //    tagStore.each(function (refRec) {
            //        var faces = refRec.get('faces');
            //        if(!faces){loaded[refRec.id] = 0;}
            //        else if (faces[record.get('id')]) {
            //            if (!loaded[refRec.id]) {
            //                loaded[refRec.id] = 1;
            //            }
            //            else {
            //                loaded[refRec.id]++;
            //            }
            //        }
            //    });
            //    appliedFilters.destroy();
            //    clonedData.destroy();
            //    tagStore.each(function (refRec) {
            //        refRec.set({addCount: loaded[refRec.id]}, {
            //            commit: true,
            //            silent: false
            //        });
            //    });
            //});
        } else {
            tagStore.each(function (refRec) {
                refRec.set({addCount: refRec.get('totalCount')});
            });
        }
    }
});
