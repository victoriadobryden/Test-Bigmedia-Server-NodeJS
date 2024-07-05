Ext.define('Bigmedia.view.dialog.DlgAutoPlanNoobController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dialog-dlgautoplannoob',

    listen: {
      store: {
        '#simpleplancities': {
          datachanged: function (store) {
            this.getViewModel().set('planCitiesCount', store.count());
          }
        }
      }
    },

    bindings: {
      onPlanCitiesChange: '{planCities}',
      onStepChange: '{step}'
    },

    onStepChange: function (step) {
      var me = this,
        vm = me.getViewModel();
      if (step == 2) {
        if (!me.citiesSelected) {
          var grids = ['gridobl', 'gridmil', 'gridwest'];
          grids.forEach((grid) => {
            me.lookup(grid).getSelectionModel().selectAll()
          });
        }
      }
    },

    onCityRadioChange: function (radio, value) {
      var me = this;
      if (value) {
        me.citiesSelected = true;
        Ext.defer(me.updateAutoPlanCitiesParams, 100, me);
      }
    },

    onCitiesSelectionChange: function () {
      var me = this;
      if (me.citiesSelected) {
        me.updateAutoPlanCitiesParams();
      }
    },

    updateAutoPlanCitiesParams: function () {
      var me = this,
        citiesContainer = me.lookup('citiesparamscontainer'),
        vm = me.getViewModel(),
        obl = vm.get('oblCenters'),
        west = vm.get('westUkraine'),
        mil = vm.get('milCities'),
        all = vm.get('manualCities');
      var grid;
      vm.getStore('allCities').each((city)=>city.set('checked', false));
      if (obl) {
        grid = me.lookup('gridobl')
      } else if (west) {
        grid = me.lookup('gridwest')
      } else if (mil) {
        grid = me.lookup('gridmil')
      } else {
        grid = me.lookup('gridall')
      }
      citiesContainer.items.each((cityParams) => {
        cityParams.setHidden(true);
      })
      var citiesAdd = [];
      grid.getSelectionModel().getSelection().forEach((city) => {
        city.set('checked', true);
        var cityParams = citiesContainer.queryById('cityparams-' + city.getId());
        if (cityParams) {
          cityParams.setHidden(false)
        } else {
          citiesAdd.push({
            xtype: 'autoplancityparams',
            reference: 'cityparams-' + city.getId(),
            id: 'cityparams-' + city.getId(),
            city: city.get('name'),
            cityRec: city,
            anchor: '100%',
            hideParams: true,
            hidden: false
          });
        }
      })
      citiesContainer.add(citiesAdd);
      var foundFaces = [];
      citiesContainer.items.each((cityParams) => {
        if (!cityParams.getHidden()) {
          cityParams.getCityRec().faces().each(function(f){
            foundFaces.push(f);
          })
        }
      });
      vm.set('foundFaces', foundFaces);
    },

    onPlanCitiesChange: function (value) {
      console.log(value);
    },

    init: function (view) {
      var me = this;
      var fStore = Ext.getStore('Faces');
      me.callParent(view);
      var vm = me.getViewModel();
      Bigmedia.AutoPlan.on('cityprepared', me.cityPrepared, me);
      Bigmedia.AutoPlan.on('algorithmcompleted', me.algorithmCompleted, me);
      Bigmedia.AutoPlan.on('terminated', me.onAutoPlanTerminate, me);
      if (!fStore.isLoaded()) {
        fStore.on({
          workerload: {
              fn: me.loadFaces,
              scope: me,
              single: true
          }
        });
        return;
      }
      me.loadFaces();
    },

    onDateRangePeriodChanged: function (period) {
      // console.log('onDateRangePeriodChanged');
      var me = this,
        vm = me.getViewModel();
      vm.set({
        startDate: period.startDate,
        endDate: period.endDate
      })
      Ext.defer(me.updateFacesInCities, 100, me, [vm.getStore('srcFaces')]);
    },

    loadFaces: function () {
      var me = this,
        vm = me.getViewModel(),
        fStore = Ext.getStore('Faces');
      var toAdd = [];
      fStore.getDataSource().each(function(item){
        if ((item.get('price') > 0) && !!item.get('lon') && !!item.get('lat')) {
          var rec = item.copy();
          toAdd.push(rec);
        }
      });
      vm.getStore('srcFaces').add(toAdd);
      me.loadCities();
      me.updateFacesInCities(vm.getStore('srcFaces'));
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
        checkedCities = vm.getStore('checkedCitiesStore'),
        sp = checkedCities.sum('population'),
        last = checkedCities.last(),
        sum = 0;
      checkedCities.each((c) => {
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
        planVarStore = vm.get('planVarStore'),
        planStore = vm.get('planStore');
      var alg = minPrice.getValue() ? 'MinPrice' : maxCoverage.getValue() ? 'MaxCoverage' : 'MaxGRPDivPrice',
        algName = minPrice.getValue() ? 'Дешевші борди' : maxCoverage.getValue() ? 'Ексклюзивні щити' : 'Оптимальний'
      var resStore = vm.get('resAlgorithms'),
        res = resStore.getById(alg);
      if (res) {
        // me.getView().fireEvent('finished', res.get('faces'));
        var cities = [];
        planStore.each((city) => cities.push({
          id: city.getId(),
          budget: city.get('budget'),
          quantity: city.get('quantity'),
          coverage: city.get('coverage')
        }))
        var facesHash = res.get('faces').reduce((res, face)=>{
          res[face.getId()] = { id: +face.getId(),
            price: face.get('finalPrice')
          }
          return res
        }, {})
        var poisHash = {};
        if (me.filteredFacesByPoiCats) {
          me.filteredFacesByPoiCats.forEach((item) => {
            if (facesHash[item.id_face]) {
              poisHash[item.id_poi] = +item.id_poi
            }
          });
        }
        var params = {
          startDate: Ext.Date.localToUtc(vm.get('startDate')),
          endDate: Ext.Date.localToUtc(vm.get('endDate')),
          cities: cities,
          poicats: vm.get('selPoiCats'),
          pois: Object.values(poisHash),
          faces: facesHash,
          algorithm: algName
        }
        var dlg = Ext.create('Bigmedia.view.dialog.DlgNoobSaveResult');
        dlg.on('send', me.onSendClick, me, {args: [params]});
        dlg.show();
        // me.getView().close();
      }
    },

    onSendClick: function (params, contact) {
      // console.log([params, contact]);
      var me = this,
        dlg = me.lookup('simplefinish'),
        vm = me.getViewModel();
      vm.set('saving', true);
      dlg.show();
      // Ext.defer(function(){
      //   vm.set('saving', false)
      // }, 3000, me);
      // return;
      var p = Ext.merge(params, contact);
      // console.log(p);
      fetch('/api/v1/noobcreatecampaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(p)
      }).then((response)=>{
        if (!response || !response.ok) {
          dlg.hide();
          Bigmedia.Vars.showToast('В процесі збереження даних трапилась помилка', 'x-fa fa-sad-tear', '#FF0000')
        } else {
          vm.set('saving', false);
        }
      });
    },

    initPlanVarStore: function () {
        var me = this,
            vm = me.getViewModel(),
            planVarStore = vm.get('planVarStore'),
            finalStore = vm.get('finalStore');
        planVarStore.removeAll();
        finalStore.removeAll();
    },

    startPlanning: function (filteredFaces) {
      var me = this,
          view = this.getView(),
          vm = me.getViewModel(),
          srcStore = vm.getStore('srcFaces'),
          repStore = vm.getStore('repStore'),
          planStore = vm.get('planStore'),
          citiesStore = Ext.getStore('CityBoundaries');
      var splitAB = {
        A: 80,
        B: 20
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
      me.initPlanVarStore();
      var commonParams = {
          maxOnStreet: 10,
          minDistance: 200,
          minDistanceOnStreet: 200,
          approxCellSize: 0.1,
          coverageDays: Ext.clone(Bigmedia.Vars.coverageDays)
      }
      var cities = {},
        citiesContainer = me.lookup('cities');
      planStore.each(function(planCity){
          var city = citiesStore.getById(planCity.getId());
          var selSizes = {}, selSuppliers = {};
          planCity.set('progress', 0);
          cities[planCity.getId()] = {
              id: city.getId(),
              planBudget: planCity.get('budget'),
              planBoards: planCity.get('quantity'),
              planCoverage: planCity.get('coverage'),
              planSizes: null,
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
                      values: null,
                      // type: 'count'
                      type: 'budget'
                  }
              ]
          }
      });
      var source = me.getPreparedFaces(store);
      vm.set('facesCount', source.length);
      // gtag('event', 'start_planning', {
      //     'event_category': 'PLANNER',
      //     'event_label': 'start planner'
      // });
      // console.log([cities, commonParams]);
      Bigmedia.AutoPlan.fireEventArgs('start', [source, cities, commonParams], Bigmedia.AutoPlan);
    },

    onStartClick: function () {
      var me = this,
          vm = me.getViewModel();
      delete me.filteredFacesByPoiCats;
      me.lookup('progress').wait({
        text: 'Planning is in progress...'
      });
      vm.set('step', 5);
      var selPoiCats = [],
        accordion = me.lookup('poicatsaccordion'),
        filteredFaces;
      accordion.items.each((item) => {
        selPoiCats = selPoiCats.concat(item.getSelCats());
      });

      vm.set('selPoiCats', selPoiCats);

      if (selPoiCats.length > 0) {
        var planStore = vm.get('planStore'),
          cities = [];
        planStore.each((city) => cities.push(city.getId()));
        var params = {
          poicats: selPoiCats,
          cities: cities
        }
        fetch('/api/v1/facesbypoicats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        }).then((response)=>{
          return response.json();
        }).then((faces) => {
          if (!faces.length) {
            vm.set('step', 4);
            Bigmedia.Vars.showToast('Нажаль, ми не знайшли бордів біля вказаних категорій об\'єктів', 'x-fa fa-sad-tear', '#FF0000')
            return;
          }
          me.filteredFacesByPoiCats = faces;
          me.startPlanning();
        })
      } else {
        me.startPlanning()
      }
    },

    getPlainFace: function (faceModel) {
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
            res = [],
            filteredKeys = {};
        if (me.filteredFacesByPoiCats) {
          me.filteredFacesByPoiCats.forEach((item) => {
            filteredKeys[item.id_face] = item.id_face;
          });
        }
        store.each(function(faceModel){
          if (!me.filteredFacesByPoiCats || filteredKeys[faceModel.getId()]) {
            res.push(me.getPlainFace(faceModel));
          }
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
        if (vm.get('startDate') && vm.get('endDate')) {
          me.updatePeriodFilter({startDate: vm.get('startDate'), endDate: vm.get('endDate')});
        }
        store.each(function(face){
            var city = allCities.getById(face.get('id_city'));
            if (city) {
                city.faces().add(face);
                // city.set('facesCount', city.faces().count());
            }
        });
        // console.log(vm.getStore('allCities').getCount());
        allCities.getDataSource().each(function(rec){
            rec.set('facesCount', rec.faces().count());
        });
    },

    updatePeriodFilter: function (period) {
      // console.log('updatePeriodFilter: %o', period);
      var store = this.getViewModel().getStore('srcFaces'),
        filters = store.getFilters();
      var periodFilter = filters.getByKey('filter_period');
      if (periodFilter && +periodFilter.startDate === +period.startDate && +periodFilter.endDate === +period.endDate) {
        // console.log('skip same period');
        return;
      }
      try {
        var wholePeriod = false,
          minFreeDays = 14,
          allowTempRes = true,
          now = new Date(),
          minDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
          checkedStart = (+period.startDate < +minDate) ? minDate : period.startDate,
          checkedEnd = (+period.endDate < +minDate) ? minDate : period.endDate,
          daysToBeg = Math.round((checkedStart - minDate) / (3600 * 24 * 1000)),
          daysPeriod = Math.round((checkedEnd - checkedStart) / (3600 * 24 * 1000));
        if (daysToBeg < 0) {
          daysToBeg = 0;
        }
        var res,
          re = /(\d+)(\w)/g;
        // var freeRe = new RegExp('^.{' + daysToBeg + (wholePeriod ? '' : ',' + (daysToBeg + daysPeriod - minFreeDays)) + '}(' + (allowTempRes ? '[tf]' : 'f') + '{' + daysPeriod +'})');
        var freeRe = new RegExp('^' + (wholePeriod ? '' : '.*?') + '(' + (allowTempRes ? '[tf]' : 'f') + (wholePeriod ? ')+$' : '{' + minFreeDays + '})'));
        var fltr = new Ext.util.Filter({
          id: 'filter_period',
          filterFn: function (rec) {
            var occ = rec.get('occByDays');
            return !occ || freeRe.test(occ.substring(daysToBeg, daysToBeg + daysPeriod));
          }
        });
        fltr.startDate = period.startDate;
        fltr.endDate = period.endDate;
        // filters.add(fltr);
        store.addFilter(fltr);
      } catch (e) {
        console.log(e);
      } finally {
      }
    },

    onDestroy: function () {
      var me = this;
      Bigmedia.AutoPlan.un('cityprepared', me.cityPrepared);
      Bigmedia.AutoPlan.un('algorithmcompleted', me.algorithmCompleted);
      Bigmedia.AutoPlan.un('terminated', me.onAutoPlanTerminate);
    },

    algorithmCompleted: function (cityId, algorithm, faces) {
      // console.log('algorithmCompleted');
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
        // console.log(planStore.min('progress'));
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
          vm.set('step', 6);
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
