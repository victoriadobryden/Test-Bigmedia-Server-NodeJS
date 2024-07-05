Ext.define('Bigmedia.view.campaign.CampSidesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.campaign-campsides',

    requires: [
        'Bigmedia.view.det.DetPoster',
        'Ext.menu.Menu',
        'Bigmedia.model.Poster',
        'Ext.window.MessageBox',
        'Bigmedia.view.det.DetPublishedCampaign',
        'Bigmedia.view.dialog.DlgPosterTask',
        'Bigmedia.view.dialog.DlgImportPrices'
    ],
    init: function (view) {
        var me = this,
            mapView = me.lookupReference('campMap'),
            grid = me.lookupReference('campProposals'),
            gridPhotos = me.lookupReference('gridPhotos'),
            detFace = me.lookup('detface');
        //console.log(grid);
        // grid.getStore().on('load', me.getView().mapView.updateStatusBar, me.getView());

        me.replaceStore = new Ext.data.Store({
            model: 'Bigmedia.model.Face',
            proxy: {
                type: 'memory'
            }
        });
        // Bigmedia.Vars.on('curcampchanged', me.onCurCampChanged, me);
        // me.getViewModel().set({
        //     curCamp: Bigmedia.Vars.getCurCamp(),
        //     unlockEditing: false
        // });
        mapView.getMap().setCartGrid(grid);
        mapView.setReplaceStore(me.replaceStore);
        mapView.setDetFace(detFace);

        grid.getMapView = function () {
            return mapView;
        }

        mapView.setActions({
            add: me.onProposalAdd,
            // remove: me.onProposalRemove,
            replace: me.onProposalReplace,
            scope: me
        });

        // gridPhotos.getStore().on('datachanged', me.fillMonthlyExportMenu, me);
        // gridPhotos.on('viewready', function(){ console.log('here');});
        // var exportPhotosBtn = me.lookupReference('exportPhotosBtn');
        // exportPhotosBtn.on('menushow', me.fillMonthlyExportMenu, me);
        me.callParent();

        var ra = Ext.ComponentQuery.query('restrictedarea')[0];

        ra.getViewModel().bind({
            bindTo: '{curCamp.campPois}'
        }, function(v) {
            me.updateCampPois(v);
        });
    },

    updateCampPois: function (poiStore) {
      // console.log('updateCampPois: %o', poiStore);
        var me = this,
            curCamp = me.getViewModel().get('curCamp');
        function getQuoted (field, value) {
            return (value === null || value === undefined) ? '' : (' ' + field.toString() + '="' + value.toString().replace(/\&/g,'&amp;').replace(/\"/g,'&quot;').replace(/\'/g,'&apos;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;') + '"');
        }
        function objtoxml (obj, name) {
            return '<' + name + Object.keys(obj).map(function(key){
                return getQuoted(key, obj[key]);
            }).join('') + '></' + name + '>';
        }
        if (poiStore) {
            poiStore.setAutoSync(true);
            poiStore.setRemoteFilter(false);
            poiStore.on('beforeload', function(opts){
                poiStore.getProxy().setUrl('/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/pois');
            });
            poiStore.on('beforesync', function(opts){
              // console.log(opts);
                if (opts.create) {
                    var pois = [];
                    opts.create.forEach(function(item){
                        var data = item.getData({persist: true, serialize: true});
                        pois.push(objtoxml(data, 'poi'));
                    });
                    var formData = new FormData();
                    formData.append('pois', pois.join(''));
                    var request = new XMLHttpRequest();
                    request.onload = function () {
                        curCamp.campPois().load();
                    }
                    request.open("POST", '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/bulkAddPois');
                    request.send(formData);
                }
                if (opts.update) {
                    var pois = [];
                    opts.update.forEach(function(item){
                        var data = item.getData({persist: true, serialize: true});
                        pois.push(objtoxml(data, 'poi'));
                    });
                    var formData = new FormData();
                    formData.append('pois', pois.join(''));
                    var request = new XMLHttpRequest();
                    request.onload = function () {
                        // curCamp.campPois().load();
                    }
                    request.open("POST", '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/bulkUpdatePois');
                    request.send(formData);
                }
                if (opts.destroy) {
                    var pois = [];
                    opts.destroy.forEach(function(item){
                        var data = {id: item.getId()};
                        pois.push(objtoxml(data, 'poi'));
                    });
                    var formData = new FormData();
                    formData.append('pois', pois.join(''));
                    var request = new XMLHttpRequest();
                    request.onload = function () {
                        // curCamp.campPois().load();
                    }
                    request.open("POST", '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/bulkDeletePois');
                    request.send(formData);
                }
                return false;
            });
            this.lookup('campMap').setPoiStore(poiStore);
        } else {
            this.lookup('campMap').setPoiStore(null);
        }
    },

    onProposalAdd: function (rec) {
        var me = this,
            curCamp = me.getViewModel().get('curCamp'),
            newRec;
        var tempStore = Ext.create('Ext.data.Store',{
            model: 'Bigmedia.model.Proposal',
            proxy: {
                type: 'rest',
                url: '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/proposals',
                limitParam: null,
                pageParam: '',
                startParam: ''
            },
            autoSync: false
            // listeners: {
            //     add: function (store, records) {
            //         newRec = records[0];
            //     }
            // }
        });
        if (rec.get('supplier') === 'BIGMEDIA') {
            newRec = {
                faceId: rec.get('faceId') || rec.getId(),
                campaignId: curCamp.getId(),
                startDate: curCamp.get('startDate'),
                endDate: curCamp.get('endDate'),
                operationId: 1,
                supplierPrice: rec.get('finalPrice')
            };
        } else {
            newRec = {
                doorsNo: rec.get('doorsNo'),
                campaignId: curCamp.getId(),
                startDate: curCamp.get('startDate'),
                endDate: curCamp.get('endDate'),
                operationId: 1,
                supplierPrice: rec.get('finalPrice')
            };
        }
        // console.log(newRec);
        newRec = tempStore.add(newRec);
        if (newRec && newRec.length > 0) {
            newRec = newRec[0];
            tempStore.sync({
                success: function () {
                    // curCamp.proposals().loadData(newRec, true);
                    // curCamp.proposals().remove(records)
                    curCamp.proposals().loadRawData([newRec.getData()], true);
                    Ext.defer(function(){tempStore.destroy();}, 100);
                },
                failure: function () {
                    console.log('saving failure');
                }
            })
        }
        return false;
        // curCamp.proposals().setProxy({
        //     type: 'rest',
        //     url: '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/proposals',
        //     limitParam: null,
        //     pageParam: '',
        //     startParam: ''
        // });
        // var prop = curCamp.proposals().add({
        //     faceId: rec.get('faceId') || rec.getId(),
        //     campaignId: curCamp.getId(),
        //     startDate: curCamp.get('startDate'),
        //     endDate: curCamp.get('endDate'),
        //     operationId: 1
        // });
        // curCamp.proposals().sync();
        // console.log(curCamp.proposals());
        // curCamp.proposals().sync();
    },

    onProposalReplace: function (record, replaceFaceId) {
        var me = this,
            curCamp = me.getViewModel().get('curCamp'),
            store = curCamp.proposals(),
            faceToRemove = store.getById(replaceFaceId);
        if (faceToRemove) {
            store.remove(faceToRemove);
            me.onProposalAdd(record);
        }
    },

    onProposalRemove: function (rec) {
        var me = this;

    },

    onGridReconfigure: function (grid, store) {
        var me = this,
            mapView = me.lookupReference('campMap');
        // don't work
        // store.on('add', me.onProposalAdd, me);
        store.setAutoSync(true);
        // TODO: update replaceStore by campaign period
        if (!me.getViewModel().get('curCamp')) {
            return;
        }
        var faces = Bigmedia.Vars.getFacesByPeriod({
            store: Ext.getStore('Faces'),
            startDate: me.getViewModel().get('curCamp').get('startDate'),
            endDate: me.getViewModel().get('curCamp').get('endDate'),
            wholePeriod: true,
            allowTempRes: true
        });
        var facesArray = Object.keys(faces).map(function(fId){ return Ext.getStore('Faces').getById(+fId);}).filter(function(face){
            return face && face.get('geometry');
        }).map(function(face){
            return face.clone();
        });
        me.replaceStore.removeAll();
        me.replaceStore.add(facesArray);
        mapView.updateReplaceStore(me.replaceStore, me.replaceStore);

        store.setRemoteFilter(false);

        store.on('datachanged', me.getView().updateStatusBar, me.getView());

        // console.log('campPois().load()');
        // var poiStore = me.getViewModel().get('curCamp').campPois();
        // me.lookup('campMap').setPoiStore(poiStore);
        // poiStore.load({
        //     callback: function(records, operation, success) {
        //     // console.log(records);
        //         records.forEach(function(rec){
        //             rec.set({
        //                 geometry: Bigmedia.Vars.readFeatureGeometry(rec.get('geometry')),
        //                 centroid: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(rec.get('lon')), parseFloat(rec.get('lat'))]))
        //             }
        //             , {
        //                 commit: true,
        //                 dirty: false
        //             }
        //         );
        //         });
        //         // poiStore.sync();
        //         console.log(poiStore.isLoaded());
        //         me.lookup('campMap').setPoiStore(poiStore);
        //     }
        // });
    },

    removeSides: function () {
        var me = this,
            grid = me.lookup('campProposals'),
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
                    // store.sync();
                    store.endUpdate();
                }
            }
        });
    },

    importThirdpartyFaces: function (startDate, endDate, lines, opts) {
        var me = this,
            facesStore = Ext.getStore('Faces'),
            curCamp = me.getViewModel().get('curCamp'),
            faces = [],
            doorsNums = [];
        if (!curCamp || curCamp.phantom) {
            return;
        }

        var validLines = lines.split(/\n+/g).filter(function(item){ return item.match(/(\w+)[^.,\w\d]?(\d+[.,]?\d*)*/);}),
            numbers;
        numbers = validLines.reduce(function(res, line){
            var match = line.match(/(\w+)[^.,\w\d]+(\d+[.,]?\d*)*/);
            if (match) {
                if (match[2]) {
                    res[match[1]] = match[2].replace(/\,/,'.');
                } else {
                    res[match[1]] = null;
                }
            }
            return res;
        },{});

        if (opts.savepriceoption === '3' && opts.savepricepasswordglobal) {
            Bigmedia.Vars.setSalt(opts.savepricepassword);
        }
        if (opts.savepriceoption === '3' && !opts.savepricepasswordglobal && curCamp.getId()) {
            Bigmedia.Vars.setSalt(opts.savepricepassword, curCamp.getId());
        }
        var salt;
        if (opts.savepriceoption !== '1') {
            salt = Bigmedia.Vars.getSalt(curCamp.getId()) || Bigmedia.Vars.getSalt();
        }
        var encryptedPrice = '';
        var filters = facesStore.getFilters().clone();
        try {
            facesStore.clearFilter();
            Object.keys(numbers).forEach(function(num){
                var price = numbers[num];
                if (salt && price) {
                    encryptedPrice = Bigmedia.Vars.encryptPrice(salt, price);
                } else {
                    encryptedPrice = '';
                }
                var ix = facesStore.findExact((opts.linkField === 'doorsNo' ? 'doorsNo' : 'supplierNo'), (opts.linkField === 'doorsNo' ? +num : num));
                if (ix >= 0) {
                    var face = facesStore.getAt(ix);
                    faces.push('<face date_beg="' + Ext.Date.format(startDate, 'Y-m-d') + '" date_end="' + Ext.Date.format(endDate, 'Y-m-d') + '" id="' + face.getId() + '" price_encrypted = "' + encryptedPrice + '"></face>');
                } else if (opts.linkField === 'doorsNo') {
                    doorsNums.push('<doors date_beg="' + Ext.Date.format(startDate, 'Y-m-d') + '" date_end="' + Ext.Date.format(endDate, 'Y-m-d') + '" doors_no="' + num + '" price_encrypted = "' + encryptedPrice + '"></doors>');
                }
            });
        } catch (e) {

        } finally {
            facesStore.addFilter(filters.getRange());
        }

        var formData = new FormData();
        formData.append('faces', faces.join(''));
        formData.append('doorsNums', doorsNums.join(''));
        var request = new XMLHttpRequest();
        request.onload = function () {
            curCamp.proposals().load();
        }
        request.open("POST", '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/bulkAddProposals');
        request.send(formData);

        // Ext.Ajax.request({
        //     url: '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/bulkAddProposals',
        //     params: {
        //         faces: faces.join(''),
        //         doorsNums: doorsNums.join('')
        //     },
        //
        //     success: function(response, opts) {
        //         // console.log('thirdparty boards were added');
        //         curCamp.proposals().load();
        //     },
        //
        //     failure: function(response, opts) {
        //         console.log('server-side failure with status code ' + response.status);
        //     }
        // });
    },

    importThirdpartyClick: function (btn) {
        var me = this,
            mainView = me.getView().up('mainviewport'),
            win = mainView.lookupReference('dlgImportThirdpartyFaces');
        if (!win) {
            win = new Bigmedia.view.dialog.DlgImportThirdpartyFaces({
                reference: 'dlgImportThirdpartyFaces',
                callbackImport: me.importThirdpartyFaces,
                callbackScope: me
            });
            mainView.add(win);
        }
        win.show();
    },

    importSupplierPrices: function (prices, opts) {
        var me = this,
            grid = me.lookup('campProposals'),
            curCamp = me.getViewModel().get('curCamp'),
            store = grid.getStore(),
            proposals = [], salt;
        if (!curCamp || curCamp.phantom) {
            return;
        }

        if (opts.savepriceoption === '3' && opts.savepricepasswordglobal) {
            Bigmedia.Vars.setSalt(opts.savepricepassword);
        }
        if (opts.savepriceoption === '3' && !opts.savepricepasswordglobal && curCamp.getId()) {
            Bigmedia.Vars.setSalt(opts.savepricepassword, curCamp.getId());
        }
        var salt;
        salt = Bigmedia.Vars.getSalt(curCamp.getId()) || Bigmedia.Vars.getSalt();
        Object.keys(prices).forEach(function(num){
            // console.log([linkField, num, prices[num]]);
            var no = num;
            if (opts.linkField === 'doorsNo') {
                no = +num;
            }
            var ix = store.findExact(opts.linkField, no);
            if (ix >= 0) {
                var price = prices[num],
                    encryptedPrice = '';
                if (salt && price) {
                    encryptedPrice = Bigmedia.Vars.encryptPrice(salt, price);
                } else {
                    encryptedPrice = '';
                }
                var rec = store.getAt(ix);
                proposals.push('<proposal id="' + rec.getId() + '" supplier_price_encrypted = "' + encryptedPrice + '"></proposal>');
            }
        });
        var formData = new FormData();
        formData.append('proposals', proposals.join(''));
        var request = new XMLHttpRequest();
        request.onload = function () {
            curCamp.proposals().load();
        }
        request.open("POST", '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/bulkAddSupplierPrices');
        request.send(formData);
        // Ext.Ajax.request({
        //     url: '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/bulkAddSupplierPrices',
        //     params: {
        //         proposals: proposals.join('')
        //     },
        //
        //     success: function(response, opts) {
        //         // console.log('thirdparty boards were added');
        //         curCamp.proposals().load();
        //     },
        //
        //     failure: function(response, opts) {
        //         console.log('server-side failure with status code ' + response.status);
        //     }
        // });
    },

    importPrices: function (prices, linkField) {
        var me = this,
            grid = me.lookup('campProposals'),
            curCamp = me.getViewModel().get('curCamp'),
            pubCamp = me.getViewModel().get('pubCamp'),
            store = grid.getStore(),
            proposals = [], salt;
        // console.log('here');
        if (pubCamp.get('cryptoHash')) {
            salt = Bigmedia.Vars.getPubPassphrase(pubCamp.getId());
            if (!salt) {
                return;
            }
        }
        Object.keys(prices).forEach(function(num){
            // console.log([linkField, num, prices[num]]);
            var no = num;
            if (linkField === 'doorsNo') {
                no = +num;
            }
            var ix = store.findExact(linkField, no);
            if (ix >= 0) {
                var price = prices[num],
                    encryptedPrice = '';
                if (salt && price) {
                    encryptedPrice = Bigmedia.Vars.encryptPrice(salt, price);
                    price = '';
                } else {
                    encryptedPrice = '';
                }
                var rec = store.getAt(ix);
                proposals.push('<proposal id="' + rec.getId() + '" price_encrypted = "' + encryptedPrice + '" price = "' + price + '"></proposal>');
            }
        });
        var formData = new FormData();
        formData.append('proposals', proposals.join(''));
        var request = new XMLHttpRequest();
        request.onload = function () {
            curCamp.proposals().load();
        }
        request.open("POST", '/api/v1/published/campaigns/' + encodeURIComponent(pubCamp.getId()) + '/bulkAddPubPrices');
        request.send(formData);
        // Ext.Ajax.request({
        //     url: '/api/v1/published/campaigns/' + encodeURIComponent(pubCamp.getId()) + '/bulkAddPubPrices',
        //     params: {
        //         proposals: proposals.join('')
        //     },
        //
        //     success: function(response, opts) {
        //         // console.log('thirdparty boards were added');
        //         curCamp.proposals().load();
        //     },
        //
        //     failure: function(response, opts) {
        //         console.log('server-side failure with status code ' + response.status);
        //     }
        // });
    },

    importSupplierPricesClick: function (btn) {
        var me = this,
            mainView = me.getView().up('mainviewport'),
            curCamp = me.getViewModel().get('curCamp'),
            win = mainView.lookupReference('dlgImportSupplierPrices');
        if (!curCamp || curCamp.phantom) {
            return;
        }
        if (!win) {
            win = new Bigmedia.view.dialog.DlgImportSupplierPrices({
                reference: 'dlgImportSupplierPrices',
                callbackImport: me.importSupplierPrices,
                callbackScope: me
            });
                // scope: me
            mainView.add(win);
        }
        win.show();
    },

    importPricesClick: function (btn) {
        var me = this,
            mainView = me.getView().up('mainviewport'),
            pubCamp = me.getViewModel().get('pubCamp'),
            curCamp = me.getViewModel().get('curCamp'),
            win = mainView.lookupReference('dlgImportPrices');
        if (!pubCamp) {
            return;
        }
        if (!win) {
            win = new Bigmedia.view.dialog.DlgImportPrices({
                reference: 'dlgImportPrices',
                callbackImport: me.importPrices,
                callbackScope: me
            });
                // scope: me
            mainView.add(win);
        }
        if (pubCamp.get('cryptoHash') && !Bigmedia.Vars.getPubPassphrase(pubCamp.getId())) {
            Bigmedia.Vars.showPubPriceEncryptDialog(pubCamp.getId(), function() {
                win.show();
            });
        } else {
            win.show();
        }
    },

    addPosterTask: function (btn) {
        var me = this,
            mainView = me.getView().up('mainviewport'),
            win = mainView.lookupReference('dlgPosterTask');
        if (!win) {
            win = new Bigmedia.view.dialog.DlgPosterTask({
                reference: 'dlgPosterTask'
            });
            mainView.add(win);
        } else {
        }
        win.getViewModel().set('curCamp', me.getViewModel().get('curCamp'));
        win.getViewModel().set('grid', me.lookup('campProposals'));
        win.show();
    },

    showSelectedOnlyToggle: function (btn, pressed) {
        var me = this,
            grid = me.lookup('campProposals'),
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
            var campaignId = me.getViewModel().get('curCamp').get('id')
            Bigmedia.GridExport.exportToExcel(me.lookup('campProposals'), 'bigmedia_campaign_' + campaignId + '.xlsx', function () {
                //Ext.MessageBox.hide();
                //me.showToast('Your fake data was saved!', 'Done');
            }, false, true);

            me.timer = null;
            Ext.MessageBox.hide();
            me.showToast(Bigmedia.Locales.exportExcelFileSaved, Bigmedia.Locales.exportExcelDone);
        }, 3000);

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

    transliterateFileName: function (str) {
        var a = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"a","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu","Ї":"YI","ї":"yi","Є":"YE","є":"ye","І":"I","і":"i"};

        function transliterateWord(word){
          return word.split('').map(function(ch) {
            return a[ch] || ch;
          }).join("");
        }

        return str.split(' ').map(function(word) {
            return transliterateWord(word);
        }).join('_');
    },

    cleanFileName: function (fn) {
        return fn.replace(/[\*\|\\\:\"<>\?\/]/g,'');
    },

    cellDblClickProposals: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        //this.redirectTo('face/3345', true);
        var mv = this.getView().findParentByType('mainviewport');
        if (mv) {
            mv.detFace.showFace(record.get('face').id);
        }
    },

    updatePublishedCampaign: function (newVal, oldVal) {
        var me = this,
            grid = me.lookup('campProposals'),
            curCamp = me.getViewModel().get('curCamp');
        if (newVal) {
            delete me.proposals;
            me.publishedProposals = new Ext.data.Store({
                model: 'Bigmedia.model.JoinedProposal',
                proxy: {
                    type: 'rest',
                    url: '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/published/' + encodeURIComponent(newVal.getId()) + '/proposals',
                    limitParam: null,
                    pageParam: '',
                    startParam: ''
                },
                autoLoad: true,
                autoSync: true
            });
            me.getViewModel().set('proposals', me.publishedProposals);
            // var newStore = this.createPublishedProposalsStore();
            // grid.reconfigure(newVal.get('proposals'),this.getView().etc.published.columns);
            // grid.reconfigure(this.publishedProposals, this.getView().etc.published.columns);
            grid.reconfigure(me.publishedProposals, me.getView().etc.published.columns);
            // Third-party boards
            me.thirdpartyProposals = new Ext.data.Store({
                model: 'Bigmedia.model.ThirdpartyProposal',
                proxy: {
                    type: 'rest',
                    url: '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/published/' + encodeURIComponent(newVal.getId()) + '/third-party',
                    limitParam: null,
                    pageParam: '',
                    startParam: ''
                },
                autoLoad: true,
                autoSync: true
            });
            me.getViewModel().set('thirdparty', me.thirdpartyProposals);
        } else {
            delete me.publishedProposals;
            delete me.thirdpartyProposals;
            me.proposals = new Ext.data.Store({
                model: 'Bigmedia.model.Proposal',
                proxy: {
                    type: 'rest',
                    url: '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/proposalsmix',
                    limitParam: null,
                    pageParam: '',
                    startParam: ''
                },
                autoLoad: true,
                autoSync: true
            });
            me.getViewModel().set('proposals', me.proposals);
            grid.reconfigure(me.proposals, me.getView().etc.proposals.columns);
        }
    },

    createPublishedProposalsStore: function () {
        var me = this;
        var store = me.getViewModel().get('curCamp.proposals'),
            pubProps = me.publishedProposals;
        var data = [];
        store.each(function(record){
            var recData = record.getData();
            var pubProp = pubProps.findRecord('proposalId', recData.id);
            if (pubProp) {
                recData.published = pubProp.getData();
                // recData.publishedCustomRating = pubProp.get('customRating');
                // recData.publishedDecision = pubProp.get('decision');
            }
            data.push(recData);
        });
        // console.log(data);
        return new Ext.data.Store({
            idProperty: 'publishedId',
            model: 'Bigmedia.model.JoinedProposal',
            data: data,
            // proxy: me.publishedProposals.getProxy()
            proxy: {
                type: 'rest',
                url: 'publishedproposals'
            },
            listeners: {
                update: function () {
                    // console.log('here');
                }
            }
        });
        // console.log(store);
    },

    showDetPoster: function (thePoster) {
        var mainView = this.getView().up('mainviewport'),
            win = mainView.lookupReference('detPoster');
        if (!win) {
            win = new Bigmedia.view.det.DetPoster({
                reference: 'detPoster',
                viewModel: {
                    data: {
                        thePoster: thePoster
                    }
                }
            });

            // A Window is a floating component, so by default it is not connected
            // to our main View in any way. By adding it, we are creating this link
            // and allow the window to be controlled by the main ViewController,
            // as well as be destroyed automatically along with the main View.
            // this.getView().add(win);
            mainView.add(win);
        } else {
            win.getViewModel().set('thePoster', thePoster);
        }
        win.show();
    },

    onDetPublishedSave: function (thePublished) {
        this.getView().setPublishedCampaign(thePublished);
    },

    // showDetPublished: function (thePublished) {
    //     var me = this,
    //         mainView = me.getView().up('mainviewport'),
    //         win = mainView.lookupReference('detPublished');
    //     if (!win) {
    //         win = new Bigmedia.view.det.DetPublishedCampaign({
    //             reference: 'detPublished',
    //             store: me.publishedCamps,
    //             viewModel: {
    //                 data: {
    //                     thePublished: thePublished
    //                 }
    //             }
    //         });
    //         win.on({
    //             save: me.onDetPublishedSave,
    //         //     hide: me.initPublishedCampTab,
    //         //     close: me.initPublishedCampTab,
    //             scope: me
    //         });
    //         mainView.add(win);
    //     } else {
    //         win.setStore(me.publishedCamps);
    //         win.getViewModel().set('thePublished', thePublished);
    //     }
    //     win.show();
    // },

    addPublishedClick: function (btn) {
        // var store = this.getViewModel().get('curCamp.posters'),
        var camp = this.getViewModel().get('curCamp'),
            user = Bigmedia.Vars.getUser();
        var newPublished = new Bigmedia.model.Published({
            campaignId: camp.get('id'),
            name: camp.get('name'),
            startDate: camp.get('startDate'),
            endDate: camp.get('endDate'),
            email: user.get('email'),
            ownerId: user.get('id')
        });
        this.showDetPublished(newPublished);
    }

});
