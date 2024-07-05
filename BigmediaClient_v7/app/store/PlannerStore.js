Ext.define('Bigmedia.store.PlannerStore', {
    extend: 'Ext.data.Store',
    //extend: 'Ext.data.ChainedStore',
    alias: 'store.plannerstore',

    model: 'Bigmedia.model.Face',

    requires: [
        'Bigmedia.model.Base',
        'Bigmedia.store.Faces'
    ],

    asynchronousLoad: false,

    autoLoad: true,

    proxy: {
        type: 'memory'
    },

    getCoverageStat: function (idCity, dayIndex) {
        var me = this,
            dayIx = dayIndex || Bigmedia.Vars.coverageDays.length - 1,
            data = me.getCoveragesAt(dayIndex);
        if (!idCity && me.getAt(0)) {
            idCity = me.getAt(0).get('id_city');
        }
        var rec = data.filter(function(item){
            return +item['id_city'] === +idCity && +item.dayIndex === +dayIx;
        });
        if (rec && rec.length > 0) {
            rec = rec[0];
            return {
                covMax: rec.covMax,
                coverage: rec.coverage,
                grps: rec.grps,
                day: rec.day
            }
        } else {
            return null;
        }
    },

    getCoveragesAt: function (dayIndex) {
        var me = this,
            citiesStore = Ext.getStore('CityBoundaries'),
            cities = {},
            dayIx = dayIndex || Bigmedia.Vars.coverageDays.length - 1;
        me.each(function(rec){
            var face = rec.get('face') ? rec.get('face') : rec;
            if (citiesStore.getById(face.get('id_city'))) {
                if(!cities[face.get('id_city')]) {
                    cities[face.get('id_city')] = {coverage: null, grps: 0, coverages: []};
                }
                cities[face.get('id_city')].grps += face.get('grp') ? face.get('grp') : 0.01;
                if (!face.get('coverages')) {
                    Bigmedia.Vars.calculateFaceCoverages(face);
                }
                if (face.get('coverages') && face.get('coverages')[dayIx]) {
                    cities[face.get('id_city')].coverages.push(face.get('coverages')[dayIx]);
                } else {
                    console.log('no coverage: %o', face);
                }
            }
        });
        var recs = [];
        Object.keys(cities).forEach(function(id_city){
            var city = citiesStore.getById(id_city);
            if (city) {
                cities[id_city].coverage = cities[id_city].coverages.reduce(function(cov, fc){
                    if (!cov) {
                        return fc
                    } else {
                        var res;
                        try {
                            res = cov.union(fc);
                        } catch (e) {
                            console.error('error union geometry');
                            res = cov;
                        }
                        return res
                    }
                }, null);
                if (cities[id_city].coverage) {
                    var union, intersected, area = 0;
                    try {
                        union = jsts.operation.union.UnaryUnionOp.union(cities[id_city].coverage);
                        intersected = jsts.operation.overlay.OverlayOp.intersection(city.get('jsts'), union);
                        area = turf.area(Bigmedia.Vars.convertJstsToTurf(intersected));
                    } catch (e) {
                        console.error('error calculate city coverage');
                    }
                    var day = Bigmedia.Vars.coverageDays[dayIx];
                    recs.push({id_city: id_city, dayIndex: dayIx, day: day, covMax: area * 100 / city.get('area'), grps: cities[id_city].grps * day, coverages: cities[id_city].coverages, coverage: intersected});
                }
            }
        });
        return recs;
    },

    getCoverages: function () {
        var me = this,
            recs = [];
        Bigmedia.Vars.coverageDays.forEach(function(day, dayIx){
            recs = recs.concat(me.getCoveragesAt(dayIx));
        })
        return recs;
    }
});
