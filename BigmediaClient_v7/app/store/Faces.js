Ext.define('Bigmedia.store.Faces', {
    extend: 'Ext.data.Store',
    // extend: 'Bigmedia.store.DimensionStore',
    alias: 'store.faces',
    storeId: 'Faces',

    model: 'Bigmedia.model.Face',

    refTables: {},

    // dimensions: ['city', 'size', 'network', 'catab'],

    statefulFilters: true,

    requires: [
        'Bigmedia.model.Base',
        'Ext.data.proxy.JsonP',
        'Bigmedia.store.DimensionStore'
    ],

    // autoLoad: true,

    // filters: [new Ext.util.Filter({
    //     property: 'busy',
    //     id: 'filter_busy',
    //     operator: '!=',
    //     value: 1
    // })
    // ],

    proxy: {
        type: 'ajax',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: '/api/v1/data?face=1&locale=' + Bigmedia.Locales.currentLocale,
        // url: 'face.json',
        reader: {
            type: 'json'
        }
    },

    updateCartFilter: function () {
        var me = this,
            cartStore = Ext.getStore('ShoppingCart'),
            cartSource = cartStore.filtered ? cartStore.getData().getSource : cartStore.getData();
        if (cartSource.getCount() == 0) {
            me.removeCartFilter();
            return;
        }
        var ids = cartSource.getValues('id');
        me.removeFilter('filtercart', true);
        var cartFilter = new Ext.util.Filter({
            property: 'id',
            id: 'filtercart',
            operator: 'notin',
            value: ids
        });
        me.addFilter(cartFilter);
    },

    removeCartFilter: function () {
        this.removeFilter('filtercart');
    },

    listeners: {
        cartadd: function () {
            this.updateCartFilter();
        },
        cartremove: function () {
            this.updateCartFilter();
        },
        cartclear: function () {
            this.removeCartFilter();
        },
        beforesync: function (options) {
            return {update: [], create: [], destroy: []};
        },
        // beforeload: function (store) {
        //     var sb = Ext.getCmp('statusGrid');
        //     if (sb) {
        //         sb.showBusy();
        //     }
        // },
        // datachanged: function (store, eOpts) {
            // console.log('datachanged');
        //     if (!this.isSorting) {
        //         var grid = Ext.getCmp("gridFaces");
        //         if (grid && (grid.updateStatusBar)) {
        //             grid.updateStatusBar();
        //         }
        //         // this.syncMap();
        //     }
        // },
        beforesort: function (store, sorters, eOpts) {
            this.isSorting = true;
        },
        sort: function (store, eOpts) {
            this.isSorting = false;
        },
        beforeload: function (store) {
            var me = this;
            // console.log('start worker');
            me.bgLoading = true;
            me.fireEvent('beforeworkerload', me);
            var loadWorker = new Worker('packages/local/workers/loadfaces.min.js?v=2');
            loadWorker.onmessage = function (msg) {
                if (msg.data.error) {
                    console.error('load failed: %o', msg.data.error);
                    me.bgLoading = false;
                } else {
                    // console.log('worker calculated');
                    // me.beginUpdate();
                    me.loadRawData(msg.data.faces);
                    // me.endUpdate();
                    // console.log('records added');
                    var sidesStore = Ext.getStore('Sides');
                    sidesStore.loadRawData(msg.data.sides, true);
                    // me.syncDimensions();
                    me.bgLoading = false;
                    me.fireEventArgs('load', [me, store.getData().getSource() || store.getData(), true]);
                    me.fireEvent('workerload');
                    // console.log('end worker');
                    // me.fireEvent('updatemap', me);
                }
            }
            loadWorker.postMessage({locale: Bigmedia.Locales.currentLocale});
            return false;
        },
        // add: function () {
        //     var me = this;
        //     if (me.isLoading() || me.bgLoading) {
        //         return false;
        //     }
        //     // console.log('add');
        // },
        // endupdate: function () {
        //     var me = this;
        //     if (me.isLoading() || me.bgLoading) {
        //         return false;
        //     }
        //     // console.log('endupdate');
        // },
        filterchange: function () {
            var me = this;
            if (me.isLoading() || me.bgLoading) {
              // console.log('filterchange - skipped');
                return;
            }
            // console.log('filterchange');
            me.fireEvent('updatemap', me);
        },
        // update: function () {
        //     var me = this;
        //     if (me.isLoading() || me.bgLoading) {
        //         return false;
        //     }
        //     // console.log('update');
        // },
        load: function (store, records, successful, operation, eOpts) {
            var me = this;
            // if (me.bgLoading) {
            //     return false;
            // }
            // console.log('load');
            // var sidesStore = Ext.getStore('Sides');
            // if (records) {
            //     store.beginUpdate();
            //     records.forEach(function(rec){
            //         // console.log([rec, sides()]);
            //         if (rec.sides().count() > 0) {
            //             var occ = [];
            //             rec.sides().each(function(side){
            //                 occ.push(side.get('occ'));
            //                 if (!sidesStore.getById(side.getId())) {
            //                     sidesStore.add(side);
            //                 }
            //             });
            //             rec.set('occupancy', occ);
            //             // rec.set('occupancy', rec.sides().first().get('occ'));
            //         }
            //     });
            //     store.endUpdate();
            // }
            var cartStore = Ext.getStore('ShoppingCart');
            if(me.cartRelays === undefined) {
                me.cartRelays = this.relayEvents(cartStore, ['add', 'remove', 'clear'], 'cart');
            }
            if (successful) {
                // var sidesStore = Ext.getStore('Sides');
                // sidesStore.load();
                // console.log('here');
                Bigmedia.Vars.updateFacesFinalPrice();
            }
            me.fireEventArgs('updatemap', [me]);
        }
    },
    // syncMap: function () {
    //     console.log('syncMap');
    //     var features = [];
    //     var store = this,
    //         map = Ext.getCmp("MainMap") || Ext.getCmp("TestMap"),
    //         layer = map ? map.facesLayer : null;
    //     if (!layer) {
    //         return;
    //     }
    //     store.getData().each(function (item) {
    //         if (item.data.geometry !== null) {
    //             var f = new ol.Feature(item.data);
    //             f.setId(item.getId());
    //             //f.set('angle',item.get('angle'));
    //             features.push(f);
    //         }
    //     });
    //     layer.getSource().clear(true);
    //     layer.getSource().addFeatures(features);
    // },
    // initRefTables: function () {
    //     console.log('initRefTables');
    //     var me = this;
    //     var refFields = [];
    //     Object.keys(me.refTables).forEach(function (refName) {
    //         Ext.destroy(me.refTables[refName]);
    //         delete me.refTables[refName];
    //     });
    //     me.model.getFields().forEach(function (field) {
    //         if (me.model.getField('id_' + field.name)) {
    //             refFields.push({field: field.name, loaded: {}});
    //             me.refTables[field.name] = Ext.create('Ext.data.Store', {
    //                 fields: [
    //                     {name: 'id'},
    //                     {
    //                         name: 'name',
    //                         calculate: function (data) {
    //                             var refStore = Ext.getStore(Ext.util.Inflector.pluralize(Ext.String.capitalize(field.name))),
    //                                 rec = refStore.getById(data.id);
    //                             if (rec) {
    //                                 return rec.get('name');
    //                             }
    //                             else {
    //                                 return '';
    //                             }
    //                         }
    //                     },
    //                     {name: 'totalCount', type: 'int', defaultValue: '0'},
    //                     {name: 'addCount', type: 'int', defaultValue: '0'},
    //                     {name: 'subCount', type: 'int', defaultValue: '0'},
    //                     {name: 'visible', type: 'boolean', defaultValue: false}
    //                 ]
    //             });
    //         }
    //     });
    // },
    //
    // loadRefTables: function () {
    //     console.log('loadRefTables');
    //     var me = this,
    //         rt = me.refTables;
    //     me.each(function (rec) {
    //         Object.keys(rt).forEach(function (refTableName) {
    //             var refField = 'id_' + refTableName,
    //                 refId = rec.get(refField),
    //                 refTable = rt[refTableName];
    //             if (refId) {
    //                 var refRec = refTable.getById(refId);
    //                 if (!refRec) {
    //                     refTable.add({id: refId, totalCount: 1, faces: {}});
    //                 } else {
    //                     var total = refRec.get('totalCount');
    //                     total++;
    //                     var faces = refRec.get('faces') || {};
    //                     faces[refId] = refId;
    //                     refRec.set({totalCount: total, addCount: total, faces: faces});
    //                 }
    //             }
    //         });
    //     });
    // },
    //
    // recalcRefTables: function () {
    //     console.log('recalcRefTables');
    //     var me = this,
    //         rt = me.refTables;
    //     Object.keys(rt).forEach(function (refTableName) {
    //         rt[refTableName].each(function (refRec) {
    //             refRec.set('addCount', 0);
    //         });
    //     });
    //     me.each(function (rec) {
    //         Object.keys(rt).forEach(function (refTableName) {
    //             var refField = 'id_' + refTableName,
    //                 refId = rec.get(refField),
    //                 refTable = rt[refTableName];
    //             if (refId) {
    //                 var refRec = refTable.getById(refId);
    //                 if (refRec) {
    //                     var faces = refRec.get('faces');
    //                     if (faces) {
    //                         if (faces[refId]) {
    //                             var addCount = refRec.get('addCount') || 0;
    //                             addCount++;
    //                             refRec.set('addCount', addCount);
    //                         }
    //                     }
    //                 }
    //             }
    //         });
    //     });
    // }
});
