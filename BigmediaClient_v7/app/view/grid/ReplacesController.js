Ext.define('Bigmedia.view.grid.ReplacesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.grid-replaces',

    requires: [
        'Bigmedia.GridExport',
        'Ext.window.MessageBox',
        'Bigmedia.view.dialog.DlgManageFacesForReplace'
    ],

    init: function (args) {
        var me = this;
        me.callParent(args);
        var grid = me.getView(),
            store = grid.getStore(),
            win = grid.up('window');
        if (store) {
            store.addListener('datachanged', grid.getController().onStoreDataChanged, grid.getController());
            store.addListener('beforeload', grid.getController().onStoreBeforeLoad, grid.getController());
            store.addListener('load', grid.getController().onStoreLoad, grid.getController());
        }
        me.dlgManageFaces = Ext.create("Bigmedia.view.dialog.DlgManageFacesForReplace", {
            listeners: {
                show: function () {
                    if (win) {
                        win.setAlwaysOnTop(false);
                    }
                },
                hide: function () {
                    if (win) {
                        win.setAlwaysOnTop(true);
                    }
                }
            }
        });
    },

    onAddClick: function(tableView, rowIndex, colIndex) {
        var rec = tableView.getStore().getAt(rowIndex);
        this.getView().fireEventArgs('addclick', [rec]);
    },

    onReplaceClick: function(tableView, rowIndex, colIndex) {
        var rec = tableView.getStore().getAt(rowIndex),
            replaceFaceId = tableView.lookupViewModel().get('replaceFaceId');
        this.getView().fireEventArgs('replaceclick', [rec, replaceFaceId]);
    },

    onRadiusChange: function (slider, newVal) {
        var me = this;
        me.getView().fireEventArgs('radiuschanged', [newVal]);
    },

    onConfigClick: function (btn) {
        var me = this,
            dlgStore = me.dlgManageFaces.getStore(),
            grid = me.getView(),
            store = grid.getStore();
        (store.getData().getSource() || store.getData()).each(function(face){
            if (face.get('supplier') !== 'BIGMEDIA') {
                if (!dlgStore.getById(face.getId())) {
                    dlgStore.add(face);
                }
            }
        });
        me.dlgManageFaces.showDialog({
            success: function (dlg) {
                var toRemove = [];
                (store.getData().getSource() || store.getData()).each(function(face){
                    if (face.get('supplier') !== 'BIGMEDIA') {
                        if (!dlgStore.getById(face.getId())) {
                            toRemove.push(face);
                        }
                    }
                });
                store.remove(toRemove);
                var toAdd = [];
                (dlgStore.getData().getSource() || dlgStore.getData()).each(function(face){
                    if (face.get('supplier') !== 'BIGMEDIA') {
                        if (!store.getById(face.getId())) {
                            toAdd.push(face.getData());
                        }
                    }
                });
                store.loadRawData(toAdd, true);
                if (toRemove.length || toAdd.length) {
                    me.getView().fireEvent('sourcechanged');
                }
            },
            cancel: function () {

            }
        })
    },
    //
    // onGridShow: function (grid) {
    //     var me = this;
    //     me.initPriceColumn();
    // },

    // addToCart: function () {
    //     var me = this,
    //         grid = me.getView(),
    //         cartStore = Ext.getStore('ShoppingCart'),
    //         gridStore = grid.getStore(),
    //         btn = Ext.getCmp('headercart');
    //
    //     Ext.MessageBox.show({
    //         msg: Bigmedia.Locales.facesPrepareItemsForCartMsg,
    //         progressText: Bigmedia.Locales.facesPrepareItemsProgressText,
    //         width: 300,
    //         wait: {
    //             interval: 200
    //         },
    //         animateTarget: btn
    //     });
    //
    //
    //     me.timer = Ext.defer(function () {
    //         //gridStore.beginUpdate();
    //         //gridStore.suspendEvents(true);
    //         grid.getSelection().forEach(function (rec) {
    //            rec.set({inCart: true, selected: false}, {silent: true});
    //         });
    //         var recs = grid.getSelection();
    //         cartStore.add(recs);
    //         grid.getSelectionModel().deselectAll();
    //         //gridStore.resumeEvents();
    //         //gridStore.endUpdate();
    //         me.timer = null;
    //         Ext.MessageBox.hide();
    //         me.showToast(Bigmedia.Locales.facesPrepareItemsAdded);
    //     }, 500);
    // },
    //
    // addFaceToCartAction: function (grid, rowIndex, colIndex) {
    //     var rec = grid.getStore().getAt(rowIndex);
    //     this.addFaceToCart(rec.getId());
    // },
    //
    // addFaceToCart: function (id) {
    //     var me = this,
    //         grid = me.getView(),
    //         cartStore = Ext.getStore('ShoppingCart'),
    //         gridStore = grid.getStore(),
    //         btn = Ext.getCmp('headercart');
    //
    //     Ext.MessageBox.show({
    //         msg: Bigmedia.Locales.facesPrepareItemsForCartMsg,
    //         progressText: Bigmedia.Locales.facesPrepareItemsProgressText,
    //         width: 300,
    //         wait: {
    //             interval: 200
    //         },
    //         animateTarget: btn
    //     });
    //
    //
    //     me.timer = Ext.defer(function () {
    //         var rec = gridStore.getById(id);
    //         rec.set({inCart: true, selected: false}, {silent: true});
    //         cartStore.add(rec);
    //         me.timer = null;
    //         Ext.MessageBox.hide();
    //         me.showToast(Bigmedia.Locales.facesPrepareItemsAdded);
    //     }, 500);
    // },

    // onDoubleClick: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
    //     //this.redirectTo('face/3345', true);
    //     var mv = this.getView().findParentByType('mainviewport');
    //     if (mv) {
    //         mv.detFace.showFace(record.getId());
    //     }
    // },
    // onHeaderMenuCreate: function (grid, menu) {
    //     menu.insert(menu.items.indexOfKey('columnItem') + 1, {
    //         text: 'Header Borders',
    //         xtype: 'menucheckitem',
    //         checked: grid.headerBorders,
    //         checkHandler: this.onShowHeadersToggle,
    //         scope: this
    //     });
    // },
    //
    // onShowHeadersToggle: function (checkItem, checked) {
    //     this.getView().setHeaderBorders(checked);
    // },

    showToast: function (s, title) {
        Ext.toast({
            html: s,
            //title: title,
            closable: false,
            align: 't',
            slideInDuration: 400,
            minWidth: 400
        });
    }

});
