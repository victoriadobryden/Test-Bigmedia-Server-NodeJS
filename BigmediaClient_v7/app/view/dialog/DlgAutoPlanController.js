Ext.define('Bigmedia.view.dialog.DlgAutoPlanController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dialog-dlgautoplan',

    init: function (view) {
      var me = this;
      var fStore = Ext.getStore('Faces');
      var cities = [];
      fStore.each((rec) => {
        if (cities.indexOf(rec.get('city')) < 0) {
          cities.push(rec.get('city'));
        }
      });
      me.callParent(view);
      var vm = me.getViewModel();
      Bigmedia.AutoPlan.on('cityprepared', me.cityPrepared, me);
      Bigmedia.AutoPlan.on('algorithmcompleted', me.algorithmCompleted, me);
      Bigmedia.AutoPlan.on('terminated', me.onAutoPlanTerminate, me);
      var toAdd = [];
      fStore.each(function(item){
          if ((item.get('price') > 0) && !!item.get('lon') && !!item.get('lat')) {
              var rec = item.copy();
              rec.set('inCart', false);
              toAdd.push(rec);
          }
      });
      vm.getStore('srcFaces').add(toAdd);
      me.loadCities();
      me.updateFacesInCities(vm.getStore('srcFaces'));
      var citiesAdd = [];
      vm.getStore('allCities').each((city) => {
        var operators = [], sizes = [], sCount = {};
        city.faces().each((f) => {
          if (operators.indexOf(f.get('supplier')) < 0) {
            operators.push(f.get('supplier'));
          }
          if (sizes.indexOf(f.get('size')) < 0) {
            sizes.push(f.get('size'));
            sCount[f.get('size')] = 1;
          } else {
            sCount[f.get('size')] = sCount[f.get('size')] + 1;
          }
        });
        citiesAdd.push({
          xtype: 'autoplancityparams',
          reference: 'cityparams-' + city.getId(),
          city: city.get('name'),
          cityRec: city,
          anchor: '100%',
          params: {
            operators: operators,
            sizes: sizes.map((s) => {
              return {
                name: s,
                totalCount: sCount[s]
              }
            })
          },
        });
      });
      var citiesContainer = me.lookup('cities');
      citiesContainer.add(citiesAdd);
    },

    onCoverageChange: function (field, value) {
      var me = this,
        vm = me.getViewModel(),
        allCities = vm.getStore('allCities');
      allCities.each((c) => {
        c.set('coverage', (value > 0 ? value : null));
      });
      if (field.el) {
        field.el.toggleCls('not-empty', (value != null) || field.emptyText);
      }
    },

    onTotalBudgetChange: function (field, value) {
      var me = this,
        vm = me.getViewModel(),
        allCities = vm.getStore('allCities'),
        sp = allCities.sum('population'),
        last = allCities.last(),
        sum = 0;
      allCities.each((c) => {
        if (c != last) {
          var b = Math.round(value * c.get('population') / (sp * 100)) * 100;
          sum += b;
          var newB = (b > 0) ? b : null;
          c.set('budget', newB);
        } else {
          if (value - sum >= 0) {
            c.set('budget', (((value - sum) > 0) ? (value - sum) : null));
          }
        }
      });
      if (field.el) {
        field.el.toggleCls('not-empty', (value != null) || field.emptyText);
      }
    },

    onSelectClick: function () {
      var me = this,
        minPrice = me.lookup('minPrice'),
        maxCoverage = me.lookup('maxCoverage'),
        optimal = me.lookup('optimal'),
        vm = me.getViewModel(),
        planVarStore = vm.get('planVarStore');
      var alg = minPrice.getValue() ? 'MinPrice' : maxCoverage.getValue() ? 'MaxCoverage' : 'MaxGRPDivPrice';
      var resStore = vm.get('resAlgorithms'),
        res = resStore.getById(alg);
      if (res) {
        me.getView().fireEvent('finished', res.get('faces'));
        me.getView().close();
      }
    },

    initPlanVarStore: function () {
        var me = this,
            vm = me.getViewModel(),
            planVarStore = vm.get('planVarStore'),
            finalStore = vm.get('finalStore');
        planVarStore.removeAll();
        finalStore.removeAll();
    },

    onStartClick: function () {
      var me = this,
          view = this.getView(),
          vm = me.getViewModel(),
          srcStore = vm.getStore('srcFaces'),
          repStore = vm.getStore('repStore'),
          planStore = vm.get('planStore'),
          citiesStore = Ext.getStore('CityBoundaries');
      me.lookup('progress').wait({
        text: 'Planning is in progress...'
      });
      vm.set('step', 3);
      repStore.removeAll();
      // for a case like this: splitAB = {A:100, B:0}
      // var filterAB = Object.keys(splitAB).some(function(key){return splitAB[key] === 0;});
      var splitAB = {
        A: vm.get('A'),
        B: vm.get('B')
      };
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
          maxOnStreet: vm.get('maxOnStreet'),
          minDistance: vm.get('minDistance'),
          minDistanceOnStreet: vm.get('minDistanceOnStreet'),
          approxCellSize: 0.1,
          coverageDays: Ext.clone(Bigmedia.Vars.coverageDays)
      }
      var cities = {},
        citiesContainer = me.lookup('cities');
      planStore.each(function(planCity){
          var city = citiesStore.getById(planCity.getId());
          var selSizes = {}, selSuppliers = {};
          planCity.set('progress', 0);
          // planCity.selsizes().each(function(selSize){
          //     selSizes[selSize.getId()] = selSize.get('limit');
          // });
          for (var i = 0; i < citiesContainer.items.getCount(); i++) {
            if (citiesContainer.items.getAt(i).isXType('autoplancityparams')) {
              var cityParams = citiesContainer.items.getAt(i);
              if (cityParams.getCity() === planCity.get('name')) {
                if (cityParams.getParams().sData) {
                  cityParams.getParams().sData.forEach((s) => {
                    selSizes[s.size] = s.count;
                  });
                }
                if (cityParams.getParams().oData) {
                  cityParams.getParams().oData.forEach((o) => {
                    selSuppliers[o.operator] = {
                      min: o.min,
                      max: o.max
                    };
                  });
                }
              }
            }
          }
          if (Object.keys(selSizes).length === 0) {
              selSizes = null;
          }
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
      var curCamp = vm.get('curCamp');
      var campProposals = curCamp.proposals(),
          plainFaces = [];
      campProposals.each(function(proposal){
          var face = Ext.getStore('Faces').getById(proposal.get('faceId'));
          // console.log([face, proposal.get('faceId')]);
          plainFaces.push(me.getPlainFace(face));
      })
      if (plainFaces.length > 0) {
        commonParams.initialCampaign = plainFaces;
      }
      // gtag('event', 'start_planning', {
      //     'event_category': 'PLANNER',
      //     'event_label': 'start planner'
      // });
      // console.log([cities, commonParams]);
      Bigmedia.AutoPlan.fireEventArgs('start', [source, cities, commonParams], Bigmedia.AutoPlan);
    },

    getPlainFace: function (faceModel) {
      // console.log(faceModel)
        return {
            coveragesTurf  : faceModel.get('coveragesTurf'),
            cells      : faceModel.get('cells'),
            doors_no   : faceModel.get('doors_no'),
            grp        : faceModel.get('useKSData') ? faceModel.get('ksTRP') || 0.01 :  faceModel.get('grp') || 0.01,
            id         : faceModel.get('id'),
            ots        : faceModel.get('useKSData') ? faceModel.get('ksOTS') || 1 : faceModel.get('ots') || 1,
            streets    : faceModel.get('streets'),
            supplier   : faceModel.get('supplier'),
            finalPrice : faceModel.get('finalPrice') || 0,
            id_city    : faceModel.get('id_city'),
            id_size    : faceModel.get('id_size'),
            id_catab   : faceModel.get('id_catab'),
            catab      : faceModel.get('catab'),
            angle      : faceModel.get('angle'),
            lat        : faceModel.get('lat'),
            lon        : faceModel.get('lon'),
            num        : faceModel.get('num'),
            turf       : faceModel.get('lat') && faceModel.get('lon') ? turf.point([ parseFloat(faceModel.get('lon')), parseFloat(faceModel.get('lat'))]) : null
        };
    },

    getPreparedFaces: function (store) {
        var me = this,
            res = [];
        store.each(function(faceModel){
            res.push(me.getPlainFace(faceModel));
        });
        return res;
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
                city.set('facesCount', city.faces().count());
            }
        });
        // allCities.each(function(rec){
        //     rec.set('facesCount', rec.faces().count());
        // });
    },

    onDestroy: function () {
      var me = this;
      Bigmedia.AutoPlan.un('cityprepared', me.cityPrepared);
      Bigmedia.AutoPlan.un('algorithmcompleted', me.algorithmCompleted);
      Bigmedia.AutoPlan.un('terminated', me.onAutoPlanTerminate);
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
          var resStore = vm.get('resAlgorithms');
          resStore.removeAll();
          planVarStore.each((plan) => {
            var algo = resStore.getById(plan.get('algorithm'));
            if (!algo) {
              resStore.add({
                id: plan.get('algorithm'),
                algorithm: plan.get('algorithm'),
                boards: plan.get('boards'),
                sumOts: plan.get('ots'),
                budget: plan.get('budget'),
                coverage: Math.round(plan.get('coverage') * 100) / 100,
                faces: plan.faces().getRange()
              });
            } else {
              algo.set('boards', algo.get('boards') + plan.get('boards'));
              algo.set('sumOts', algo.get('sumOts') + plan.get('ots'));
              algo.set('budget', algo.get('budget') + plan.get('budget'));
              algo.set('coverage', (algo.get('coverage') + plan.get('coverage')) / 2);
              algo.set('faces', algo.get('faces').concat(plan.faces().getRange()));
            }
          });
          var minPrice = resStore.getById('MinPrice'),
            maxCoverage = resStore.getById('MaxCoverage'),
            optimal = resStore.getById('MaxGRPDivPrice');
          vm.set({
            minPrice: minPrice,
            maxCoverage: maxCoverage,
            optimal: optimal
          });
          vm.set('step', 4);
            // vm.get('chainedVarStore').sort('cpt','ASC');
            // vm.set({
            //     selectedCity: planStore.getAt(0)
            // });
            // vm.notify();
            // vm.get('chainedVarStore').sort([{
            //         property: 'cpt',
            //         direction: 'ASC'
            //     }, {
            //         property: 'budget',
            //         direction: 'ASC'
            //     }]);
            // vm.get('chainedVarStore').sort('city','ASC');
            // vm.set({
            //     selectedVariant: vm.get('chainedVarStore').getAt(0)
            // });
            // vm.notify();
            // var resCitiesStore = vm.get('resCitiesStore');
            // resCitiesStore.removeAll();
            // planStore.each(function(city){
            //     resCitiesStore.add({
            //         id: city.getId(),
            //         name: city.get('name')
            //     });
            // });
            // var repStore = vm.get('repStore');
            // repStore.fireEventArgs('refreshonmap', [repStore]);
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

    onAutoPlanTerminate: function () {
      var me = this;

    },

    loadCities: function () {
        var me = this,
            allCities = me.getViewModel().getStore('allCities'),
            citiesStore = Ext.getStore('Cities'),
            cityBoundStore = Ext.getStore('CityBoundaries');
        if (!cityBoundStore.isLoaded()) {
            cityBoundStore.on({
                load: {
                    fn: me.loadCities,
                    scope: me,
                    single: true
                }
            });
            return;
        }
        citiesStore.each(function(rec){
            var cityBound = cityBoundStore.getById(rec.getId());
            if (cityBound && cityBound.get('area')) {
                allCities.add({
                    id: rec.getId(),
                    name: rec.get('name'),
                    area: cityBound ? cityBound.get('area') / 1000000 : null
                });
            }
        });
    },

});
