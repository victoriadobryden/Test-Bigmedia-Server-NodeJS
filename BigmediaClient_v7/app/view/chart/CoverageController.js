Ext.define('Bigmedia.view.chart.CoverageController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.coverage',

    requires: [
        'Bigmedia.store.Faces',
        'Bigmedia.store.Cities'
    ],

    onFacesStoreAdd: function (store, records) {
        var me = this,
            viewModel = me.getViewModel(),
            coverStore = viewModel.getStore('allCovers'),
            cities = {};
        cities = records.reduce(function (res, rec) {
            var face = rec.get('face') ? rec.get('face') : rec;
            if (!face.get('coverages')) {
                var coverages = Bigmedia.Vars.calculateFaceCoverages(face);
                if (!coverages) {
                    // face.set('coverages', coverages);
                // } else {
                    return res;
                }
            }
            if (!res[face.get('id_city')]) {
                res[face.get('id_city')] = {id_city: face.get('id_city'), records:[face], coverages: face.get('coverages'), grps: face.get('grp') || 0.01};
            } else {
                res[face.get('id_city')].records.push(face);
                res[face.get('id_city')].coverages = res[face.get('id_city')].coverages.map(function(coverage, i){
                        var res;
                        try {
                            res = coverage.union(face.get('coverages')[i]);
                        } catch (e) {
                            console.error('error calculate union 001');
                            res = coverage;
                        }
                        return res
                });
                res[face.get('id_city')].grps += face.get('grp') ? face.get('grp') : 0.01;
            }
            return res;
        }, {});
        // console.log(cities);
        var cityBoundaries = Ext.getStore('CityBoundaries');
        Object.keys(cities).forEach(function (id_city) {
            var cityIx = coverStore.findExact('id_city', id_city);
            if (cityIx < 0) {
                var city = cityBoundaries.getById(id_city);
                if (city) {
                    var recs = [];
                    Bigmedia.Vars.coverageDays.forEach(function(day, i){
                        recs.push({id_city: id_city, day: day, dayIndex: i, covMax: 0, grps: 0, coverages: null});
                            });
                    coverStore.add(recs)
                }
            }
        });
        coverStore.each(function(rec) {
            if (cities[rec.get('id_city')]) {
                var id_city = rec.get('id_city');
                var city = cityBoundaries.getById(id_city);
                var coverages = rec.get('coverages');
                var grps = cities[id_city].grps;
                if (coverages) {
                    try {
                        coverages = coverages.union(cities[id_city].coverages[rec.get('dayIndex')]);
                    } catch (e) {
                        console.error('error calculate union 002');
                    }
                } else {
                    coverages = cities[id_city].coverages[rec.get('dayIndex')];
                }
                // console.log(coverages);
                if (coverages) {
                    var union, intersected, area = 0;
                    try {
                        union = jsts.operation.union.UnaryUnionOp.union(coverages) ;
                        intersected = jsts.operation.overlay.OverlayOp.intersection(city.get('jsts'), union);
                        area = turf.area(Bigmedia.Vars.convertJstsToTurf(intersected));
                    } catch (e) {
                        console.error('error calculate union 003');
                    }
                    rec.set({covMax: area * 100 / city.get('area'), grps: rec.get('grps') + grps * rec.get('day'), coverages: coverages, coverage: intersected});
                }
            }
        });
        var citiesStore = me.getCitiesStore(store);
        me.getViewModel().set('citiesData', citiesStore);
        me.updateMapData();
    },

    onFacesStoreClear: function (store) {
        var me = this,
            viewModel = me.getViewModel(),
            coverStore =  me.getViewModel().getStore('allCovers');
        coverStore.removeAll();
        var citiesStore = me.getCitiesStore(store);
        me.getViewModel().set('citiesData', citiesStore);
        me.updateMapData();
    },

    onFacesStoreRemove: function (store, records) {
        var me = this,
            viewModel = me.getViewModel(),
            coverStore =  me.getViewModel().getStore('allCovers'),
            removeCities = {};
        removeCities = records.reduce(function (res, rec) {
            if (!res[rec.get('id_city')]) {
                res[rec.get('id_city')] = {id_city: rec.get('id_city')};
            }
            return res;
        }, {});
        var citiesStore = Ext.getStore('CityBoundaries');
        // var unfiltered = cartCoverages.getData().getSource() || store.getData();
        Object.keys(removeCities).forEach(function(id_city) {
            while(coverStore.findExact('id_city', id_city) >= 0) {
                coverStore.removeAt(coverStore.findExact('id_city', id_city));
            }
        });
        var cities = {};
        store.each(function(rec){
            var face = rec.get('face') ? rec.get('face') : rec;
            if (citiesStore.getById(face.get('id_city')) && removeCities[face.get('id_city')]) {
                if(!cities[face.get('id_city')]) {
                    cities[face.get('id_city')] = {coverages: [], grps: 0};
                }
                cities[face.get('id_city')].grps += face.get('grp') ? face.get('grp') : 0.01;
                Bigmedia.Vars.coverageDays.forEach(function(day, i){
                    if (!face.get('coverages')) {
                        var coverages = Bigmedia.Vars.calculateFaceCoverages(face);
                        // if (coverages) {
                        //     face.set('coverages', coverages);
                        // }
                    }
                    if (face.get('coverages') && face.get('coverages')[i]) {
                        if (!cities[face.get('id_city')].coverages[i]) {
                            cities[face.get('id_city')].coverages.push(face.get('coverages')[i]);
                        } else {
                            try {
                                cities[face.get('id_city')].coverages[i] = cities[face.get('id_city')].coverages[i].union(face.get('coverages')[i]);
                            } catch (e) {
                                console.error('error calculate union 004');
                            }
                        }
                    }
                });
            }
        });
        var recs = [];
        var maxCity = null;
        Object.keys(cities).forEach(function(id_city){
            var city = citiesStore.getById(id_city);
            if (city) {
                Bigmedia.Vars.coverageDays.forEach(function(day, i){
                    if (cities[id_city].coverages[i]) {
                        var union, intersected, area = 0
                        try {
                            union = jsts.operation.union.UnaryUnionOp.union(cities[id_city].coverages[i]);
                            intersected = jsts.operation.overlay.OverlayOp.intersection(city.get('jsts'), union);
                            area = turf.area(Bigmedia.Vars.convertJstsToTurf(intersected));
                        } catch (e) {
                            console.error('error calculate union 005');
                        }
                        recs.push({id_city: id_city, dayIndex: i, day: day, covMax: area * 100 / city.get('area'), grps: cities[id_city].grps * day, coverages: cities[id_city].coverages[i], coverage: intersected});
                    }
                });
                if (! maxCity || maxCity.get('area') < city.get('area')) {
                    maxCity = city;
                }
            }
        });
        // Object.keys(cities).forEach(function(id_city){
        //     var city = cityBoundaries.getById(id_city);
        //     if (city) {
        //         Bigmedia.Vars.coverageDays.forEach(function(day, i){
        //             var union = jsts.operation.union.UnaryUnionOp.union(cities[id_city].coverages[i]);
        //             var intersected = jsts.operation.overlay.OverlayOp.intersection(city.get('jsts'), union);
        //             var area = turf.area(Bigmedia.Vars.convertJstsToTurf(intersected));
        //             recs.push({id_city: id_city, day: day, covMax: area * 100 / city.get('area'), grps: cities[id_city].grps * day});
        //         });
        //     }
        // });
        // console.log(recs);
        coverStore.add(recs);
        var citiesStore = me.getCitiesStore(store);
        me.getViewModel().set('citiesData', citiesStore);
        me.updateMapData();
    },

    updateMapData: function () {
        var me = this,
            mapView = me.getView().getMapView();
        if (mapView && mapView.getMap()) {
            var map = mapView.getMap(),
            coverStore =  me.getViewModel().getStore('allCovers');
            // map.cartCoveragesLayer.getSource().clear(true);
            // var features = [];
            // coverStore.each(function(rec) {
            //     if (rec.get('dayIndex') === 0) {
            //         var olFeature = Bigmedia.Vars.convertJstsToOl(rec.get('coverage'), map.getView().getProjection());
            //         features.push(olFeature);
            //     }
            // });
            // map.cartCoveragesLayer.getSource().addFeatures(features);
        }
    },

    onCityItemHighlight: function (chart, cityItem) {
        var me = this;
        me.updateCity(cityItem.record.getId(), cityItem.record.get('value'));
    },

    updateCity: function (id, name) {
        var me = this,
            chartCoverage = me.lookup('chartCoverage');
        chartCoverage.getSurface('chart').get('cityName').setAttributes({
                text: name
            });
        me.getViewModel().set('cityId', id);
    },

    // init: function() {
    //     this.loadData();
    // },

    loadData: function (store) {
        var me = this,
            facesStore = store || me.getView().getFacesStore(),
            citiesStore = Ext.getStore('CityBoundaries'),
            allCovers = me.getViewModel().getStore('allCovers'),
            cities = {};
        me.updateCity(null, '');
        if (!facesStore) { return;}
        facesStore.each(function(rec){
            var face = rec.get('face') ? rec.get('face') : rec;
            // console.log(rec);
            if (citiesStore.getById(face.get('id_city'))) {
                if(!cities[face.get('id_city')]) {
                    cities[face.get('id_city')] = {coverages: [], grps: 0};
                }
                cities[face.get('id_city')].grps += face.get('grp') ? face.get('grp') : 0.01;
                Bigmedia.Vars.coverageDays.forEach(function(day, i){
                    if (!face.get('coverages')) {
                        var coverages = Bigmedia.Vars.calculateFaceCoverages(face);
                        // already in calculateFaceCoverages
                        // if (coverages) {
                        //     face.set('coverages', coverages, {silent: true});
                        // }
                    }
                    if (face.get('coverages') && face.get('coverages')[i]) {
                        if (!cities[face.get('id_city')].coverages[i]) {
                            cities[face.get('id_city')].coverages.push(face.get('coverages')[i]);
                        } else {
                            try {
                                cities[face.get('id_city')].coverages[i] = cities[face.get('id_city')].coverages[i].union(face.get('coverages')[i]);
                            } catch (e) {
                                console.error('error union coverages: %o', face);
                            } finally {

                            }
                        }
                    }
                });
            }
        });
        var recs = [];
        var maxCity = null;
        Object.keys(cities).forEach(function(id_city){
            var city = citiesStore.getById(id_city);
            if (city) {
                Bigmedia.Vars.coverageDays.forEach(function(day, i){
                    if (cities[id_city].coverages[i]) {
                        var union, intersected, area = 0;
                        try {
                            union = jsts.operation.union.UnaryUnionOp.union(cities[id_city].coverages[i]);
                            intersected = jsts.operation.overlay.OverlayOp.intersection(city.get('jsts'), union);
                            area = turf.area(Bigmedia.Vars.convertJstsToTurf(intersected));
                        } catch (e) {
                            console.error('error calculate union 006');
                        }
                        recs.push({id_city: id_city, dayIndex: i, day: day, covMax: area * 100 / city.get('area'), grps: cities[id_city].grps * day, coverages: cities[id_city].coverages[i], coverage: intersected});
                    }
                });
                if (! maxCity || maxCity.get('area') < city.get('area')) {
                    maxCity = city;
                }
            }
        });
        // console.log(recs);
        allCovers.add(recs);
        if (!me.getViewModel().get('cityId') && maxCity) {
            var city = Ext.getStore('Cities').getById(maxCity.getId());
            if (city) {
                me.updateCity(city.getId(), city.get('name'));
            }
        }
        var citiesStore = me.getCitiesStore(facesStore);
        me.getViewModel().set('citiesData', citiesStore);
        me.updateMapData();
    },

    onBeforeRender: function (chart) {
        var me = this;
        // console.log('onBeforeRender');
        // Ext.defer(me.loadData, 100, me, [chart]);
    },

    getCitiesStore: function (source) {
        var me = this,
            store = Ext.create('Ext.data.ChainedStore',{
                source: source
            }), data;
        var groups = {};
        store.each(function(rec){
            var face = rec.get('face') ? rec.get('face') : rec;
            var item = groups[face.get('id_city')];
            if (!item) {
                groups[face.get('id_city')] = {value: face.get('city'), count: 0, id: face.get('id_city')};
                item = groups[face.get('id_city')];
            }
            item.count++;
        });
        data = Object.keys(groups).sort().map(function(item){
            return groups[item];
        });
        var groupStore = Ext.create('Ext.data.Store', {
            fields: [{
                name: 'id'
            }, {
                name:'value'
            }, {
                name: 'count'
            }, {
                name: 'budget'
            }],
            data: data
        });
        store.destroy();
        return groupStore;
    }
});
