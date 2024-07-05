Ext.define('Bigmedia.store.DimensionStore', {
    extend: 'Ext.data.Store',
    alias: 'store.dimensionstore',

    config: {
        dimensions: null
    },

    bgLoading: false,

    dimStore: {},

    dimStores: {},

    // bulkUpdateMode: 'complete',

    updateDimensions: function (newVal, oldVal) {
        // return;
        // console.log('before update dimensions');
        var me = this;
        if (newVal) {
            newVal.forEach(function(dim){
                if (!me.dimStore[dim]) {
                    me.dimStore[dim] = {};
                }
                if (!me.dimStores[dim]) {
                    me.dimStores[dim] = new Ext.data.Store({
                        fields: ['id', 'name', 'totalCount', 'addCount'],
                        proxy: 'memory',
                        sorters: [{
                            property: 'totalCount',
                            direction: 'DESC'
                        }]
                    });
                }
            });
            var source = me.getData().getSource() || me.getData();
            source.each(function(rec) {
                newVal.forEach(function(dim){
                    if (!me.dimStore[dim]) {
                        me.dimStore[dim] = {};
                    }
                    if (rec.get(dim)) {
                        if (!me.dimStore[dim][rec.get(dim)]) {
                            me.dimStore[dim][rec.get(dim)] = {
                                // items: [],
                                totalCount: 0,
                                count: 0,
                                indexKeys: {}
                            }
                        }
                        // dimStore[dim][rec.get(dim)].items.push(rec);
                        me.dimStore[dim][rec.get(dim)].totalCount++;
                        if(!me.getData().isItemFiltered(rec)) {
                            me.dimStore[dim][rec.get(dim)].count++;
                        }
                        me.dimStore[dim][rec.get(dim)].indexKeys[rec.getId()] = rec;
                    }
                })
            });
        }
        // console.log('after update dimensions');
    },

    syncDimensions: function () {
        // console.log('before sync dimensions');
        var me = this,
            dims = me.getDimensions();
        me.dimStore = {};
        if (!dims) {
            return;
        }
        var dimFilters = {},
            dimChanged = false;
        dims.forEach(function(dim){
            me.dimStore[dim] = {};
            if (me.getFilters() && me.getFilters().getCount() > 0) {
                var filters = me.getFilters().clone();
                if (filters.get('filter' + dim)) {
                    filters.remove(filters.get('filter' + dim));
                }
                if (filters.getCount() > 0) {
                    dimFilters[dim] = Ext.util.Filter.createFilterFn(filters);
                }
            }
        });
        // if (source.getFilters() && Object.keys(me.dimStore).some(function(dim){
        //     return source.getFilters().getById('filter' + dim);
        // })) {
        //     // Store is filtered by one of dimension's
        //     var all = me.getData().getSource() || me.getData();
        //     dims.forEach(function(dim){
        //
        //         source.each(function(rec) {
        //     });
        // } else {
            var source = me.getData().getSource() || me.getData();

            source.each(function(rec) {
                dims.forEach(function(dim){
                    if (rec.get(dim)) {
                        if (!me.dimStore[dim][rec.get(dim)]) {
                            me.dimStore[dim][rec.get(dim)] = {
                                // items: [],
                                totalCount: 0,
                                count: 0,
                                indexKeys: {}
                            }
                        }
                        // dimStore[dim][rec.get(dim)].items.push(rec);
                        me.dimStore[dim][rec.get(dim)].totalCount++;
                        if(!dimFilters[dim] || dimFilters[dim](rec)) {
                            me.dimStore[dim][rec.get(dim)].count++;
                        }
                        me.dimStore[dim][rec.get(dim)].indexKeys[rec.getId()] = rec;
                        dimChanged = true;
                    }
                })
            });
        // }
        dims.forEach(function(dim){
            me.dimStores[dim].beginUpdate();
            // me.dimStores[dim].removeAll();
            Object.keys(me.dimStore[dim]).forEach(function(key){
                if (!me.dimStores[dim].getById(key)) {
                    me.dimStores[dim].add({
                        id: key,
                        name: key,
                        totalCount: me.dimStore[dim][key].totalCount,
                        addCount: me.dimStore[dim][key].count
                    });
                } else {
                    me.dimStores[dim].getById(key).set({
                        totalCount: me.dimStore[dim][key].totalCount,
                        addCount: me.dimStore[dim][key].count
                    })
                }
            });
            me.dimStores[dim].endUpdate();
        });
        if (dimChanged) {
            me.fireEventArgs('dimensionschange',[]);
        }
        // console.log('after sync dimensions');
    },

    listeners: {
        // too slow
        // datachanged: function (store) {
        //     if (!this.isSorting) {
        //         console.log('datachanged');
        //         this.syncDimensions();
        //     }
        // }
        // datachanged: function () {
        //     console.log('datachanged');
        // },
        // beginupdate: function () {
        //     console.log('beginupdate');
        // },
        // beforeprefetch: function () {
        //     console.log('beforeprefetch');
        // },
        // endupdate: function () {
        //     console.log('endupdate');
        // },
        // metachange: function () {
        //     console.log('metachange');
        // },
        // prefetch: function () {
        //     console.log('prefetch');
        // },
        // refresh: function () {
        //     console.log('refresh');
        // },
        // write: function () {
        //     console.log('write');
        // },
        clear: function (store) {
            // console.log('clear');
            this.syncDimensions();
        },
        filterchange: function (store, filters) {
            // console.log('dimstore filterchange');
            var me = this;
            if (me.isLoading() || me.bgLoading) {
                return;
            }
            this.syncDimensions();
        },
        load: function (store) {
            // console.log('dimstore load');
            this.syncDimensions();
        },
        add: function (store, records) {
            // console.log('dimstore add');
            // console.log('add ' + records.length);
            var me = this,
                dims = me.getDimensions(),
                dimFilters = {},
                dimChanged = false;
            if (me.isLoading() || me.bgLoading) {
                return;
            }
            dims.forEach(function(dim){
                if (me.getFilters() && me.getFilters().getCount() > 0) {
                    var filters = me.getFilters().clone();
                    if (filters.get('filter' + dim)) {
                        filters.remove(filters.get('filter' + dim));
                    }
                    if (filters.getCount() > 0) {
                        dimFilters[dim] = Ext.util.Filter.createFilterFn(filters);
                    }
                }
            });
            records.forEach(function(rec){
                Object.keys(me.dimStore).forEach(function(dim){
                    if (rec.get(dim)) {
                        if (!me.dimStore[dim][rec.get(dim)]) {
                            me.dimStore[dim][rec.get(dim)] = {
                                // items: [],
                                totalCount: 0,
                                count: 0,
                                indexKeys: {}
                            }
                        }
                        // dimStore[dim][rec.get(dim)].items.push(rec);
                        me.dimStore[dim][rec.get(dim)].totalCount++;
                        if(dimFilters[dim] && dimFilters[dim](rec)) {
                            me.dimStore[dim][rec.get(dim)].count++;
                        }
                        me.dimStore[dim][rec.get(dim)].indexKeys[rec.getId()] = rec;
                        dimChanged = true;
                    }
                });
            });
            if (dimChanged) {
                me.fireEventArgs('dimensionschange',[]);
            }
        },
        remove: function (store, records) {
            // console.log('dimstore remove ' + records.length);
            var me = this,
                dims = me.getDimensions(),
                dimFilters = {},
                dimChanged = false;
            if (me.isLoading() || me.bgLoading) {
                return;
            }
            dims.forEach(function(dim){
                if (me.getFilters() && me.getFilters().getCount() > 0) {
                    var filters = me.getFilters().clone();
                    if (filters.get('filter' + dim)) {
                        filters.remove(filters.get('filter' + dim));
                    }
                    if (filters.getCount() > 0) {
                        dimFilters[dim] = Ext.util.Filter.createFilterFn(filters);
                    }
                }
            });
            records.forEach(function(rec){
                Object.keys(me.dimStore).forEach(function(dim){
                    if (rec.get(dim) && me.dimStore[dim][rec.get(dim)]) {
                        if (me.dimStore[dim][rec.get(dim)].indexKeys[rec.getId()]) {
                            me.dimStore[dim][rec.get(dim)].totalCount--;
                            if(dimFilters[dim] && dimFilters[dim](rec)) {
                                me.dimStore[dim][rec.get(dim)].count--;
                            }
                            delete me.dimStore[dim][rec.get(dim)].indexKeys[rec.getId()];
                            dimChanged = true;
                        }
                    }
                });
            });
            if (dimChanged) {
                me.fireEventArgs('dimensionschange',[]);
            }
        }
    }

});
