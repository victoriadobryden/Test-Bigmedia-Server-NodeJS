Ext.define('Bigmedia.view.cart.CartGridController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.cartgridcontroller',

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
        // var facesView = me.getView().up('faces-view');
        // console.log('facesView: %o', facesView);
        // var mapView;
        // if (facesView) {
        //     mapView = facesView.getController().lookupReference('mapFaces');
        //     console.log('mapView: %o', mapView);
        // }
        me.getView().winCoverage = Ext.create('Bigmedia.view.cart.WinCoverage', {
                viewModel: {
                    stores: {
                        facesStore: Ext.getStore('ShoppingCart')
                    },
                    data: {
                        mapView: null
                        // mapView: me.getView().getMapView()
                    }
                }
            });
        me.getView().winCoverage.on('hide', me.onWinCoverageHide, me);
        me.getView().winCoverage.on('show', me.onWinCoverageShow, me);
    },

    onUserChanged: function () {
        var vm = this.getViewModel(),
            user = Bigmedia.Vars.getUser();
        vm.set('isAnonymous', !user || user.get('id') === 'anonymous');
    },

    onWinCoverageShow: function (win) {
        var me = this,
            map = me.getView().getMapView().getMap();
        if (map) {
            map.cartCoveragesLayer.setVisible(true);
        }
    },

    onWinCoverageHide: function (win) {
        var me = this,
            btn = me.lookup('showcoveragebtn'),
            map = me.getView().getMapView().getMap();
        btn.setPressed(false);
        if (map) {
            map.cartCoveragesLayer.setVisible(false);
        }
    },

    // onCartStoreAdd: function (store, records) {
    //     this.onShoppingCartChange(store);
    //     this.addCartCoverages(store, records);
    // },
    //
    // onCartStoreRemove: function (store, records) {
    //     this.onShoppingCartChange(store);
    //     this.removeCartCoverages(store, records);
    // },

    onShoppingCartChange: function (store) {
        //console.log(store);
        this.updateStatusBar(store);
    },

    // addCartCoverages: function (store, records) {
    //     var me = this,
    //         cities = {};
    //     cities = records.reduce(function (res, rec) {
    //         if (!res[rec.get('id_city')]) {
    //             res[rec.get('id_city')] = {id_city: rec.get('id_city'), records:[rec], coverages: rec.get('coverages'), grps: rec.get('grp') || 0};
    //         } else {
    //             res[rec.get('id_city')].records.push(rec);
    //             res[rec.get('id_city')].coverages = res[rec.get('id_city')].coverages.map(function(coverage, i){
    //                     return coverage.union(rec.get('coverages')[i]);
    //             });
    //             res[rec.get('id_city')].grps += rec.get('grp');
    //         }
    //         return res;
    //     }, {});
    //     var cityBoundaries = Ext.getStore('CityBoundaries');
    //     var cartCoverages = Ext.getStore('CartCoverages');
    //     var unfiltered = cartCoverages.getData().getSource() || store.getData();
    //     Object.keys(cities).forEach(function (id_city) {
    //         var cityRec = unfiltered.findRecord('id_city', id_city, 0, false, false, true);
    //         if (!cityRec) {
    //             var city = cityBoundaries.getById(id_city);
    //             if (city) {
    //                 var recs = [];
    //                 Bigmedia.Vars.days.forEach(function(day, i){
    //                     recs.push({id_city: id_city, day: day, dayIndex: i, covMax: 0, grps: 0, coverages: []});
    //                         });
    //             }
    //         }
    //     });
    //     unfiltered.each(function(rec) {
    //         if (cities[rec.get('id_city')]) {
    //             var id_city = rec.get('id_city');
    //             var city = cityBoundaries.getById(id_city);
    //             var coverages = rec.get('coverages');
    //             coverages.push(cities[id_city].coverages[rec.get('dayIndex')]);
    //             var union = jsts.operation.union.UnaryUnionOp.union(coverages);
    //             var intersected = jsts.operation.overlay.OverlayOp.intersection(city.get('jsts'), union);
    //             var area = turf.area(Bigmedia.Vars.convertJstsToTurf(intersected));
    //             rec.update({covMax: area * 100 / city.get('area'), grps: cities[id_city].grps * day, coverages: coverages});
    //         }
    //     });
    // },
    //
    // removeCartCoverages: function (store, records) {
    //     var me = this,
    //         cities = {};
    //     cities = records.reduce(function (res, rec) {
    //         if (!res[rec.get('id_city')]) {
    //             res[rec.get('id_city')] = {id_city: rec.get('id_city')};
    //         }
    //         return res;
    //     }, {});
    //     var cityBoundaries = Ext.getStore('CityBoundaries');
    //     var cartCoverages = Ext.getStore('CartCoverages');
    //     // var unfiltered = cartCoverages.getData().getSource() || store.getData();
    //     Object.keys(cities).forEach(function(id_city) {
    //         while(cartCoverages.findExact('id_city', id_city) >= 0) {
    //             cartCoverages.removeAt(cartCoverages.findExact('id_city', id_city));
    //         }
    //     });
    //     var recs = [];
    //     Object.keys(cities).forEach(function(id_city){
    //         var city = cityBoundaries.getById(id_city);
    //         if (city) {
    //             Bigmedia.Vars.days.forEach(function(day, i){
    //                 var union = jsts.operation.union.UnaryUnionOp.union(cities[id_city].coverages[i]);
    //                 var intersected = jsts.operation.overlay.OverlayOp.intersection(city.get('jsts'), union);
    //                 var area = turf.area(Bigmedia.Vars.convertJstsToTurf(intersected));
    //                 recs.push({id_city: id_city, day: day, covMax: area * 100 / city.get('area'), grps: cities[id_city].grps * day});
    //             });
    //         }
    //     });
    //     // console.log(recs);
    //     cartCoverages.add(recs);
    // },

    onToggleCoverage: function (btn, pressed) {
        var me = this,
            view = me.getView(),
            win = view.winCoverage;
        win.setVisible(pressed);
    },

    onCheckoutButton: function () {

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

    removeItemFromCartAction: function (grid, rowIndex, colIndex) {
        var rec = grid.getStore().getAt(rowIndex);
        //rec.set('inCart', false);
        var facesStore = Ext.getStore('Faces'),
            cartStore = Ext.getStore('ShoppingCart');
        facesStore.beginUpdate();
        facesStore.suspendEvents(true);
        facesStore.getById(rec.id).set({inCart: false, selected: false}, {silent: true});
        cartStore.remove(rec);
        facesStore.resumeEvents();
        facesStore.endUpdate();
        this.showToast(Bigmedia.Locales.cartRemoveItemToastText);
    },

    removeItemFromCart: function (btn) {
        var rec = btn.getWidgetRecord();
        //rec.set('inCart', false);
        var facesStore = Ext.getStore('Faces'),
            cartStore = Ext.getStore('ShoppingCart');
        facesStore.beginUpdate();
        facesStore.suspendEvents(true);
        facesStore.getById(rec.id).set({inCart: false, selected: false}, {silent: true});
        cartStore.remove(rec);
        facesStore.resumeEvents();
        facesStore.endUpdate();
        this.showToast(Bigmedia.Locales.cartRemoveItemToastText);
    },

    // onDoubleClick: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
    //     //this.redirectTo('face/3345', true);
    //     //var mv = this.getView().findParentByType('mainview');
    //     var mv = Ext.getCmp('mainView');
    //     if (mv) {
    //         mv.detFace.showFace(record.getId());
    //     }
    // },

    removeFromCart: function () {
        var me = this,
            grid = me.getView(),
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
            grid = me.getView(),
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
            removeFromCartBtn = me.lookupReference('removefromcartbtn');
            // ,
            // checkoutBtn = me.lookupReference('checkoutBtn').setDisabled();

        exportBtn.setDisabled(count == 0 && selected == 0);
        removeFromCartBtn.setDisabled(selected == 0);
        // checkoutBtn.setDisabled(count == 0);

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

            Bigmedia.GridExport.exportToExcel(me.getView(), 'bigmedia_cart.xlsx', function () {
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
