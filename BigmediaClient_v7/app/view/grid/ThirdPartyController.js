Ext.define('Bigmedia.view.grid.ThirdPartyController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.grid-thirdparty',

    requires: [
        'Bigmedia.GridExport',
        'Ext.window.MessageBox'
    ],

    init: function (args) {
        var me = this;
        me.callParent(args);
        var grid = me.getView(),
            store = grid.getStore();
        if (store) {
            store.addListener('datachanged', grid.getController().onStoreDataChanged, grid.getController());
            store.addListener('beforeload', grid.getController().onStoreBeforeLoad, grid.getController());
            store.addListener('load', grid.getController().onStoreLoad, grid.getController());
        }
        var sb = grid.lookupReference("statusGrid")
        grid.updateStatusBar();
        if (store && store.isLoading()) {
            if (sb) {
                sb.showBusy();
            }
        }
        // Bigmedia.Vars.on('promocodechanged', function(promocode) {
        //     me.initPriceColumn();
        // });
    },
    //
    // onGridShow: function (grid) {
    //     var me = this;
    //     me.initPriceColumn();
    // },

    initPriceColumn: function () {
        var me = this,
            grid = me.getView();
            // colPrice = me.lookup('columnprice');
        // var promocode = Bigmedia.Vars.getPromocode();
        // grid.getViewModel().set('visiblePrice', grid.getShowPrice() || (promocode && promocode.discount));
    },

    onClearClick: function (btn) {
        var me = this;
        Ext.getStore('ThirdPartyBoards').clearFilter(true);
        Ext.getStore('ThirdPartyBoards').removeAll();
    },

    onGridRefresh: function () {
        var me = this,
            store = me.getView().getStore();
        store.load();
    },

    onGridAddThirdParty: function (btn) {
        var tpStore = Ext.getStore('ThirdPartyBoards');
        var mainView = btn.up('window'),
        win = mainView.lookupReference('dlgImportPrices');
        if (!win) {
            win = new Bigmedia.view.dialog.DlgImportPrices({
                onlyDoorsNo: true,
                reference: 'dlgImportPrices',
                callbackImport: function (prices, linkField) {
                    var nums = Object.keys(prices);
                    Ext.Ajax.request({
                        url: '/api/v1/thirdparty',
                        method: 'POST',
                        jsonData: {dixes: nums}
                    }).then(function(response, opts) {
                        var faces = Ext.decode(response.responseText);
                        faces.forEach(function(face){
                            face.price = prices[face.doors_no];
                        });
                        tpStore.loadRawData(faces, true);
                        // console.log(['fireEventArgs', faces]);
                        tpStore.fireEventArgs('add', [tpStore, faces]);
                    },
                    function(response, opts) {
                        console.log('server-side failure with status code ' + response.status);
                    });
                },
                callbackScope: null
            });
            mainView.add(win);
        }
        win.show();
    },

    onStoreDataChanged: function () {
        var me = this,
            view = me.getView();
        view.updateStatusBar();
    },

    onStoreBeforeLoad: function (store) {
        var me = this,
            sb = me.lookup('statusGrid');
        if (sb) {
            sb.showBusy();
        }
    },

    onStoreLoad: function (store) {
      // console.log('onStoreLoad');
        this.getView().updateStatusBar();
    },

    showSelectedOnlyToggle: function (btn, pressed) {
        var me = this,
            grid = me.getView(),
            store = grid.getStore();
        if (pressed) {
            store.removeFilter('filterselected', true);
            var ids = grid.getSelectionModel().getSelection().map(function (item) {
                return item.id;
            });
            var fltr = new Ext.util.Filter({
                property: 'id',
                id: 'filterselected',
                operator: 'in',
                value: ids
            });
            store.addFilter(fltr);
        } else {
            store.removeFilter('filterselected');
        }
    },

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

    exportToExcel: function (btn) {
        Ext.MessageBox.show({
            msg: Bigmedia.Locales.exportExcelSavingData,
            progressText: Bigmedia.Locales.exportExcelProgressText,
            width: 300,
            wait: {
                interval: 200
            },
            animateTarget: btn
        });

        var me = this;

        me.timer = Ext.defer(function () {
            //This simulates a long-running operation like a database save or XHR call.
            //In real code, this would be in a callback function.

            Bigmedia.GridExport.exportToExcel(me.getView(), 'bigmedia_faces.xlsx', function () {
                //Ext.MessageBox.hide();
                //me.showToast('Your fake data was saved!', 'Done');
            }, true);

            me.timer = null;
            Ext.MessageBox.hide();
            me.showToast(Bigmedia.Locales.exportExcelFileSaved, Bigmedia.Locales.exportExcelDone);
        }, 3000);

        //Bigmedia.GridExport.exportToExcel(this.getView(), 'bigmedia_faces.xlsx', function(){
        //    Ext.MessageBox.hide();
        //    me.showToast('Your fake data was saved!', 'Done');
        //});
    },

    showToast: function (s, title) {
        Ext.toast({
            html: s,
            //title: title,
            closable: false,
            align: 't',
            slideInDuration: 400,
            minWidth: 400
        });
    },

    destroy: function () {
        if (this.timer) {
            window.clearTimeout(this.timer);
        }
        Ext.Msg.hide();
        this.callParent();
    }

});
