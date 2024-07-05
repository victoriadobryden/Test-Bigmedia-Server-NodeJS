Ext.define('Bigmedia.view.grid.ProposalsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.grid-proposals',

    requires: [
        'Bigmedia.GridExport',
        'Ext.window.MessageBox'
    ],

    init: function (args) {
        var me = this;
        me.callParent(args);
        // Bigmedia.Vars.on('promocodechanged', function(promocode) {
        //     me.initPriceColumn();
        // });
        Bigmedia.Vars.on('discountgroupchanged', function(promocode) {
            me.initPriceColumn();
        });
        Bigmedia.Vars.on('userchanged', function(user) {
            me.initPriceColumn();
        });
    },

    onRemoveProposals: function () {
      var me = this,
        grid = me.getView(),
        store = grid.getStore();
      Ext.Msg.confirm({
        title: Bigmedia.Locales.campCardProposalsConfirmDeleteTitle,
        message: Bigmedia.Locales.campCardProposalsConfirmDeleteMessage,
        buttons: Ext.Msg.YESNO,
        icon: Ext.Msg.QUESTION,
        fn: function (btn) {
          if (btn === 'yes') {
            store.beginUpdate();
            grid.getSelection().forEach(function (rec) {
                store.remove(rec);
            });
            store.endUpdate();
            if (store.getSource()) {
              store.getSource().sync();
            }
          }
        }
      });
    },

    onRowClick: function (grid, record) {
        var me = this,
            view = me.getView(),
            detFace = view.getDetFace();
        // detFace = view.lookup('detface');
        // console.log(detFace);
        console.log('rowclick');
        if (detFace) {
            detFace.setFace(record);
        }
    },

    onGridShow: function (grid) {
        var me = this;
        me.initPriceColumn();
    },

    onGridLoad: function (grid) {
        var me = this;
        me.initPriceColumn();
    },

    initPriceColumn: function () {
        // console.log('initPriceColumn');
        var me = this,
            grid = me.getView();
            // colPrice = me.lookup('columnprice');
        var promocode = Bigmedia.Vars.getPromocode(),
            curUser = Bigmedia.Vars.getUser();
        // grid.lookupViewModel().set('visiblePrice', grid.getShowPrice() || (promocode && promocode.discount) || (curUser && curUser.get('id') !== 'anonymous'));
    },

    onGridRefresh: function () {
        var me = this,
            store = me.getView().getStore();
        store.load(function(){
            // console.log('here');
            me.getView().getView().refresh();
            store.fireEventArgs('datachanged', [store]);
        });
        // console.log(store.hasListeners);
    },

    onStoreDataChanged: function (store) {
        var me = this,
            view = me.getView(),
            store = view.getStore();
        if (store.isLoading() || store.bgLoading) {
            return;
        }
        // console.log('onStoreDataChanged: %o', store.isLoading());
    },

    onStoreBeforeLoad: function (store) {
        // var me = this,
        //     sb = me.lookup('statusGrid');
        // if (sb) {
        //     sb.showBusy();
        // }
    },

    onStoreLoad: function (store) {
        this.initPriceColumn();
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

    addToCart: function () {
        var me = this,
            grid = me.getView(),
            cartStore = Ext.getStore('ShoppingCart'),
            gridStore = grid.getStore(),
            btn = Ext.getCmp('headercart');

        Ext.MessageBox.show({
            msg: Bigmedia.Locales.facesPrepareItemsForCartMsg,
            progressText: Bigmedia.Locales.facesPrepareItemsProgressText,
            width: 300,
            wait: {
                interval: 200
            },
            animateTarget: btn
        });


        me.timer = Ext.defer(function () {
            //gridStore.beginUpdate();
            //gridStore.suspendEvents(true);
            grid.getSelection().forEach(function (rec) {
               rec.set({inCart: true, selected: false}, {silent: true});
            });
            var recs = grid.getSelection();
            cartStore.add(recs);
            grid.getSelectionModel().deselectAll();
            //gridStore.resumeEvents();
            //gridStore.endUpdate();
            me.timer = null;
            Ext.MessageBox.hide();
            me.showToast(Bigmedia.Locales.facesPrepareItemsAdded);
        }, 500);
    },

    addFaceToCartAction: function (grid, rowIndex, colIndex) {
        var rec = grid.getStore().getAt(rowIndex);
        this.addFaceToCart(rec.getId());
    },

    cartAction: function (view, rowIndex, colIndex, item, e, record) {
      var me = this,
        grid = me.getView();
      var curCamp = grid.lookupViewModel().get('curCamp');
      if (curCamp) {
        if (!record.get('inCart')) {
          curCamp.proposals().add(record);
        } else {
          curCamp.proposals().remove(record);
        }
        me.showToast(Bigmedia.Locales.facesPrepareItemsAdded);
        record.set({inCart: !record.get('inCart'), selected: false});
      }
    },

    addFaceToCart: function (id) {
        var me = this,
            grid = me.getView(),
            cartStore = Ext.getStore('ShoppingCart'),
            gridStore = grid.getStore(),
            btn = Ext.getCmp('headercart');
        var rec = gridStore.getById(id);
        rec.set({inCart: true, selected: false}, {silent: true});
        var curCamp = grid.lookupViewModel().get('curCamp');
        if (curCamp) {
          curCamp.proposals().add(rec);
          me.showToast(Bigmedia.Locales.facesPrepareItemsAdded);
        }
        // Ext.MessageBox.show({
        //     msg: Bigmedia.Locales.facesPrepareItemsForCartMsg,
        //     progressText: Bigmedia.Locales.facesPrepareItemsProgressText,
        //     width: 300,
        //     wait: {
        //         interval: 200
        //     },
        //     animateTarget: btn
        // });
        //
        //
        // me.timer = Ext.defer(function () {
        //     var rec = gridStore.getById(id);
        //     rec.set({inCart: true, selected: false}, {silent: true});
        //     cartStore.add(rec);
        //     me.timer = null;
        //     Ext.MessageBox.hide();
        //     me.showToast(Bigmedia.Locales.facesPrepareItemsAdded);
        // }, 500);
    },

    onDoubleClick: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        //this.redirectTo('face/3345', true);
        var mv = this.getView().findParentByType('mainviewport');
        if (mv) {
            mv.detFace.showFace(record.getId());
        }
    },
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

        if (window.Worker) {
            var campaignId = me.getViewModel().get('curCamp').get('id')
            Bigmedia.GridExport.exportToExcel(me.getView(), 'bigmedia_campaign_' + campaignId + '.xlsx', function () {
                //Google Analytics
                // gtag('event', 'export', {
                //     'event_category': 'faces_export',
                //     'event_label': 'exported',
                //     'value': me.getView().getStore().getCount()
                // });
                Ext.MessageBox.hide();
                me.showToast(Bigmedia.Locales.exportExcelFileSaved, Bigmedia.Locales.exportExcelDone);
            }, false, true);
        } else {
            me.timer = Ext.defer(function () {
                //This simulates a long-running operation like a database save or XHR call.
                //In real code, this would be in a callback function.

                Bigmedia.GridExport.exportToExcel(me.getView(), 'bigmedia_faces.xlsx', function () {
                    //Ext.MessageBox.hide();
                    //me.showToast('Your fake data was saved!', 'Done');
                }, false, true);
                //Google Analytics
                // gtag('event', 'export', {
                //     'event_category': 'faces_export',
                //     'event_label': 'exported',
                //     'value': me.getView().getStore().getCount()
                // });
                me.timer = null;
                Ext.MessageBox.hide();
                me.showToast(Bigmedia.Locales.exportExcelFileSaved, Bigmedia.Locales.exportExcelDone);
            }, 3000);
        }


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
