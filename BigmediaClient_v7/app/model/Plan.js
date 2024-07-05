Ext.define('Bigmedia.model.PlanCity', {
    extend: 'Ext.data.Model',
    hasMany: [
        {model: 'Split', name: 'sizes'},
        {model: 'Split', name: 'selsizes'},
        {model: 'Split', name: 'suppliers'},
        {model: 'Face', name: 'faces'},
        {model: 'Split', name: 'selsuppliers'}
    ],//, associationKey: 'plansizes'},
    // hasMany: {model: 'PlanSelSize', name: 'selsizes', associationKey: 'planselsizes'},
    fields: [
        {name: 'id'},
        {name: 'name', type: 'string'},
        {name: 'budget', type: 'float', defaultValue: null, allowNull: true},
        // {name: 'occupancy', type: 'float'},
        {name: 'coverage', type: 'float', defaultValue: null, allowNull: true},
        {name: 'quantity', type: 'integer', defaultValue: null, allowNull: true},
        {name: 'facesCount', type: 'integer'},
        {name: 'population',
            calculate: function (data) {
                var city = Ext.getStore('Cities').getById(data.id);
                if (city) {
                    return city.get('population') / 1000;
                }
            }},
        {name: 'area' },
        // {name: 'area',
        //     calculate: function (data) {
        //         var city = Ext.getStore('CityBoundaries').getById(data.id);
        //         if (city) {
        //             console.log(city.get('area') / 1000000);
        //             return city.get('area') / 1000000;
        //         }
        //     }},
        {name: 'populationPart',
            calculate: function (data) {
                return data.population / 40000 * 100;
            }},
        {name: 'selected'},
        {name: 'progress'}
    ],
    proxy: {
        type: 'memory',
        autoLoad: true
    }
});

Ext.define('Bigmedia.model.Split', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id'},
        { name: 'name', type: 'string'},
        { name: 'min'},
        { name: 'max'},
        { name: 'count'},
        { name: 'limits'},
        { name: 'quantity'},
        {name: 'longname',
            calculate: function (data) {
                return data.name + ' (' + data.quantity + ' found)';
            }
        }
    ],
    proxy: {
        type: 'memory',
        autoLoad: true
    }
});

// Ext.define('Bigmedia.model.PlanSize', {
//     extend: 'Ext.data.Model',
//     belongsTo: 'PlanCity',
//     fields: [
//         {name: 'id'},
//         {name: 'name', type: 'string'},
//         {name: 'quantity', type: 'integer'},
//         {name: 'longname',
//             calculate: function (data) {
//                 return data.name + ' (' + data.quantity + ' found)';
//             }
//         }
//     ],
//     proxy: {
//         autoLoad: false,
//         type: 'memory'
//     }
// });
//
// Ext.define('Bigmedia.model.PlanSelSize', {
//     extend: 'Ext.data.Model',
//     fields: [
//         {name: 'planCityId',
//             reference: {
//                 parent: 'PlanCity',
//                 inverse: 'selsizes'
//             }
//         },
//         {name: 'id'},
//         {name: 'name', type: 'string'},
//         {name: 'quantity', type: 'integer'},
//         {name: 'limit', type: 'integer'},
//         {name: 'longname',
//             calculate: function (data) {
//                 return data.name + ' (' + data.quantity + ' found)';
//             }
//         }
//     ],
//     proxy: {
//         autoLoad: false,
//         type: 'memory'
//     }
// });
//
// Ext.define('Bigmedia.model.PlanSupplier', {
//     extend: 'Ext.data.Model',
//     belongsTo: 'PlanCity',
//     fields: [
//         {name: 'id'},
//         {name: 'name', type: 'string'},
//         {name: 'quantity', type: 'integer'},
//         {name: 'longname',
//             calculate: function (data) {
//                 return data.name + ' (' + data.quantity + ' found)';
//             }
//         }
//     ],
//     proxy: {
//         autoLoad: false,
//         type: 'memory'
//     }
// });

// Ext.define('Bigmedia.model.PlanSelSupplier', {
//     extend: 'Ext.data.Model',
//     fields: [
//         {name: 'planCityId',
//             reference: {
//                 parent: 'PlanCity',
//                 inverse: 'selsuppliers'
//             }
//         },
//         {name: 'id'},
//         {name: 'name', type: 'string'},
//         {name: 'quantity', type: 'integer'},
//         {name: 'min', type: 'integer'},
//         {name: 'max', type: 'integer'},
//         {name: 'longname',
//             calculate: function (data) {
//                 return data.name + ' (' + data.quantity + ' found)';
//             }
//         }
//     ],
//     proxy: {
//         autoLoad: false,
//         type: 'memory'
//     }
// });

Ext.define('Bigmedia.model.ResAlgorithm', {
  extend: 'Ext.data.Model',
  hasMany: {model: 'Face', name: 'faces'}, //, associationKey: 'planfaces'},
  // hasMany: {model: 'PlanSelSize', name: 'selsizes', associationKey: 'planselsizes'},
  fields: [
    {name: 'id'},
    {name: 'algorithm', type: 'string'},
    {name: 'boards', type: 'integer'},
    {name: 'sumOts', type: 'float'},
    {name: 'ots', type: 'float'},
    {name: 'grp', type: 'float'},
    {name: 'cpt',
    calculate: function (data) {
      return data.budget / (data.sumOts * 30);
    }},
    {name: 'budget', type: 'float'},
    {name: 'coverage', type: 'float'},
    {name: 'selected', type: 'boolean'},
    {name: 'descr',
    calculate: function (data) {
      return Ext.String.format(Bigmedia.Locales.simpleResult.btnDescription, data.boards, data.ots, data.coverage, Ext.util.Format.currency(Math.round(data.cpt * 100) / 100), Ext.util.Format.currency(Math.round(data.budget)));
    }}
  ],
  proxy: {
    type: 'memory'
    // ,
    // enablePaging: true
  }
});

Ext.define('Bigmedia.model.PlanVariant', {
    extend: 'Ext.data.Model',
    hasMany: {model: 'Face', name: 'faces'}, //, associationKey: 'planfaces'},
    // hasMany: {model: 'PlanSelSize', name: 'selsizes', associationKey: 'planselsizes'},
    fields: [
        {name: 'id'},
        {name: 'algorithm', type: 'string'},
        {name: 'id_city', type: 'integer'},
        {name: 'city', type: 'string'},
        {name: 'boards', type: 'integer'},
        {name: 'ots', type: 'float'},
        {name: 'grp', type: 'float'},
        {name: 'cpt',
            calculate: function (data) {
                return data.budget / (data.ots * 30);
            }},
        {name: 'budget', type: 'float'},
        {name: 'coverage', type: 'float'},
        {name: 'selected', type: 'boolean'},
        {name: 'descr',
            calculate: function (data) {
                return Ext.String.format(Bigmedia.Locales.simpleResult.btnDescription, data.boards, data.ots, data.coverage, Ext.util.Format.currency(Math.round(data.cpt * 100) / 100), Ext.util.Format.currency(Math.round(data.budget)));
            }}
    ],
    proxy: {
        type: 'memory'
        // ,
        // enablePaging: true
    },

    // getCoverageStat: function (dayIndex) {
    //     var me = this,
    //         dayIx = dayIndex || Bigmedia.Vars.coverageDays.length - 1,
    //         data = me.getCoveragesAt(dayIndex);
    //     if (!idCity && me.get('id_city')) {
    //         idCity = me.get('id_city');
    //     }
    //     var rec = data.filter(function(item){
    //         return +item.dayIndex === +dayIx;
    //     });
    //     if (rec && rec.length > 0) {
    //         rec = rec[0];
    //         return {
    //             covMax: rec.covMax,
    //             coverage: rec.coverage,
    //             grps: rec.grps,
    //             day: rec.day
    //         }
    //     } else {
    //         return null;
    //     }
    // },

    getCovStat: function (dayIndex) {
        var me = this,
            citiesStore = Ext.getStore('CityBoundaries'),
            dayIx = dayIndex || Bigmedia.Vars.coverageDays.length - 1
            day = Bigmedia.Vars.coverageDays[dayIx],
            res = {coverage: null, grps: 0, coverages: [], dayIndex: dayIx, day: day},
            city = citiesStore.getById(me.get('id_city'));
        me.faces().each(function(rec){
            var face = rec.get('face') ? rec.get('face') : rec;
            if (city) {
                res.grps += face.get('grp') ? face.get('grp') : 0.01;
                if (!face.get('coverages')) {
                    Bigmedia.Vars.calculateFaceCoverages(face);
                }
                if (face.get('coverages') && face.get('coverages')[dayIx]) {
                    res.coverages.push(face.get('coverages')[dayIx]);
                } else {
                    console.log('no coverage: %o', face);
                }
            }
        });
        res.coverage = res.coverages.reduce(function(cov, fc){
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
        if (res.coverage) {
            try {
                var union = jsts.operation.union.UnaryUnionOp.union(res.coverage);
                var intersected = jsts.operation.overlay.OverlayOp.intersection(city.get('jsts'), union);
                var area = turf.area(Bigmedia.Vars.convertJstsToTurf(intersected));
                res.coverage = intersected;
                res.area = area;
                res.covMax = area * 100 / city.get('area');
                res.grps = res.grps * day;
            } catch (e) {
                console.error('error calculate coverage');
            }
        }
        return res;
    }
    // ,
    //
    // getCoverages: function () {
    //     var me = this,
    //         recs = [];
    //     Bigmedia.Vars.coverageDays.forEach(function(day, dayIx){
    //         recs = recs.concat(me.getCoveragesAt(dayIx));
    //     })
    //     return recs;
    // }
});
