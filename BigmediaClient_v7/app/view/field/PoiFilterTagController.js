Ext.define('Bigmedia.view.field.PoiFilterTagController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.field-poifiltertag',

    //requires: [
    //    "Bigmedia.view.dialog.DlgPoiCategories"
    //],

    filterChanged: false,
    suppressRefresh: false,

    listeners: {
        // targetstoredatachanged: function () {
        targetstoreadd: function () {
            this.onTargetStoreDataChanged();
        },
        targetstoreremove: function () {
            this.onTargetStoreDataChanged();
        }
    },

    newPoiFilterClick: function () {
        //var w = Ext.create("Bigmedia.view.dialog.DlgPoiCategories", {modal: true, cbPoiTag: this.getView()});
        //var w = new Bigmedia.view.dialog.DlgPoiCategories({modal: true, cbPoiTag: this.getView()});
        //var w = new Ext.window.Window({modal: true, autoDestroy: true, width: 400, height: 500, hidden: true});
        //w.show();
        var me = this,
            mv = me.getView().findParentByType('mainviewport');
        if(mv){
            //mv.dlgPoiCat.cbPoiTag = me.getView();
            mv.dlgPoiCat.showDialog(me.getView());
        }
    },

    connectToStore: function (targetStore) {
        var me = this,
            tag = me.getView();
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

    onTargetStoreDataChanged: function () {
        // console.log('targetstorechanged');
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

    onTagValueChanged: function (tag, newVal, oldVal, forceRefresh) {
        // console.log('filterPOIchange');
        var me = this;
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
                    var rec = refStore.getById(item);
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
                if(forceRefresh){
                    me.suppressRefresh = false;
                    me.forceRefresh = true;
                }
                store.addFilter(cityFilter);
            }
            else {
                me.suppressRefresh = true;
                store.removeFilter('filter' + tag.filterField);
            }
        }
    },

    onBeforeTagExpand: function () {
        var me = this,
            view = me.getView();
        if (me.filterChanged) {
            me.syncAll();
            view.getPicker().refresh();
        }
    },

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
        } else {
            tagStore.each(function (refRec) {
                refRec.set({addCount: refRec.get('totalCount')});
            });
        }
    }
});
