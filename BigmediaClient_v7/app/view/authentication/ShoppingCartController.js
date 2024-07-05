Ext.define('Bigmedia.view.authentication.ShoppingCartController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.authentication-shoppingcart',

    requires: [
        'Bigmedia.view.dialog.DlgAddToCampaign',
        'Ext.window.MessageBox'
    ],

    listen: {
        store: {
            '#ShoppingCart': {
                add: 'onShoppingCartChange',
                remove: 'onShoppingCartChange'
                //datachanged: 'onShoppingCartChange'
            }
        }
    },

    init: function () {
        var me = this;
        this.callParent();
        me.onUserChanged();
        Bigmedia.Vars.on('userchanged', me.onUserChanged, me);
    },

    onUserChanged: function () {
        var vm = this.getViewModel(),
            user = Bigmedia.Vars.getUser();
        vm.set('isAnonymous', !user || user.get('id') === 'anonymous');
    },

    onShoppingCartChange: function (store) {
        //console.log(store);
        this.updateStatusBar(store);
    },

    onCheckoutButton: function () {

    },

    backToFaces: function () {
        this.getView().close();
        this.redirectTo('#faces');
    },

    onCampaignButton: function (btn) {
        var me = this,
            grid = me.lookupReference('cartGrid'),
            facesStore = Ext.getStore('Faces'),
            gridStore = grid.getStore(),
            viewport = Bigmedia.Vars.getViewport();

        viewport.getController().setCurrentView('dialog.DlgAddToCampaign');

        // console.log(viewport);

        // var dlg = Ext.create('Bigmedia.view.dialog.DlgAddToCampaign',{
        //     modal: true,
        //     closable: true
        // });
        // dlg.show();
    },

    removeItemFromCart: function (btn) {
        var rec = btn.getWidgetRecord();
        //rec.set('inCart', false);
        var facesStore = Ext.getStore('Faces'),
            cartStore = Ext.getStore('ShoppingCart');
        facesStore.getById(rec.id).set({inCart: false, selected: false}, {silent: true});
        cartStore.remove(rec);
        this.showToast(Bigmedia.Locales.cartRemoveItemToastText);
    },

    onDoubleClick: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        //this.redirectTo('face/3345', true);
        //var mv = this.getView().findParentByType('mainview');
        var mv = Ext.getCmp('mainView');
        if (mv) {
            mv.detFace.showFace(record.getId());
        }
    },

    removeFromCart: function () {
        var me = this,
            grid = me.lookupReference('cartGrid'),
            facesStore = Ext.getStore('Faces'),
            gridStore = grid.getStore(),
            btn = Ext.getCmp('headercart');

        Ext.MessageBox.show({
            msg: Bigmedia.Locales.cartPrepareItemsRemoveFromCartMsg,
            progressText: Bigmedia.Locales.cartPrepareItemsRemoveProgressText,
            width: 300,
            wait: {
                interval: 200
            },
            animateTarget: btn
        });

        me.timer = Ext.defer(function () {
            var recs = grid.getSelection();
            facesStore.beginUpdate();
            facesStore.suspendEvents(true);
            grid.getSelection().forEach(function (rec) {
                var facesRec = facesStore.getById(rec.id);
                facesRec.set({inCart: false, selected: false}, {silent: true});
            });
            gridStore.remove(recs);
            facesStore.resumeEvents();
            facesStore.endUpdate();
            me.timer = null;
            Ext.MessageBox.hide();
            me.showToast(Bigmedia.Locales.cartRemoveItemsToastText);
        }, 500);
    },

    onGridSelectionChange: function (grid) {
        this.updateStatusBar(grid.getStore());
    },

    updateStatusBar: function (store) {
        var me = this,
            view = me.getView(),
            grid = me.lookupReference('cartGrid'),
            sb = me.lookupReference('statusCartGrid'),
        //totalCount = store.getTotalCount(),
            count = store.getCount(),
            selected = grid.getSelectionModel().getCount();
        //var status = Ext.String.format(Bigmedia.Locales.statusBarTotal, totalCount);
        //console.log(count);
        status = Ext.String.format(Bigmedia.Locales.statusBarTotal, count);
        //if (totalCount != count) {
        //    status += ' | ' + Ext.String.format(Bigmedia.Locales.statusBarFiltered, count);
        //}
        if (selected > 0) {
            status += ' | ' + Ext.String.format(Bigmedia.Locales.statusBarChecked, selected);
        }
        //var ots = [store.min('ots'), store.max('ots'), Math.round(store.average('ots') * 100) / 100, Math.round(store.sum('ots') * 100) / 100];
        //
        //status += '  | OTS(min,max,avg) = ' + ots.slice(0,3).join(', ') + ' | OTS(sum) = ' + ots[3];
        //
        //var cities = store.collect('city');
        //if(cities.length == 1) {
        //    grp = [store.min('grp'), store.max('grp'), Math.round(store.average('grp') * 100) / 100, Math.round(store.sum('grp') * 100) / 100];
        //    status += '  | GRP ' + cities[0] + '(min,max,avg) = ' + grp.slice(0, 3).join(', ') + ' | GRP(sum) = ' + grp[3];
        //}

        var exportBtn = me.lookupReference('exportbtn'),
            removeFromCartBtn = me.lookupReference('removefromcartbtn'),
            checkoutBtn = me.lookupReference('checkoutBtn').setDisabled();

        exportBtn.setDisabled(count == 0 && selected == 0);
        removeFromCartBtn.setDisabled(selected == 0);
        checkoutBtn.setDisabled(count == 0);

        sb.setStatus({
            text: status,
            iconCls: 'ready-icon'
        });
    },
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

            Bigmedia.GridExport.exportToExcel(me.lookupReference('cartGrid'), 'bigmedia_cart.xlsx', function () {
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
