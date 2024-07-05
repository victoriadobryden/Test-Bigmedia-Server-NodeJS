Ext.define('Bigmedia.view.field.RefTagController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.field-reftag',

    filterChanged: false,
    suppressRefresh: false,

    onTargetStoreDataChanged: function () {
        var me = this,
            tag = me.getView();
        // me.syncAll();
        if (!tag.getStore()) {
            return;
        }
        // tag.updateValue();
        tag.getPicker().refresh();
        //return;
        // if (!tag.getTargetStore().isSorting){
        // }
        if (!tag.getTargetStore().isSorting && !me.suppressRefresh) {
            me.filterChanged = true;
            // console.log([tag, tag.getValue()]);
            if (tag.getValue() && ((typeof(tag.getValue()) === 'object' && tag.getValue().length>0) || typeof(tag.getValue()) !== 'object')) {
                me.syncVisible();
                tag.updateValue();
            }
        }
        me.suppressRefresh = false;
    },

    onTargetStoreAdd: function (store, records) {
        var me = this,
            tag = me.getView(),
            tagStore = tag.getStore();
        records.forEach(function(rec){
            tagStore.each(function (refRec) {
                // if (refRec.getId() === rec.get(/*'id_' + */tag.getFilterField())) {
                if (refRec.get('name') === rec.get(/*'id_' + */tag.getFilterField())) {
                    var records = refRec.get('records');
                    if (!records) {
                        records = {};
                        refRec.set('records', records);
                    }
                    records[rec.getId()] = rec.getId();
                    var count = Object.keys(records).length;
                    refRec.set({totalCount: count, addCount: count});
                }
            });
        });
    },

    onTargetStoreRemove: function (store, records) {
        var me = this,
            tag = me.getView(),
            tagStore = tag.getStore();

        records.forEach(function(rec){
            tagStore.each(function (refRec) {
                // if (refRec.getId() === rec.get(/*'id_' + */tag.getFilterField())) {
                if (refRec.get('name') === rec.get(/*'id_' + */tag.getFilterField())) {
                    var records = refRec.get('records');
                    delete records[rec.getId()];
                    var count = Object.keys(records).length;
                    refRec.set({totalCount: count, addCount: count});
                }
            });
        });
    },

    // onTargetStoreDataChanged: function () {
    //     var me = this,
    //         tag = me.getView();
    //     if (!tag.getTargetStore().isSorting && !me.suppressRefresh) {
    //         me.filterChanged = true;
    //         // console.log([tag, tag.getValue()]);
    //         if (tag.getValue() && ((typeof(tag.getValue()) === 'object' && tag.getValue().length>0) || typeof(tag.getValue()) !== 'object')) {
    //             me.syncVisible();
    //             tag.updateValue();
    //         }
    //     }
    //     me.suppressRefresh = false;
    // },

    onTagValueChanged: function (combo, newVal, oldVal) {
        if (newVal !== oldVal) {
            var me = this;
            var store = combo.getTargetStore();
            if (newVal && ((typeof(newVal) === 'object' && newVal.length > 0) || typeof(newVal) !== 'object')) {
                if (oldVal && ((typeof(oldVal) === 'object' && oldVal.length > 0) || typeof(oldVal) !== 'object')) {
                    me.suppressRefresh = true;
                    store.removeFilter('filter' + combo.getFilterField(), true);
                }
                var tagStore = combo.getStore(),
                    defaultValue;
                if ((typeof(newVal) === 'object')) {
                    fVal = newVal.map(function(id){ return tagStore.getById(id).get('name');});
                } else {
                    fVal = tagStore.getById(newVal).get('name');
                }
                var cityFilter = new Ext.util.Filter({
                    property: /*'id_' + */combo.getFilterField(),
                    // id: 'filter' + combo.getFilterField(),
                    id: 'filter' + combo.getFilterField(),
                    operator: (typeof(fVal) === 'object') ? 'in' : '=',
                    value: fVal
                });
                me.suppressRefresh = true;
                store.addFilter(cityFilter);
            }
            else {
                me.suppressRefresh = true;
                store.removeFilter('filter' + combo.getFilterField());
            }
        }
    },

    onBeforeTagExpand: function () {
        var me = this,
            view = me.getView();
        if (!view.getValue() || (typeof(view.getValue()) === 'object' && !view.getValue().length)) {
            me.initTotal();
        }
        if (me.filterChanged) {
            me.syncAll();
            view.getPicker().refresh();
        }
    },

    initTotal: function () {
        var me = this,
            tag = me.getView(),
            tagStore = tag.getStore(),
            store = tag.getTargetStore(),
            loaded = {};

        if (store.dimStore[tag.getFilterField()]) {
            tagStore.each(function (refRec) {
                // var records = {}, count = 0, id = refRec.getId();
                // var records = {}, count = 0, id = refRec.get('name');
                // if (loaded[id]) {
                //     records = loaded[id];
                //     count = Object.keys(records).length;
                // }
                if (store.dimStore[tag.getFilterField()][refRec.get('name')]) {
                    refRec.set({totalCount: store.dimStore[tag.getFilterField()][refRec.get('name')].totalCount, addCount: store.dimStore[tag.getFilterField()][refRec.get('name')].count});
                }
            });
            tag.initialized = true;
            return;
        }

        // console.log([store.getCount(), tagStore.getCount()]);

        // tagStore.each(function (refRec) {
        //     refRec.set({records: {}, totalCount: 0, addCount: 0});
        // });

        var loaded = {};

        store.each(function (item) {
            var val = loaded[item.get(/*'id_' + */tag.getFilterField())];
            if (!val) {
                loaded[item.get(/*'id_' + */tag.getFilterField())] = {};
            }
            loaded[item.get(/*'id_' + */tag.getFilterField())][item.getId()] = item.getId();
        });

        tagStore.each(function (refRec) {
            // var records = {}, count = 0, id = refRec.getId();
            var records = {}, count = 0, id = refRec.get('name');
            if (loaded[id]) {
                records = loaded[id];
                count = Object.keys(records).length;
            }
            refRec.set({records: records, totalCount: count, addCount: count});
        });

        // Object.keys(loaded).forEach(function(key){
        //     var refRec = tagStore.getById(key);
        //     if (refRec) {
        //         var count = Object.keys(loaded[key]).length;
        //         refRec.set({records: loaded[key], totalCount: count, addCount: count});
        //     }
        // });

        tag.initialized = true;
        // store.each(function (item) {
        //     var val = loaded[item.get(/*'id_' + */tag.getFilterField())];
        //     if (!val) {
        //         loaded[item.get(/*'id_' + */tag.getFilterField())] = 1;
        //     } else {
        //         loaded[item.get(/*'id_' + */tag.getFilterField())] = val + 1;
        //     }
        // });
        // tagStore.each(function (refRec) {
        //     refRec.set({totalCount: loaded[refRec.id], addCount: loaded[refRec.id]});
        // });
    },

    syncVisible: function () {
        var me = this,
            tag = me.getView(),
            tagStore = tag.getStore(),
            store = tag.getTargetStore(),
            tagVal = tag.getValue(),
            loaded = {};
        if(tagVal.length == 0){ return; }

        if (store.dimStore[tag.getFilterField()]) {
            tagStore.each(function (refRec) {
                // var records = {}, count = 0, id = refRec.getId();
                // var records = {}, count = 0, id = refRec.get('name');
                // if (loaded[id]) {
                //     records = loaded[id];
                //     count = Object.keys(records).length;
                // }
                if (store.dimStore[tag.getFilterField()][refRec.get('name')]) {
                    refRec.set({totalCount: store.dimStore[tag.getFilterField()][refRec.get('name')].totalCount, addCount: store.dimStore[tag.getFilterField()][refRec.get('name')].count});
                }
            });
            tag.initialized = true;
            return;
        }

        store.each(function (rec) {
            if (!loaded[rec.get(/*'id_' + */tag.getFilterField())]) {
                loaded[rec.get(/*'id_' + */tag.getFilterField())] = 1;
            }
            else {
                loaded[rec.get(/*'id_' + */tag.getFilterField())]++;
            }
        });
        if (typeof(tagVal) === 'object') {
            tagVal.forEach(function (refId) {
                // var rec = tagStore.getById(refId);
                var rec = tagStore.getAt(tagStore.findExact('name', refId));
                if (rec) {
                    rec.set('addCount', loaded[refId]);
                }
            });
        } else {
            // var rec = tagStore.getById(tagVal);
            var rec = tagStore.getAt(tagStore.findExact('name', tagVal));
            if (rec) {
                rec.set('addCount', loaded[tagVal]);
            }
        }
    },

    syncAll: function () {
        var me = this,
            tag = me.getView(),
            store = tag.getTargetStore(),
            tagStore = tag.getStore(),
            idRef = /*'id_' + */tag.getFilterField(),
            loaded = {}, missed = {},
            data;

        if (store.dimStore[tag.getFilterField()]) {
            // console.log('here syncVisible');
            tagStore.each(function (refRec) {
                // var records = {}, count = 0, id = refRec.getId();
                // var records = {}, count = 0, id = refRec.get('name');
                // if (loaded[id]) {
                //     records = loaded[id];
                //     count = Object.keys(records).length;
                // }
                // console.log([refRec.get('name'), store.dimStore[tag.getFilterField()][refRec.get('name')]]);
                if (store.dimStore[tag.getFilterField()][refRec.get('name')]) {
                    refRec.set({totalCount: store.dimStore[tag.getFilterField()][refRec.get('name')].totalCount, addCount: store.dimStore[tag.getFilterField()][refRec.get('name')].count});
                }
            });
            tag.initialized = true;
            return;
        }

        if (store.getData().filtered) {
            var appliedFilters = store.getData().getFilters().clone();
            if (appliedFilters.get('filter' + tag.getFilterField())) {
                appliedFilters.removeByKey('filter' + tag.getFilterField());
            }
            var data = (store.getData().getSource() || store.getData()).createFiltered(appliedFilters);
        } else {
            data = store.getData();
        }

        tagStore.each(function (refRec) {
            var addVal = 0, subVal = 0;
            if (store.getData().filtered) {
                var tagRecords = refRec.get('records');
                if (tagRecords) {
                    addVal = Object.keys(tagRecords).filter(function(recId){
                        return !!data.get(recId);
                    }).length;
                }
                // console.log([tagRecords, addVal]);
                // addVal = loaded[refRec.id] || 0;
                // subVal = missed[refRec.id] || 0;
            }
            else {
                addVal = refRec.get('totalCount') || 0;
                subVal = refRec.get('totalCount') || 0;
            }
            refRec.set({addCount: addVal, subCount: subVal}, {
                commit: true,
                silent: true
            });
        });

        // if (store.getData().filtered) {
        //     var clonedData = store.getData().getSource().clone();
        //     var appliedFilters = store.getData().getFilters().clone();
        //     if (appliedFilters.get('filter' + tag.getFilterField())) {
        //         appliedFilters.removeByKey('filter' + tag.getFilterField());
        //     }
        //     clonedData.setFilters(appliedFilters);
        //     clonedData.each(function (record) {
        //
        //         if (store.getData().find('id', record.id)) {
        //             if (!missed[record.get(idRef)]) {
        //                 missed[record.get(idRef)] = 1;
        //             }
        //             else {
        //                 missed[record.get(idRef)]++;
        //             }
        //         }
        //         if (!loaded[record.get(idRef)]) {
        //             loaded[record.get(idRef)] = 1;
        //         }
        //         else {
        //             loaded[record.get(idRef)]++;
        //         }
        //     });
        //     appliedFilters.destroy();
        //
        //     clonedData.destroy();
        // }

        // tagStore.each(function (refRec) {
        //     var addVal, subVal;
        //     if (store.getData().filtered) {
        //         addVal = loaded[refRec.id] || 0;
        //         subVal = missed[refRec.id] || 0;
        //     }
        //     else {
        //         addVal = refRec.get('totalCount') || 0;
        //         subVal = refRec.get('totalCount') || 0;
        //     }
        //     refRec.set({addCount: addVal, subCount: subVal}, {
        //         commit: true,
        //         silent: true
        //     });
        // });
    }
});
