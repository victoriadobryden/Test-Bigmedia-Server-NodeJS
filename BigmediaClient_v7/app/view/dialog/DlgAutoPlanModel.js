Ext.define('Bigmedia.view.dialog.DlgAutoPlanModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.dialog-dlgautoplan',

  stores: {
    planVarStore: {
      type: 'planvarstore'
    },
    chainedVarStore: {
      source: '{planVarStore}',
      filters: [{
        property: 'id_city',
        value: '{selectedCity.id}',
        operator: '='
      }],
      sorters: [{
        property: 'city',
        direction: 'ASC'
      }]
    },
    finalStore: {
      type: 'plannerstore'
    },
    resCitiesStore: {
      fields: [
        'id', 'name'
      ],
      proxy: 'memory'
    },
    srcFaces: {
        model: 'Face',
        autoLoad: true,
        proxy: {
            type: 'memory'
        }
    },
    allCities: {
      model: 'PlanCity',
      proxy: 'memory',
      filters: [{
        property: 'facesCount',
        value: 0,
        operator: '>'
      }],
      // filters: [
      //     function(item) {
      //         // console.log(item);
      //         // return item.get('facesCount') > 0;
      //         return item.faces().count() > 0;
      //     }
      // ],
      sorters: [
          {
              property: 'population',
              direction: 'DESC'
          }
      ]
    },
    // filteredCities: {
    //     source: '{allCities}',
    //     filters: [
    //         function(item) {
    //             // console.log(item);
    //             // return item.get('facesCount') > 0;
    //             return item.faces().count() > 0;
    //         }
    //     ],
    //     sorters: [
    //         {
    //             property: 'population',
    //             direction: 'DESC'
    //         }
    //     ]
    // },
    planStore: {
        source: '{allCities}',
        filters: [
            function(item) {
                // console.log(item.selected);
                return !!item.get('budget') || !!item.get('quantity') || !!item.get('coverage');
            }
        ]
    },
    repStore: {
        model: 'Face',
        autoLoad: true,
        proxy: {
            type: 'memory'
        }
    },
    resAlgorithms: {
      model: 'ResAlgorithm',
      autoLoad: true,
      proxy: {
        type: 'memory'
      }
    }
  },

  formulas: {
    B: function (get) {
      return 100 - get('A');
    }
  },

  data: {
    steps: 2,
    step: 1,
    A: 80,
    maxOnStreet: 5,
    minDistanceOnStreet: 500,
    minDistance: 700,
    otsFrom: 1,
    minPrice: null,
    maxCoverage: null,
    optimal: null,
    saving: false
  }
});
