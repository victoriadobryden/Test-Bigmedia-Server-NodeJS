Ext.define('Bigmedia.view.field.SelectedFilterTagController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.field-selectedfiltertag',

    filterChanged: false,
    suppressRefresh: false,

    listeners: {
        // targetstoredatachanged: function () {
        targetstoreadd: function () {
            console.log('targetstoreadd');
            this.onTargetStoreDataChanged();
        },
        targetstoreremove: function () {
            this.onTargetStoreDataChanged();
        },
        targetstoreupdate: function (store, record, operation, modifiedFieldNames) {
            this.onTargetStoreUpdate(store, record, operation, modifiedFieldNames);
        },
        targetgridselectionchange: function (grid, selected) {
            this.onTargetGridSelectionChange(grid, selected);
        }
    },

    connectToGrid: function (targetGrid) {
        var me = this,
            tag = me.getView();
        if (me.gridRelayers) {
            Ext.destroy(me.gridRelayers);
            me.gridRelayers = null;
            var reconnect = true;
        }
        me.initTotal();
        me.gridRelayers = this.relayEvents(targetGrid, ['selectionchange'], 'targetgrid');
        if (reconnect) {
            me.syncAll();
        }
    },

    connectToStore: function (targetStore) {
        var me = this,
            tag = me.getView();
        if (me.storeRelayers) {
            Ext.destroy(me.storeRelayers);
            me.storeRelayers = null;
            var reconnect = true;
        }
        me.initTotal();
        // me.storeRelayers = this.relayEvents(targetStore, ['datachanged'/*, 'update'*/], 'targetstore');
        me.storeRelayers = this.relayEvents(targetStore, ['add', 'remove'/*, 'update'*/], 'targetstore');
        if (reconnect) {
            me.syncAll();
        }
    },

    onTargetGridSelectionChange: function (selModel, selected) {
        var me = this,
            tag = me.getView(),
            tagStore = tag.getStore(),
            store = tag.targetStore,
            total = (store.getData().getSource() || store.getData()).getCount(),
            allSelected = selModel.getSelection();

        var sel = {}, totalSelectedCount = 0, addSelectedCount = 0, totalUnselectedCount = 0, addUnselectedCount =0;
        //allSelected.forEach(function(selRec){
        //   sel[selRec.getId()]=1;
        //});
        //store.beginUpdate();
        var source = store.getData();
        if(source.filtered){ source = source.getSource();}
        source.each(function(rec){
            //rec.set('selected',!!sel[rec.getId()]);
            recSelected = rec.get('selected');
            if(!store.getData().isItemFiltered(rec)){
                if(recSelected) {
                    //if(sel[rec.getId()]){
                    totalSelectedCount++;
                    addSelectedCount++;
                } else {
                    addUnselectedCount++;
                    totalUnselectedCount++;
                }
            } else {
                if(recSelected){
                    totalSelectedCount++;
                } else {
                    totalUnselectedCount++;
                }
            }
        });
        //store.endUpdate();
        tagStore.beginUpdate();
        tagStore.each(function (refRec) {
            if(refRec.getId() == 0){
                //refRec.set({totalCount: total - allSelected.length, addCount: unselectedCount /*, addCount: total - selected.length*/});
                refRec.set({totalCount: totalUnselectedCount, addCount: addUnselectedCount /*, addCount: total - selected.length*/});
            } else {
                //refRec.set({totalCount: allSelected.length, addCount: selectedCount /*, addCount: selected.length*/});
                refRec.set({totalCount: totalSelectedCount, addCount: addSelectedCount /*, addCount: selected.length*/});
            }
        });
        tagStore.endUpdate();
        tag.updateValue();
    },

    onTargetStoreUpdate: function (store, record, operation, modifiedFieldNames) {
        // console.log('onTargetStoreUpdate');
        if (modifiedFieldNames.some(function (field) {
                return field === 'selected';
            })) {
            var selected = record.get('selected');
            var me = this,
                tag = me.getView(),
                tagStore = tag.getStore();
            tagStore.each(function (refRec) {
                var delta = refRec.getId() === +selected ? 1 : -1;
                refRec.set({
                    totalCount: refRec.get('totalCount') + delta,
                    addCount: refRec.get('addCount') + delta
                })
            });
            //tag.updateValue();
        }
    },

    onTargetStoreDataChanged: function () {
        // console.log('onTargetStoreDataChanged');
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
        var me = this;
        if (newVal !== oldVal) {
            var store = tag.targetStore,
                refStore = tag.getStore();
            if (newVal.length > 0) {
                if (oldVal.length > 0 || newVal.length == 2) {
                    me.suppressRefresh = true;
                    store.removeFilter('filter' + tag.filterField, true);
                    if (newVal.length == 2) {
                        return;
                    }
                }

                //newVal.forEach(function (item) {
                var status = newVal[0] == 1; // status - "selected"
                var selectedFilter = new Ext.util.Filter({
                    property: 'selected',
                    id: 'filter' + tag.filterField,
                    operator: '=',
                    value: status
                });
                if (forceRefresh) {
                    me.suppressRefresh = false;
                    me.forceRefresh = true;
                }
                store.addFilter(selectedFilter);
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
            tagStore = tag.getStore(),
            store = tag.targetStore,
            totalCount = (store.getData().getSource() || store.getData()).getCount(),
            rec = tagStore.getById(0);
        rec.set({totalCount: totalCount, addCount: totalCount});
    },

    syncVisible: function () {
        var me = this,
            tag = me.getView(),
            tagStore = tag.getStore(),
            store = tag.targetStore,
            tagVal = tag.getValue(),
            loaded = {0: 0, 1: 0};
        if (tagVal.length == 0) {
            return;
        }
        store.each(function (rec) {
            tagVal.forEach(function (refId) {
                var refRec = tagStore.getById(refId);
                var selected = refRec.get('selected');
                loaded[+selected]++;
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
                var loaded = {0: 0, 1: 0};
                clonedData.each(function (rec) {
                    var selected = rec.get('selected');
                    loaded[+selected]++;
                });
                tagStore.each(function (refRec) {
                    refRec.set({'addCount': loaded[refRec.getId()]});
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
