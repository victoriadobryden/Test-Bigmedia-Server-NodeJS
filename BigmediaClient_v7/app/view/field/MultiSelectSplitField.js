Ext.define("Bigmedia.view.field.MultiSelectSplitField", {
    extend: "Ext.Panel",
    xtype: "multiselectsplitfield",

    config: {
        selStore: null,
        searchStore: null,
        dimensionName: null,
        dimensionField: null,
        parentName: null,
        limits: null,
        splitMode: 'splits' // splits or limits
    },

    referenceHolder: true,

    updateSelStore: function (newVal) {
        // console.log(newVal.getCount());
        var me = this;
        me.getViewModel().set('selStore', newVal);
        me.updateLimits(me.getLimits());
    },

    updateSearchStore: function (newVal) {
        var me = this;
        me.getViewModel().set('searchStore', newVal);
        me.updateLimits(me.getLimits());
    },

    updateDimensionName: function (newVal) {
        this.getViewModel().set('dimensionName', newVal);
    },

    updateSplitMode: function (newVal) {
        this.getViewModel().set('splitMode', newVal);
    },

    updateDimensionField: function (newVal) {
        this.getViewModel().set('dimensionField', newVal);
    },

    updateParentName: function (newVal) {
        this.getViewModel().set('gridTitle', Ext.String.format(Bigmedia.Locales.dlgAutoSelectFaces.multiselectGridTitle, this.getDimensionName(), newVal));
    },

    // getSplits: function () {
    //     var me = this,
    //         multiStore = me.getViewModel().getStore('multiStore'),
    //         res = {};
    //     multiStore.each(function(rec){
    //         res[rec.get('name')] = {
    //             min: rec.get('min'),
    //             max: rec.get('max')
    //         };
    //     });
    //     return res;
    // },

    updateLimits: function (newVal) {
        var me = this,
            selStore = me.getViewModel().get('selStore'),
            searchStore = me.getViewModel().get('searchStore');
        if (newVal && selStore && searchStore) {
            Object.keys(newVal).forEach(function(name){
                var recIx = searchStore.findExact('name', name);
                if (recIx >= 0) {
                    var rec = searchStore.getAt(recIx);
                    rec.set({
                        min: newVal[name].min,
                        max: newVal[name].max,
                        limits: newVal[name]
                    });
                    if (selStore.indexOf(rec) < 0) {
                        selStore.add(rec);
                    }
                }
            });
        }
    },

    // onFacesStoreChanged: function (srcStore) {
    //     var me = this,
    //         group = {},
    //         multiStore = me.getViewModel().getStore('multiStore'),
    //         searchStore = me.getViewModel().getStore('searchStore');
    //     srcStore.each(function(rec){
    //         if (!group[rec.get(me.getDimensionField())]) {
    //             group[rec.get(me.getDimensionField())] = [];
    //         }
    //         group[rec.get(me.getDimensionField())].push(rec);
    //     });
    //     // multiStore.removeAll();
    //     var toRemove = [];
    //     multiStore.each(function(rec){
    //         if (!group[rec.get('name')]) {
    //             toRemove.push(rec);
    //         }
    //     });
    //     multiStore.remove(toRemove);
    //     toRemove = [];
    //     searchStore.each(function(rec){
    //         if (!group[rec.get('name')]) {
    //             toRemove.push(rec);
    //         }
    //     });
    //     searchStore.remove(toRemove);
    //     var ms = me.down('multiselector'),
    //         searchGrid = ms && ms.searchPopup ? ms.searchPopup.lookup('searchGrid') : null;
    //     Object.keys(group).forEach(function(key, ix){
    //         var rec = multiStore.findRecord('name', key, 0, false, false, true);
    //         if (!rec) {
    //             var limits = me.getLimits();
    //             rec = {
    //                 name: key,
    //                 count: group[key].length
    //             };
    //             if (limits[key]){
    //                 rec.min = limits[key].min;
    //                 rec.max = limits[key].max;
    //                 rec.limits = limits[key];
    //                 searchStore.add(multiStore.add(rec));
    //             } else {
    //                 if (!searchStore.findRecord('name', key, 0, false, false, true)) {
    //                     searchStore.add(rec);
    //                 }
    //             }
    //         } else {
    //             rec.set('count', group[key].length);
    //         }
    //         // if (limits[key] && searchGrid){
    //         //     searchGrid.getSelectionModel().select([rec]);
    //         // }
    //     });
    //     // searchStore.removeAll();
    //     // Object.keys(group).forEach(function(key, ix){
    //     //     // var limits = me.getLimits();
    //     //     // if (!limits[key]){
    //     //         searchStore.add({
    //     //             name: key,
    //     //             count: group[key].length
    //     //         });
    //     //     // }
    //     // });
    // },

    // width: '100%',
    // height: 80,
    layout: 'fit',
    viewModel: {
        // stores: {
            // multiStore: Ext.create('Ext.data.Store', {
            //     model: 'Split',
            //     listeners: {
            //         update: function (store, record) {
            //             if (record.get('name') === 'BIGMEDIA' && record.get('min')<25) {
            //                 record.set('min', 25);
            //             }
            //         },
            //         remove: function (store, records) {
            //             records.forEach(function(rec){
            //                 if (rec.get('name') === 'BIGMEDIA') {
            //                     store.add(rec);
            //                 }
            //             });
            //         }
            //     }
            //     // fields: [
            //     //     { name: 'id'},
            //     //     { name: 'name', type: 'string'},
            //     //     { name: 'min', type: 'float'},
            //     //     { name: 'max', type: 'float'},
            //     //     { name: 'count', type: 'int'},
            //     //     { name: 'limits'}
            //     // ],
            //     // sorters: 'name'
            // }),
            // searchStore: Ext.create('Ext.data.Store', {
            //     model: 'Split',
            //     sorters: 'name'
            //     // fields: [
            //     //     { name: 'id'},
            //     //     { name: 'name', type: 'string'},
            //     //     { name: 'min', type: 'float'},
            //     //     { name: 'max', type: 'float'},
            //     //     { name: 'count', type: 'int'},
            //     //     { name: 'limits'}
            //     // ]
            // })
        // },
        data: {
            selStore: null,
            searchStore: null,
            dimensionName: null,
            dimensionField: null,
            parentName: null,
            gridTitle: null
        }
    },
    items: [
        {
            xtype: 'multiselector',
            reference: 'multisel',
            autoLoad: true,
            fieldName: 'name',
            plugins: {
                cellediting: {
                    clicksToEdit: 1
                    // triggerEvent: 'cellfocus'
                }
            },
            viewConfig: {
                markDirty: false
            },
            bind: {
                store: '{selStore}',
                title: '{gridTitle}',
                search: {
                    xtype: 'multiselector-search',
                    width: 150,
                    height: 200,
                    field: '{dimensionField}',
                    store: '{searchStore}',
                    makeItems: function () {
                        return [{
                            xtype: 'grid',
                            bind: {
                                store: '{searchStore}'
                            },
                            reference: 'searchGrid',
                            trailingBufferZone: 2,
                            leadingBufferZone: 2,
                            viewConfig: {
                                deferEmptyText: false,
                                emptyText: 'No results.'
                            },
                            listeners: {
                                selectionchange: function (selModel, selection) {
                                    var grid = this,
                                        store = grid.getStore();
                                    store.each(function(rec){
                                        if(!!rec.get('limits') && !selection.some(function(sel){
                                            return sel.getId() === rec.getId();})) {
                                            selModel.select(rec, true);
                                        }
                                    });
                                }
                            }
                        }];
                    }
                },
            },
            // search: {
            //     field: 'name',
            //
            //     bind: {
            //         store: '{multiStore}'
            //     }
            //     // store: {
            //     //     model: 'KitchenSink.model.grid.Employee',
            //     //     sorters: 'name',
            //     //     proxy: {
            //     //         type: 'ajax',
            //     //         limitParam: null,
            //     //         url: '/KitchenSink/Employees'
            //     //     }
            //     // }
            // },
            columns: [{
                bind: {
                    text: '{dimensionName}',
                    hidden: '{splitMode !== "splits"}'
                },
                dataIndex: 'name',
                menuDisabled: true,
                hideable: false,
                width: 150
            }, {
                text: 'Min (%)',
                dataIndex: 'min',
                menuDisabled: true,
                bind: {
                    hidden: '{splitMode !== "splits"}'
                },
                hideable: false,
                width: 80,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0,
                    maxValue: 100
                }
            }, {
                text: 'Max (%)',
                dataIndex: 'max',
                bind: {
                    hidden: '{splitMode !== "splits"}'
                },
                menuDisabled: true,
                hideable: false,
                width: 80,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0,
                    maxValue: 100
                }
            }, {
                bind: {
                    text: '{dimensionName}',
                    hidden: '{splitMode !== "limits"}'
                },
                dataIndex: 'longname',
                menuDisabled: true,
                hideable: false,
                width: 150
            }, {
                text: Bigmedia.Locales.dlgAutoSelectFaces.colLimits,
                dataIndex: 'limit',
                bind: {
                    hidden: '{splitMode !== "limits"}'
                },
                menuDisabled: true,
                hideable: false,
                width: 80,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0
                }
            },{
                text: '',
                xtype: 'actioncolumn',
                flex: 1,
                align: 'end',
                menuDisabled: true,
                hideable: false,
                // width: 40,
                items: [{
                    iconCls: 'x-fa fa-times',
                    tooltip: Bigmedia.Locales.gridBtnRemoveSidesText,
                    // bind: {
                    //     hidden: '{!record.limits}'
                    // },
                    handler: function(grid, rowIndex, colIndex) {
                        var rec = grid.getStore().getAt(rowIndex);
                        if (rec.get('limits')) {
                            return;
                        }
                        grid.getStore().remove(rec);
                        var ms = grid.up('multiselector'),
                            searchGrid = ms.searchPopup.lookup('searchGrid');
                        searchGrid.getSelectionModel().deselect([rec]);
                        // ms.search.deselectRecords([rec]);
                    }
                }]
            }]
        }
    ]
});
