Ext.define('Bigmedia.view.grid.ManagePoiController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.grid-managepoi',

    requires: [
        'Bigmedia.GridExport',
        'Ext.window.MessageBox',
        'Bigmedia.view.dialog.DlgSearchPoi',
        'Bigmedia.view.dialog.DlgImportPoiFromFile',
        "Bigmedia.view.dialog.DlgImportUserPOI",
        "Bigmedia.view.dialog.DlgIconStyle"
        // 'Bigmedia.view.dialog.DlgManageFacesForReplace'
    ],

    // init: function (args) {
    //     var me = this;
    //     me.callParent(args);
    //     // var grid = me.getView(),
    //     //     store = grid.getStore(),
    //     //     win = grid.up('window');
    //     // if (store) {
    //     //     store.addListener('datachanged', grid.getController().onStoreDataChanged, grid.getController());
    //     //     store.addListener('beforeload', grid.getController().onStoreBeforeLoad, grid.getController());
    //     //     store.addListener('load', grid.getController().onStoreLoad, grid.getController());
    //     // }
    //     // me.dlgManageFaces = Ext.create("Bigmedia.view.dialog.DlgManageFacesForReplace", {
    //     //     listeners: {
    //     //         show: function () {
    //     //             if (win) {
    //     //                 win.setAlwaysOnTop(false);
    //     //             }
    //     //         },
    //     //         hide: function () {
    //     //             if (win) {
    //     //                 win.setAlwaysOnTop(true);
    //     //             }
    //     //         }
    //     //     }
    //     // });
    // },
    onChangeIconClick: function () {
        var me = this,
            view = me.getView(),
            dlg = Ext.create("Bigmedia.view.dialog.DlgIconStyle",{
                alwaysOnTop: true,
                listeners: {
                    selectedstyle: function (style) {
                        console.log([view, view.getStore()]);
                        view.getStore().getSource().setAutoSync(false);
                        view.getSelectionModel().getSelection().forEach(function(poi){
                            poi.set({
                                color: style.color,
                                iconId: style.iconId,
                                categoryId: style.categoryId
                            });
                        });
                        view.getStore().getSource().sync();
                        view.getStore().getSource().setAutoSync(true);
                    }
                }
            });
        dlg.show();
    },

    onAddUserPOIClick: function () {
        var me = this,
            store = me.getView().getStore(),
            dlg = Ext.create("Bigmedia.view.dialog.DlgImportUserPOI",{
                alwaysOnTop: true,
                listeners: {
                    importpoi: function (pois) {
                        var recs = [];
                        pois.forEach(function(poi){
                            if (store.findBy(function(rec){
                                return (rec.get('lon') === poi.get('resultLon')) && (rec.get('lat') === poi.get('resultLat'));
                            }) === -1) {
                                var centroid = turf.centroid(poi.get('resultGeometry'));
                                recs.push({
                                    name: poi.get('resultName'),
                                    geometry: new ol.geom.Point(ol.proj.fromLonLat(centroid.geometry.coordinates)),
                                    lat: poi.get('resultLat'),
                                    lon: poi.get('resultLon'),
                                    city: poi.get('resultCity'),
                                    address: poi.get('resultStreet'),
                                    housenumber: poi.get('resultHousenumber'),
                                    centroid: Bigmedia.Vars.convertTurfToOl(centroid.geometry)
                                });
                            }
                        });
                        // console.log(recs);
                        // store.loadRawData(recs, true);
                        store.add(recs);
                    }
                }
            });
        dlg.show();
    },

    onAddFilePOIClick: function () {
        var me = this,
            dlg = Ext.create('Bigmedia.view.dialog.DlgImportPoiFromFile',{
                alwaysOnTop: true,
                listeners: {
                    uploadfile: me.uploadFile,
                    scope: me
                }
            });
        // dlg.on('uploadfile', me.uploadFile, me);
        dlg.show();
    },

    onSaveToCampaignClick: function () {
        function getQuoted (field, value) {
            return (value === null || value === undefined) ? '' : (' ' + field.toString() + '="' + value.toString().replace(/\&/g,'&amp;').replace(/\"/g,'&quot;').replace(/\'/g,'&apos;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;') + '"');
        }
        function objtoxml (obj, name) {
            return '<' + name + Object.keys(obj).map(function(key){
                return getQuoted(key, obj[key]);
            }).join('') + '></' + name + '>';
        }
        var me = this,
            grid = me.getView(),
            dlg = Ext.create('Bigmedia.view.dialog.DlgSelectCampaign', {
                listeners: {
                    selectcampaign: function (campaign) {
                        var pois = [],
                            selected = grid.getSelectionModel().getSelection();
                        selected.forEach(function(item){
                            var data = item.getData({persist: true, serialize: true});
                            pois.push(objtoxml(data, 'poi'));
                        });
                        Ext.Ajax.request({
                            url: '/api/v1/campaigns/' + encodeURIComponent(campaign.getId()) + '/bulkAddPois',
                            params: {
                                pois: pois.join('')
                            },

                            success: function(response, opts) {
                                // console.log('thirdparty boards were added');
                                campaign.campPois().load();
                                Ext.create('Ext.window.MessageBox', {
                                    // set closeAction to 'destroy' if this instance is not
                                    // intended to be reused by the application
                                    closeAction: 'destroy',
                                    alwaysOnTop: true
                                }).show({
                                    title: 'Poi were saved',
                                    message: 'Do you want to open the campaign?',
                                    buttons: Ext.Msg.YESNO,
                                    icon: Ext.Msg.QUESTION,
                                    fn: function (btn) {
                                        if (btn === 'yes') {
                                            me.redirectTo('campaigns/' + campaign.getId());
                                            // console.log('redirect will be here');
                                        }
                                    }
                                });
                            },

                            failure: function(response, opts) {
                                console.log('server-side failure with status code ' + response.status);
                            }
                        });
                    }
                }
            });
        dlg.show();
    },

    uploadFile: function (filename) {
      var me = this,
        reader = new FileReader(),
        store = me.getView().getStore();
      // console.log(filename);
      reader.onload = function(){
        try {
          var text = reader.result;
          var bytes = CryptoJS.Rabbit.decrypt(text, 'DOjev0E4sACyiauIGP493bW7ayXKC9y9sTpJQQY8');
              decrypted = bytes.toString(CryptoJS.enc.Utf8);
          // console.log(decrypted);
          // return JSON.parse(decrypted);
          var json = JSON.parse(decrypted);
          // console.log(json);
          // var json = decrypted;
          json.forEach(function(rec){
              // console.log(rec.geometry);
              rec.geometry = Bigmedia.Vars.readFeatureGeometry(rec.geometry);
              // console.log(rec.geometry);
              rec.centroid = new ol.geom.Point(ol.proj.fromLonLat([parseFloat(rec.lon), parseFloat(rec.lat)]));
          });
          // console.log(json);
          // me.getView().getStore().loadRawData(json, true);
          store.add(json);
          // me.getView().getStore().sync();
        } catch (e) {
          Ext.Msg.alert('File import error', 'File can not be imported: wrong file format.');
        } finally {

        }
        // console.log(arr);
      };
      reader.readAsText(filename);
    },

    onSaveToFileClick: function () {
        var me = this,
          grid = me.getView(),
          arr = grid.getSelectionModel().getSelection().map(function(poi){
            return poi.getData({ serialize: true , persist: true});
          });
        var ciphertext = CryptoJS.Rabbit.encrypt(JSON.stringify(arr), 'DOjev0E4sACyiauIGP493bW7ayXKC9y9sTpJQQY8');
        // Ext.exporter.File.saveAs(ciphertext.toString(), 'pois.dat');
        Ext.exporter.File.saveAs(JSON.stringify(arr), 'pois.json');
    },

    onAddPOIClick: function () {
        var me = this,
            view = me.getView();
        var dlg = Ext.create('Bigmedia.view.dialog.DlgSearchPoi', {
            poiStore: view.lookupViewModel().get('curCamp').campPois() //view.getStore().getSource() || view.getStore()
        });
        dlg.show();
    },

    onRemovePOIClick: function () {
        var me = this,
            grid = me.getView(),
            arr = grid.getSelectionModel().getSelection();
        var myMsg = Ext.create('Ext.window.MessageBox', {
            // set closeAction to 'destroy' if this instance is not
            // intended to be reused by the application
            closeAction: 'destroy',
            alwaysOnTop: true,
            modal: true
        }).show({
            title: 'Are you sure?',
            message: 'Do you want to remove selected POI?',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            fn: function(btn) {
                if (btn === 'yes') {
                    // view.getStore().removeAll();
                    grid.getStore().remove(arr);
                } else {
                    // console.log('Cancel pressed');
                }
            }
        });
        // Ext.Msg.confirm('Confirmation', 'Are you sure you want to clear POI list?', function(btn, text){
        //   if (btn == 'yes'){
        //     view.getStore().removeAll();
        //       // process text value and close...
        //   }
        // });
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
        // var me = this,
        //     dlgStore = me.dlgManageFaces.getStore(),
        //     grid = me.getView(),
        //     store = grid.getStore();
        // (store.getData().getSource() || store.getData()).each(function(face){
        //     if (face.get('supplier') !== 'BIGMEDIA') {
        //         if (!dlgStore.getById(face.getId())) {
        //             dlgStore.add(face);
        //         }
        //     }
        // });
        // me.dlgManageFaces.showDialog({
        //     success: function (dlg) {
        //         var toRemove = [];
        //         (store.getData().getSource() || store.getData()).each(function(face){
        //             if (face.get('supplier') !== 'BIGMEDIA') {
        //                 if (!dlgStore.getById(face.getId())) {
        //                     toRemove.push(face);
        //                 }
        //             }
        //         });
        //         store.remove(toRemove);
        //         var toAdd = [];
        //         (dlgStore.getData().getSource() || dlgStore.getData()).each(function(face){
        //             if (face.get('supplier') !== 'BIGMEDIA') {
        //                 if (!store.getById(face.getId())) {
        //                     toAdd.push(face.getData());
        //                 }
        //             }
        //         });
        //         store.loadRawData(toAdd, true);
        //         if (toRemove.length || toAdd.length) {
        //             me.getView().fireEvent('sourcechanged');
        //         }
        //     },
        //     cancel: function () {
        //
        //     }
        // })
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
