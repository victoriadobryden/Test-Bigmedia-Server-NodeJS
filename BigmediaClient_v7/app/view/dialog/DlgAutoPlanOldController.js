Ext.define('Bigmedia.view.dialog.DlgAutoPlanOldController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dialog-dlgautoplanold',

    requires: [
        'Bigmedia.store.PlanVariantStore',
        'Bigmedia.store.ShoppingCart',
        'Bigmedia.AutoPlan'
    ],
    listen: {
        store: {
            'planvarstore': {
                update: 'onPlanVarStoreUpdate'
            },
            '#ShoppingCart': {
                datachanged: function (store) {
                    this.getViewModel().set('cartIsEmpty', store.getCount() == 0);
                }
            },
            '#Faces': {
                load: function (store) {
                    // console.log('Faces load');
                    var vm = this.getViewModel(),
                        srcFaces = vm.getStore('srcFaces');
                    var toRemove = [];
                    srcFaces.beginUpdate;
                    srcFaces.each(function(rec){
                        if (rec.get('inPlatform')) {
                            toRemove.push(rec);
                        }
                    });
                    srcFaces.remove(toRemove);
                    var toAdd = [];
                    store.each(function(item){
                        if ((item.get('price') > 0) && !!item.get('lon') && !!item.get('lat')) {
                            toAdd.push(item);
                        }
                    });
                    srcFaces.add(toAdd);
                    srcFaces.endUpdate();
                    srcFaces.fireEventArgs('load', [srcFaces]);
                }
            },
            '#ThirdPartyBoards': {
                load: function (store, records) {
                    // console.log('ThirdParty load');
                    var vm = this.getViewModel(),
                        thirdpartySource = vm.get('thirdpartySource');
                        srcFaces = vm.getStore('srcFaces');
                    if (thirdpartySource && srcFaces) {
                        srcFaces.loadRawData(records, true);
                        srcFaces.fireEventArgs('load', [srcFaces]);
                    }
                },
                add: function (store, records) {
                    // console.log(['ThirdParty add', store, records]);
                    var vm = this.getViewModel(),
                        thirdpartySource = vm.get('thirdpartySource');
                        srcFaces = vm.getStore('srcFaces');
                    if (thirdpartySource && srcFaces) {
                        // srcFaces.add(records);
                        srcFaces.loadRawData(records, true);
                        srcFaces.fireEventArgs('load', [srcFaces]);
                    }
                },
                remove: function (store, records) {
                    var vm = this.getViewModel(),
                        thirdpartySource = vm.get('thirdpartySource');
                        srcFaces = vm.getStore('srcFaces');
                    if (thirdpartySource && srcFaces) {
                        srcFaces.remove(records);
                        srcFaces.fireEventArgs('load', [srcFaces]);
                    }
                }
            }
        },
    },
    onPlanVarStoreUpdate: function (store, record, operation, modifiedFieldNames) {
        if (modifiedFieldNames.length !== 1) {
            return;
        } else if (modifiedFieldNames[0] === 'selected') {
            var me = this,
                finalStore = me.getViewModel().get('finalStore');
            if (record.get('selected')) {
                finalStore.add(record.faces().getRange());
            } else {
                finalStore.remove(record.faces().getRange());
            }
        }
    },
    init: function (args) {
        var me = this,
            vm = me.getViewModel();
        me.callParent(args);
        Bigmedia.AutoPlan.on('cityprepared', function(cityId, faces){
            // console.log([cityId, faces]);
            me.cityPrepared(cityId, faces);
        }, me);
        Bigmedia.AutoPlan.on('algorithmcompleted', function(cityId, algorithm, faces){
            me.algorithmCompleted(cityId, algorithm, faces);
        }, me);
        Bigmedia.AutoPlan.on('terminated', function(){
            var wizard = me.lookup('wizard');
            wizard.goPrevious();
        }, me);
    },
    initViewModel: function(vm) {
        var me = this;
        vm.set('cartIsEmpty', Ext.getStore('ShoppingCart').getCount() == 0);
    },

    movePrevious: function (btn) {
        // console.log('prev');
    },

    moveNext: function (btn) {

    },

    initPlanVarStore: function () {
        var me = this,
            vm = me.getViewModel(),
            planVarStore = vm.get('planVarStore'),
            finalStore = vm.get('finalStore');
        // if (!planVarStore) {
        //     planVarStore = Ext.create('Bigmedia.store.PlanVariantStore');
        //     me.getViewModel().set('planVarStore', planVarStore);
        // } else {
        planVarStore.removeAll();
        finalStore.removeAll();
        vm.set('selectedCity', '');
        vm.set('selectedVariant', '');
        // }
    },

    startFrom: function () {
        var me = this,
            vm = me.getViewModel();
        if (vm.get('startFromNew') && vm.get('startFromNew').checked) {
            return 'new';
        } else if (vm.get('startFromCart') && vm.get('startFromCart').checked) {
            return 'cart';
        } else if (vm.get('startFromCampaign') && vm.get('startFromCampaign').checked) {
            return 'campaign';
        }
    },

    onProgressPageShow: function (page) {
        var me = this,
            view = this.getView(),
            vm = me.getViewModel(),
            srcStore = vm.getStore('srcFaces'),
            repStore = vm.getStore('repStore'),
            planStore = vm.get('planStore'),
            citiesStore = Ext.getStore('CityBoundaries'),
            cartStore = Ext.getStore('ShoppingCart'),
            wizard = me.lookup('wizard'),
            thirdpartyStore = Ext.getStore('ThirdPartyBoards'),
            startFrom = me.startFrom(),
            chbSplitAB = wizard.lookup('splitAB').getValue(),
            splitABField = wizard.lookup('splitsfieldcatab'),
            splitAB = chbSplitAB ? splitABField.getSplits() : null;
            // chbSplitSupplier = wizard.lookup('splitSupplier').getValue(),
            // splitSupplierSelect = wizard.lookup('splitSupplierSelect'),
            // splitSupplier = chbSplitSupplier ? splitSupplierSelect.getSplits() : null;
        repStore.removeAll();
        // for a case like this: splitAB = {A:100, B:0}
        // var filterAB = Object.keys(splitAB).some(function(key){return splitAB[key] === 0;});
        var store = new Ext.data.ChainedStore({
            source: srcStore,
            filters: [
                function(item) {
                    // console.log(item);
                    // return item.get('facesCount') > 0;
                    return (planStore.findExact('id', item.get('id_city')) >= 0) && (!splitAB || splitAB[item.get('catab')] > 0);
                }
            ]
        });
        //     pb = page.down('progressbar');
        // pb.updateProgress(0);
        // var thirdpartySource = vm.get('thirdpartySource');
        me.initPlanVarStore();
        var commonParams = {
            startDate: vm.get('startDate'),
            endDate: vm.get('endDate'),
            maxOnStreet: vm.get('maxOnStreet'),
            minDistance: vm.get('minDistance'),
            minDistanceOnStreet: vm.get('minDistanceOnStreet'),
            approxCellSize: 0.1,
            coverageDays: Ext.clone(Bigmedia.Vars.coverageDays)
        }
        var cities = {};
        planStore.each(function(planCity){
            var city = citiesStore.getById(planCity.getId());
            var selSizes = {}, selSuppliers = {};
            planCity.set('progress', 0);
            planCity.selsizes().each(function(selSize){
                selSizes[selSize.getId()] = selSize.get('limit');
                // {
                //     id: selSize.getId(),
                //     limit: selSize.get('limit')
                // }
            });
            if (Object.keys(selSizes).length === 0) {
                selSizes = null;
            }
            planCity.selsuppliers().each(function(selSupplier){
                selSuppliers[selSupplier.get('name')] = {
                    min: selSupplier.get('min'),
                    max: selSupplier.get('max')
                }
            });
            if (Object.keys(selSuppliers).length === 0) {
                selSuppliers = null;
            }
            cities[planCity.getId()] = {
                id: city.getId(),
                planBudget: planCity.get('budget'),
                planBoards: planCity.get('quantity'),
                planCoverage: planCity.get('coverage'),
                planSizes: selSizes,
                jsts: city.get('jsts'),
                turf: city.get('turf'),
                area: city.get('area'),
                bbox: city.get('bbox'),
                x: city.get('x'),
                y: city.get('y'),
                splits: [
                    {
                        fieldName: 'catab', //'id_catab',
                        values: splitAB,
                        type: 'count'
                    }, {
                        fieldName: 'supplier',
                        values: selSuppliers,
                        // type: 'count'
                        type: 'budget'
                    }
                ]
            }
        });
        var source = me.getPreparedFaces(store);
        // if (!me.planWorker) {
        //     me.planWorker = new Bigmedia.Vars.QueryableWorker('packages/local/autoplan/autoplan.min.js');
        //     me.planWorker.addListener('cityPrepared', function(cityId, faces){
        //         // console.log([cityId, faces]);
        //         me.cityPrepared(cityId, faces);
        //     });
        //     me.planWorker.addListener('algorithmCompleted', function(cityId, algorithm, faces){
        //         me.algorithmCompleted(cityId, algorithm, faces);
        //     });
        //     me.planWorker.addListener('terminated', function(){
        //         var wizard = me.lookup('wizard');
        //         wizard.goPrevious();
        //     });
        // }
        var initialCampaign = [];
        if (startFrom === 'cart') {
            initialCampaign = me.getPreparedFaces(cartStore);
            commonParams.initialCampaign = initialCampaign;
        } else if (startFrom === 'campaign') {
            var campaign = vm.getStore('campaigns').getById(vm.get('startFromCampaignId'));
            if (campaign) {
                var campProposals = campaign.proposals(),
                    plainFaces = [];
                campProposals.each(function(proposal){
                    var face = Ext.getStore('Faces').getById(proposal.get('faceId'));
                    plainFaces.push(me.getPlainFace(face));
                })
                commonParams.initialCampaign = plainFaces;
            }
        }
        // gtag('event', 'start_planning', {
        //     'event_category': 'PLANNER',
        //     'event_label': 'start planner'
        // });
        // me.planWorker.sendQuery('processAutoPlan', source, cities, commonParams);
        Bigmedia.AutoPlan.fireEventArgs('start', [source, cities, commonParams], Bigmedia.AutoPlan);
    },

    getPlainFace: function (faceModel) {
        faceModel.set({
            finalPrice: this.getPriceForFace(faceModel) || 0,
            netPrice: this.getFaceNetPrice(faceModel) || 0
        }, {silent: true});
        return {
            coveragesTurf  : faceModel.get('coveragesTurf'),
            cells      : faceModel.get('cells'),
            doors_no   : faceModel.get('doors_no'),
            grp        : faceModel.get('grp') || 0.01,
            id         : faceModel.get('id'),
            ots        : faceModel.get('ots') || 1,
            streets    : faceModel.get('streets'),
            supplier   : faceModel.get('supplier'),
            finalPrice : faceModel.get('finalPrice') || 0,
            // finalPrice: this.getPriceForFace(faceModel) || 0,
            id_city    : faceModel.get('id_city'),
            id_size    : faceModel.get('id_size'),
            id_catab   : faceModel.get('id_catab'),
            catab      : faceModel.get('catab'),
            angle      : faceModel.get('angle'),
            lat        : faceModel.get('lat'),
            lon        : faceModel.get('lon'),
            num        : faceModel.get('num'),
            turf       : faceModel.get('lat') && faceModel.get('lon') ? turf.point([ parseFloat(faceModel.get('lon')), parseFloat(faceModel.get('lat'))]) : null
            // turf       : faceModel.get('geometry') ? turf.point(ol.proj.toLonLat(faceModel.get('geometry').getCoordinates())) : null
            // ,
            // geometry   : faceModel.get('geometry')
        };
    },

    getPriceForFace: function (face, start, end) {
        var me = this,
            vm = me.getViewModel(),
            ruleType = vm.get('ruleType'),
            discountSimple = vm.get('discountSimple'),
            theGroup = vm.get('theGroup'),
            dtStore = Ext.getStore('DiscountTypes'),
            startDate = start || vm.get('startDate'),
            endDate = end || vm.get('endDate');
        // if (face.get('supplier') !== 'BIGMEDIA') {
        if (!face.get('inPlatform')) {
            return face.get('price');
        }
        if (ruleType === "1") {
            return dtStore.getPeriodPrice(face.get('price'), 'percentDiscount', discountSimple, startDate, endDate);
        } else {
            if (theGroup) {
                return theGroup.getFacePeriodPrice(face.getData(), startDate, endDate);
            } else {
                return face.get('price');
            }
        }
    },

    getFaceNetPrice: function (face) {
        var me = this,
            vm = me.getViewModel(),
            ruleType = vm.get('ruleType'),
            discountSimple = vm.get('discountSimple'),
            theGroup = vm.get('theGroup'),
            dtStore = Ext.getStore('DiscountTypes');
        // if (face.get('supplier') !== 'BIGMEDIA') {
        if (!face.get('inPlatform')) {
            return face.get('price');
        }
        if (ruleType === "1") {
            return dtStore.getMonthPrice(face.get('price'), 'percentDiscount', discountSimple);
        } else {
            if (theGroup) {
                return theGroup.getFaceMonthPrice(face.getData());
            } else {
                return face.get('price');
            }
        }
    },

    getPreparedFaces: function (store) {
        var me = this,
            res = [];
        store.each(function(faceModel){
            res.push(me.getPlainFace(faceModel));
        });
        return res;
    },

    cancelPlanningClick: function() {
        // var me = this;
        // me.planWorker.sendQuery('stopAll');
        Bigmedia.AutoPlan.fireEventArgs('stop', [], Bigmedia.AutoPlan);
    },

    algorithmCompleted: function (cityId, algorithm, faces) {
        var me = this,
            vm = me.getViewModel(),
            planStore = vm.get('planStore'),
            planVarStore = vm.get('planVarStore'),
            srcFaces = vm.get('srcFaces');
        var planCity = planStore.getById(cityId);
        if (planCity) {
            planCity.set({
                progress: planCity.get('progress') + 0.3,
            });
            var facesStore = Ext.getStore('Faces'),
                thirdpartyStore = Ext.getStore('ThirdPartyBoards');
            var recs = faces.map(function(f){
                var copyFace = srcFaces.getById(f.id).copy();
                // if (f.supplier === 'BIGMEDIA') {
                //     copyFace = facesStore.getById(f.id).copy();
                // } else {
                //     copyFace = thirdpartyStore.getById(f.id).copy();
                // }
                // copyFace.set({
                //     finalPrice: f.finalPrice,
                //     netPrice: me.getFaceNetPrice(copyFace)
                // });
                return copyFace;
            });
            planCity.set(algorithm, recs);
            planVarStore.loadRawData({
                algorithm: algorithm,
                id_city: planCity.getId(),
                city: planCity.get('name'),
                boards: recs.length,
                // ots: planCity.sum('ots'),
                // grp: planCity.sum('grp'),
                // budget: planCity.get('budget'),
                coverage: 0,
                faces: []
            }, true);
            // planVarStore.load([{
            //     algorithm: algorithm,
            //     city: planCity.get('name'),
            //     boards: recs.length,
            //     // ots: planCity.sum('ots'),
            //     // grp: planCity.sum('grp'),
            //     budget: planCity.get('budget'),
            //     coverage: 0,
            //     faces: recs
            // }], {addRecords: true});
            // planVarStore.getProxy().data = [{
            //     algorithm: algorithm,
            //     city: planCity.get('name'),
            //     boards: recs.length,
            //     // ots: planCity.sum('ots'),
            //     // grp: planCity.sum('grp'),
            //     budget: planCity.get('budget'),
            //     coverage: 0,
            //     faces: recs
            // }];
            // planVarStore.reload({addRecords: true});

            var newVariant = planVarStore.last();
            planVarStore.fireEventArgs('add', [planVarStore, [newVariant]]);

            newVariant.faces().add(recs);

            // var stat = newVariant.getCovStat();
            // newVariant.set({
            //     ots: newVariant.faces().sum('ots'),
            //     grp: newVariant.faces().sum('grp'),
            //     budget: newVariant.faces().sum('finalPrice'),
            //     coverage: Math.round(stat.covMax * stat.grps * 100 / (stat.covMax + stat.grps)) / 100
            // });
            // console.log(newVariant.faces());
        }
        var done = (planStore.min('progress') === 1);
        // done = true;
        if(done){
            // vm.get('chainedVarStore').sort('cpt','ASC');
            vm.set({
                selectedCity: planStore.getAt(0)
            });
            vm.notify();
            vm.get('chainedVarStore').sort([{
                    property: 'cpt',
                    direction: 'ASC'
                }, {
                    property: 'budget',
                    direction: 'ASC'
                }]);
            vm.get('chainedVarStore').sort('city','ASC');
            vm.set({
                selectedVariant: vm.get('chainedVarStore').getAt(0)
            });
            vm.notify();
            var resCitiesStore = vm.get('resCitiesStore');
            resCitiesStore.removeAll();
            planStore.each(function(city){
                resCitiesStore.add({
                    id: city.getId(),
                    name: city.get('name')
                });
            });
            var repStore = vm.get('repStore');
            repStore.fireEventArgs('refreshonmap', [repStore]);
            var wizard = me.lookup('wizard');
            wizard.goNext();
            // gtag('event', 'finish_planning', {
            //     'event_category': 'PLANNER',
            //     'event_label': 'finish planning'
            // });
        }
        // console.log([cityId, algorithm, faces]);
    },

    cityPrepared: function (cityId, faces) {
        var me = this,
            planStore = me.getViewModel().get('planStore'),
            facesStore = Ext.getStore('Faces'),
            tpStore = Ext.getStore('ThirdPartyBoards'),
            repStore = me.getViewModel().get('repStore');
        var planCity = planStore.getById(cityId);
        if (planCity) {
            planCity.set('progress', 0.1);
        }
        faces.forEach(function(face){
            var upd = null,
                faceRec;
            // if (face.supplier === 'BIGMEDIA') {
            if (facesStore.getById(face.id)) {
                faceRec = facesStore.getById(face.id);
            } else {
                faceRec = tpStore.getById(face.id);
            }
            if (faceRec) {
                if (!faceRec.get('cells') || !faceRec.get('coverages')) {
                    var coverages = face.coveragesTurf.map(function(ct){return Bigmedia.Vars.convertTurfToJsts(ct);});
                    upd = {
                        cells: face.cells,
                        coverages: coverages,
                        coveragesTurf: face.coveragesTurf
                    }
                }
                if (upd) {
                    faceRec.set(upd, {commit: true, silent: true});
                }
                repStore.add(faceRec);
            }
        });
    },

    processPlanCity: function (cityId, faces) {
        me.testWorker = new Bigmedia.Vars.QueryableWorker('/test_worker.js');
        me.testWorker.addListener('Finish', function(result) {
            // console.log(result);
        });
        me.testWorker.sendQuery('getFacesByMethod', storeArray, 'minPrice', params);
    },

    onUpdatePeriod: function () {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('srcFaces'),
            periodform = me.getView().down('form#periodform'),
            startDate = me.getView().down('datefield#startDate').getValue(),
            endDate = me.getView().down('datefield#endDate').getValue();
        if (!store) { return;}
        if (!periodform.isValid()){ return;}
        // console.log([startDate, endDate]);
        var faces = Bigmedia.Vars.getFacesByPeriod({
            // store: store.getSource(),
            store: store,
            startDate: startDate,
            endDate: endDate,
            wholePeriod: true,
            minFreeDays: 10,
            allowTempRes: true
        });
        // console.log([store, faces]);
        store.removeFilter('filterPeriod', true);
        var facesArray = Object.keys(faces).map(function(fId){ return +fId;});
        if (facesArray && facesArray.length > 0) {
            var periodFilter = new Ext.util.Filter({
                property: 'id',
                id: 'filterPeriod',
                operator: 'in',
                value: facesArray
            });
            store.addFilter(periodFilter);
        } else {
            store.addFilter(new Ext.util.Filter({
                property: 'id',
                id: 'filterPeriod',
                operator: '=',
                value: 'nop'
            }));
        }
        var campStore = vm.getStore('campaigns');
        campStore.removeFilter('periodStart', true);
        campStore.removeFilter('periodEnd', true);
        var periodStart = new Ext.util.Filter({
            property: 'startDate',
            id: 'periodStart',
            operator: '<',
            value: endDate
        });
        var periodEnd = new Ext.util.Filter({
            property: 'endDate',
            id: 'periodEnd',
            operator: '>',
            value: startDate
        });
        campStore.addFilter(periodStart);
        campStore.addFilter(periodEnd);
    },

    updateAvailableFaces: function () {
        var me = this,
            vm = me.getViewModel(),
            planStore = vm.getStore('allCities'),
            srcFaces = vm.getStore('srcFaces'),
            selected = [],
            plannerFacesCount = 0;
        if (!planStore || !srcFaces) {
            vm.set('availableFaces', 0);
        }
        else {
            planStore.each(function(rec){
                if (rec.get('selected')) {
                    selected.push(rec.getId());
                    plannerFacesCount += rec.faces().count();
                }
            });
            var srcFacesCount = srcFaces.count();
            if (selected.length > 0) {
                vm.set('availableFaces', plannerFacesCount);
            } else {
                vm.set('availableFaces', srcFacesCount);
            }
        }
        vm.notify();
    },

    onStoreDataChanged: function (store) {
      // console.log('onStoreDataChanged');
        var me = this;
        me.updateFacesInCities(store);
        me.updatePlanStore(store);
        me.updateAvailableFaces();
    },

    updateFacesInCities: function (store) {
      // console.log('updateFacesInCities');
        var me = this,
            vm = me.getViewModel(),
            allCities = vm.getStore('allCities');
        if (!allCities) {
            return;
        }
        allCities.each(function(rec){
            rec.faces().removeAll();
        });
        store.each(function(face){
            var city = allCities.getById(face.get('id_city'));
            if (city) {
                city.faces().add(face);
            }
        });
        allCities.each(function(rec){
            rec.set('facesCount', rec.faces().count());
        });
    },

    updatePlanPageCompleted: function () {
        var me = this,
            wizard = me.lookup('wizard'),
            // planPage = wizard.lookup('planPage'),
            vm = me.getViewModel();
        // if (!planPage) {
        //     return;
        // }
        var planStore = vm.get('planStore');
        if (!planStore) {
            // planPage.setIsCompleted(false);
            vm.set('planReady', false);
            return;
        }
        var completed = !!planStore.getCount();
        planStore.each(function(planCity) {
            var cityCompleted = (!!planCity.get('budget') || !!planCity.get('quantity') || !!planCity.get('coverage'));
            if (!cityCompleted) {
                planCity.selsizes().each(function(selSize){
                    cityCompleted = cityCompleted || !!selSize.get('limit');
                });
            }
            completed = completed && cityCompleted;
        });
        // planPage.setIsCompleted(completed);
        vm.set('planReady', completed);
    },

    updatePlanStore: function (source) {
      // console.log('updatePlanStore');
        var me = this,
            vm = me.getViewModel();
        // console.log('onStoreDataChanged: ' + store.getCount());
        var planStore = vm.get('allCities'); //vm.get('planStore');
        if (!planStore) {
            return;
        }
        // if (!planStore) {
        //     planStore = new Ext.data.Store({
        //         model: 'PlanCity',
        //         sorters: [{
        //             property: 'id',
        //             direction: 'ASC'
        //         }],
        //         listeners: {
        //             datachanged: function (store) {
        //                 // console.log([store, records]);
        //                 store.each(function(rec){
        //                     if (rec.selsizes && !rec.selsizes().hasListener('datachanged')) {
        //                         rec.selsizes().on('datachanged', function(s) {me.updatePlanPageCompleted();});
        //                     }
        //                     if (rec.selsuppliers && !rec.selsuppliers().hasListener('datachanged')) {
        //                         rec.selsuppliers().on('datachanged', function(s) {me.updatePlanPageCompleted();});
        //                     }
        //                 });
        //                 me.updatePlanPageCompleted();
        //             }
        //         }
        //     });
        //     vm.set('planStore', planStore);
        // }
        var cities = {};
        source.each(function(face) {
            if (!cities[face.get('id_city')]) {
                cities[face.get('id_city')] = {
                    id: face.get('id_city'),
                    name: face.get('city'),
                    plansizes: {},
                    plansuppliers: {},
                    faces: []
                }
            }
            if (!cities[face.get('id_city')].plansizes[face.get('id_size')]) {
                cities[face.get('id_city')].plansizes[face.get('id_size')] = 1;
            } else {
                cities[face.get('id_city')].plansizes[face.get('id_size')] ++;
            }
            if (!cities[face.get('id_city')].plansuppliers[face.get('supplier')]) {
                cities[face.get('id_city')].plansuppliers[face.get('supplier')] = 1;
            } else {
                cities[face.get('id_city')].plansuppliers[face.get('supplier')] ++;
            }
            cities[face.get('id_city')].faces.push(face);
        });
        var toRemove = [];
        planStore.each(function(rec) {
            if (!cities[rec.getId()]) {
                toRemove.push(rec);
            }
        });
        // planStore.remove(toRemove);
        var toLoad = [],
            filtersize = source.getFilters().getByKey('filtersize');
        Object.keys(cities).forEach(function(cityId){
            var cityRec = {
                id: cityId,
                name: Bigmedia.Locales.refCity[cityId],
                plansizes: Object.keys(cities[cityId].plansizes).reduce(function(res, sizeId){
                    res.push({
                        id: sizeId,
                        name: Bigmedia.Locales.refSize[sizeId],
                        quantity: cities[cityId].plansizes[sizeId],
                        limit: cities[cityId].plansizes[sizeId]
                    });
                    return res;
                }, []),
                selsizes: [],
                plansuppliers: Object.keys(cities[cityId].plansuppliers).reduce(function(res, name){
                    res.push({
                        id: name,
                        name: name,
                        quantity: cities[cityId].plansuppliers[name],
                        min: name === 'BIGMEDIA' ? 25 : null
                        // ,
                        // limit: cities[cityId].plansuppliers[name]
                    });
                    return res;
                }, []),
                selsuppliers: [],
                progress: 0,
                faces: cities[cityId].faces
            }
            var planRec = planStore.getById(cityId);
            var loadSizes = [];
            // if (!planRec) {
            //     // planStore.add(cityRec);
            //     cityRec.sizes = cityRec.plansizes;
            //     toLoad.push(cityRec);
            //     // console.log(cityRec);
            // } else {
            if (planRec) {
                cityRec.plansizes.forEach(function(plansize){
                    if (!planRec.sizes().getById(plansize.id)) {
                        // planRec.sizes().add(plansize);
                        loadSizes.push(plansize);
                    }
                    else {
                        planRec.sizes().getById(plansize.id).set({
                            quantity: plansize.quantity
                        });
                    }
                });
                planRec.sizes().each(function(sizeRec){
                    if (!cityRec.plansizes.some(function(plansize){
                        return sizeRec.getId() === plansize.id
                    })) {
                        // planRec.sizes().remove(sizeRec);
                        // planRec.selsizes().remove(sizeRec);
                        sizeRec.set('quantity', 0);
                    }
                });
                // console.log(planRec.sizes());
                planRec.sizes().loadRawData(loadSizes, true);
                // planRec.sizes().getFilters().beginUpdate();
                // planRec.sizes().getFilters().removeByKey('filtersize');
                // if (filtersize) {
                    //     planRec.sizes().addFilter({
                        //         id: 'filtersize',
                        //         property: 'name',
                        //         operator: typeof filtersize.getValue() === 'object' ? 'in' : '=',
                        //         value: filtersize.getValue()
                        //     });
                        // }
                        // planRec.sizes().getFilters().endUpdate();
                        // console.log(planRec.sizes());
                var loadSuppliers = [];
                cityRec.plansuppliers.forEach(function(plansupplier){
                    if (!planRec.suppliers().getById(plansupplier.id)) {
                        // planRec.sizes().add(plansize);
                        loadSuppliers.push(plansupplier);
                    }
                    else {
                        planRec.suppliers().getById(plansupplier.id).set({
                            quantity: plansupplier.quantity
                        });
                    }
                });
                planRec.suppliers().each(function(supplierRec){
                    if (!cityRec.plansuppliers.some(function(plansupplier){
                        return supplierRec.getId() === plansupplier.id
                    })) {
                        // planRec.sizes().remove(sizeRec);
                        // planRec.selsizes().remove(sizeRec);
                        supplierRec.set('quantity', 0);
                    }
                });
                planRec.suppliers().loadRawData(loadSuppliers, true);
                // planRec.suppliers().loadRawData(cityRec.plansuppliers);
                planRec.faces().loadRawData(cityRec.faces);
            }
            // }
        });
        // console.log(toLoad);
        // planStore.loadRawData(toLoad, true);
        planStore.each(function(planRec){
            planRec.sizes().sort('quantity', 'DESC');
            planRec.suppliers().sort('quantity', 'DESC');
            ix = planRec.suppliers().findExact('name', 'BIGMEDIA');
            if (ix >= 0) {
                var bm = planRec.suppliers().getAt(ix);
                if (planRec.selsuppliers().indexOf(bm) < 0) {
                    planRec.selsuppliers().add(bm);
                    // console.log('added: ' + planRec.selsuppliers().getCount());
                    // planRec.selsuppliers().insert(0, bm);
                }
            }
        });
        me.updatePlanPageCompleted();
    },

    onStoreLoad: function (store) {
        var me = this,
            vm = me.getViewModel();
        // console.log('onStoreLoad');
        me.onUpdatePeriod();
        var periodPage = me.lookup('wizard').lookup('period'),
            periodform = periodPage.child('form(true)');
        if (periodform.isValid()) {
            periodPage.setIsCompleted(true);
        }
        me.updateFacesInCities(store);
        me.updateAvailableFaces();
    },

    startAutoSelect: function () {
        var me = this,
            // view = me.getView(),
            // start = view.down('datefield#startDate'),
            // end = view.down('datefield#endDate'),
            wizard = me.lookup('wizard');
        wizard.goNext();
    },

    addSelectedToCampaign: function(campaignId) {
        var me = this,
            vm = me.getViewModel(),
            view = me.getView(),
            wizard = me.lookup('wizard'),
            finalStore = me.getViewModel().get('finalStore');

        var saveToNewCampaignName = vm.get('saveToNewCampaignName')
            startDate = vm.get('startDate'),
            endDate = vm.get('endDate');
        var main = Ext.ComponentQuery.query('mainviewport')[0],
            ra = main.getController().getRestrictedArea(),
            campStore = ra.getViewModel().getStore('campaigns'),
            curCamp = null;
        var params = {},
            faces = [],
            doorsNums = [];
        var savepriceoption = vm.get('savepriceoption'),
            savepricepassword = vm.get('savepricepassword'),
            savepricepasswordglobal = vm.get('savepricepasswordglobal');
        if (savepriceoption === '3' && savepricepasswordglobal) {
            Bigmedia.Vars.setSalt(savepricepassword);
        }
        if (savepriceoption === '3' && !savepricepasswordglobal && campaignId) {
            Bigmedia.Vars.setSalt(savepricepassword, campaignId);
        }
        Ext.MessageBox.show({
            msg: Bigmedia.Locales.dlgAutoSelectFaces.mbBulkAddFacesToCampaign,
            progressText: Bigmedia.Locales.dlgAutoSelectFaces.mbBulkAddFacesToCampaignProgress,
            width: 300,
            wait: {
                interval: 200
            }
        });
        var salt;
        if (campaignId) {
            if (savepriceoption !== '1') {
                salt = Bigmedia.Vars.getSalt(campaignId) || Bigmedia.Vars.getSalt();
            }
        } else {
            if (savepriceoption === '2') {
                salt = Bigmedia.Vars.getSalt();
            } else if (savepriceoption === '3') {
                salt = savepricepassword;
            }
        }
        var encryptedPrice = '';
        finalStore.each(function(face){
            // Change here finalPrice to netPrice
            if (salt && face.get('netPrice')) {
                encryptedPrice = Bigmedia.Vars.encryptPrice(salt, face.get('netPrice'));
            } else {
                encryptedPrice = '';
            }
            // if (face.get('supplier') === 'BIGMEDIA') {
            if (face.get('inPlatform')) {
                faces.push('<face id="' + face.getId() + '" price_encrypted = "' + encryptedPrice + '" by_planner="1"></face>');
                // faces.push('<face id="' + face.getId() + '" price = "' + face.get('finalPrice') + '" by_planner="1"></face>');
            } else {
                doorsNums.push('<doors doors_no="' + face.get('doors_no') + '" price_encrypted = "' + encryptedPrice + '" by_planner="1"></doors>');
                // doorsNums.push('<doors doors_no="' + face.get('doors_no') + '" price = "' + face.get('finalPrice') + '" by_planner="1"></doors>');
            }
        });
        params.faces = faces.join('');
        params.doorsNums = doorsNums.join('');
        function bulkAddProposals(cb) {
            if (curCamp && curCamp.getId()) {
                Ext.Ajax.request({
                    url: '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/bulkAddProposals',
                    params: params,

                    success: function(response, opts) {
                        Ext.MessageBox.hide();
                        if (cb) {
                            cb();
                        }
                    },

                    failure: function(response, opts) {
                        Ext.MessageBox.hide();
                        console.log('server-side failure with status code ' + response.status);
                    }
                });
            } else {
                Ext.MessageBox.hide();
            }
        };
        // console.log([startFromCampaign, saveToNewCampaign]);
        if (!campaignId) {
            var records = campStore.add({name: saveToNewCampaignName, startDate: startDate, endDate: endDate});
            if (records && records.length > 0) {
                curCamp = records[0];
                campStore.sync({
                    success: function () {
                        bulkAddProposals(function(){
                            if (savepriceoption === '3' && !savepricepasswordglobal) {
                                Bigmedia.Vars.setSalt(savepricepassword, curCamp.get('id'));
                            }
                            view.hide();
                            me.redirectTo('campaigns/' + curCamp.get('id'));
                        });
                    },
                    failure: function () {
                        Ext.MessageBox.hide();
                        campStore.rejectChanges();
                    }
                });
            }
        } else {
            curCamp = campStore.getById(campaignId);
            bulkAddProposals(function(){
                view.hide();
                me.redirectTo('campaigns/' + curCamp.get('id'));
            });
        }
    }

    // addSelectedToCart: function() {
    //     var me = this,
    //         wizard = me.lookup('wizard'),
    //         searchresult = wizard.lookup('searchresult'),
    //         resStore = searchresult.getViewModel().get('resStore'),
    //         cartStore = Ext.getStore('ShoppingCart'),
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
    //         var recs = [];
    //         resStore.each(function (rec) {
    //            rec.set({inCart: true, selected: false}, {silent: true});
    //            recs.push(rec);
    //         });
    //         cartStore.add(recs);
    //         var searchRes = me.getView().down('simpleresearchresult');
    //         if (searchRes) {
    //             searchRes.safeClean();
    //         }
    //         me.getView().close();
    //         me.timer = null;
    //         Ext.MessageBox.hide();
    //         Bigmedia.Vars.showToast(Bigmedia.Locales.facesPrepareItemsAdded);
    //     }, 500);
    // },

    // processAutoPlan: function (store, pb) {
    //     var me = this,
    //         view = this.getView(),
    //         wizard = me.lookup('wizard'),
    //         sr = wizard.lookup('searchresult');
    //
    //     me.prepareWorker = new Bigmedia.Vars.QueryableWorker('/prepare.js');
    //     me.prepareWorker.addListener('cityCompleted', function(cityId, faces) {
    //         console.log(result);
    //     });
    //     me.testWorker.sendQuery('getFacesByMethod', storeArray, 'minPrice', params);
    //
    //     var cityTag = wizard.lookup('reftagcity'),
    //         cityId = cityTag.getValue()[0],
    //         city = Ext.getStore('CityBoundaries').getById(cityId);
    //     // console.log(city);
    //
    //     var params = Ext.clone(Bigmedia.AutoPlan.params);
    //     params.city = {
    //         id: city.getId(),
    //         jsts: city.get('jsts'),
    //         area: city.get('area')
    //     };
    //     params.coverageDays = Ext.clone(Bigmedia.Vars.coverageDays);
    //     var storeArray = [];
    //     store.each(function(faceModel){
    //         var face = {};//faceModel.getData();
    //         face.coverages = faceModel.get('coverages');
    //         face.cells = faceModel.get('cells');
    //         if(!face.coverages) {
    //             face.coverages = Bigmedia.Vars.calculateFaceCoverages(faceModel);
    //         }
    //         if(!face.cells) {
    //             face.cells = Bigmedia.Vars.getFaceApproxCells(faceModel);
    //         }
    //         face.doors_no = faceModel.get('face_no');
    //         face.grp = faceModel.get('grp');
    //         face.id = faceModel.get('id');
    //         face.ots = faceModel.get('ots');
    //         face.streets = faceModel.get('streets');
    //         face.finalPrice = faceModel.get('finalPrice');
    //         face.id_city = faceModel.get('id_city');
    //         face.lat = faceModel.get('lat');
    //         face.lon = faceModel.get('lon');
    //         face.num = faceModel.get('num');
    //         storeArray.push(face);
    //     });
    //     console.log([storeArray, params]);
    //
    //
    //     me.testWorker = new Bigmedia.Vars.QueryableWorker('/test_worker.js');
    //     me.testWorker.addListener('Finish', function(result) {
    //         console.log(result);
    //     });
    //     me.testWorker.sendQuery('getFacesByMethod', storeArray, 'minPrice', params);
    //
    //     return;
    //
    //     function getFacesPromise (store, method, pb, pbval) {
    //         return new Promise(function (resolve, reject) {
    //             setTimeout(function () {
    //                 resolve(Bigmedia.AutoPlan.getFacesByMethod(store, method, pb, pbval));
    //                 // resolve(Ext.callback(Bigmedia.AutoPlan.getFacesByMethod , Bigmedia.AutoPlan, [store, method, pb, pbval]));
    //             }, 0, [store, method, pb, pbval]);
    //         });
    //     }
    //
    //     // var faces;
    //     // faces = Bigmedia.AutoPlan.getFacesByMethod(store, 'MinPrice', pb, 0.3);
    //     // view.resMinBudget.add(faces);
    //     // sr.setStoreMinBudget(view.resMinBudget);
    //     //
    //     // faces = Bigmedia.AutoPlan.getFacesByMethod(store, 'MaxCoveragePrice', pb, 0.6);
    //     // view.resMaxCov.add(faces);
    //     // sr.setStoreMaxCov(view.resMaxCov);
    //     //
    //     // faces = Bigmedia.AutoPlan.getFacesByMethod(store, 'MaxGRPDivPrice', pb, 0.9);
    //     // view.resOptimum.add(faces);
    //     // sr.setStoreOptimum(view.resOptimum);
    //     // if (!sr.getViewModel().get('resStore')) {
    //     //     sr.getViewModel().set('resStore', view.resMinBudget);
    //     // }
    //     // // console.log(faces);
    //     // pb.updateProgress(1);
    //     // wizard.goNext();
    //     var tmpDeep = Bigmedia.AutoPlan.params.maxDeep;
    //
    //     Bigmedia.AutoPlan.params.maxDeep = 20;
    //     getFacesPromise(store, 'MinPrice', pb, 0.3).then(function(faces){
    //         // console.log(faces);
    //         view.resMinBudget.add(faces);
    //         sr.setStoreMinBudget(view.resMinBudget);
    //         Bigmedia.AutoPlan.params.maxDeep = 20;
    //         return getFacesPromise(store, 'MaxCoverage', pb, 0.6);
    //     }).then(function(faces){
    //         view.resMaxCov.add(faces);
    //         sr.setStoreMaxCov(view.resMaxCov);
    //         // console.log(faces);
    //         Bigmedia.AutoPlan.params.maxDeep = tmpDeep;
    //         return getFacesPromise(store, 'MaxGRPDivPrice', pb, 0.9);
    //     }).then(function(faces){
    //         view.resOptimum.add(faces);
    //         sr.setStoreOptimum(view.resOptimum);
    //         if (!sr.getViewModel().get('resStore')) {
    //             sr.getViewModel().set('resStore', view.resMinBudget);
    //         }
    //         // if (!sr.getViewModel().get('resSource')) {
    //         //     sr.getViewModel().set('resSource', view.resMinBudget);
    //         // }
    //         // console.log(faces);
    //         pb.updateProgress(1);
    //         wizard.goNext();
    //     });
    // },
});
