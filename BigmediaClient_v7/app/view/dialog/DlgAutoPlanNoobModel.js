Ext.define('Bigmedia.view.dialog.DlgAutoPlanNoobModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.dialog-dlgautoplannoob',

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
      id: 'simplecities',
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
    millions: {
      source: '{allCities}',
      filters: [
          function(item) {
              // console.log(item.selected);
              return item.get('population') >= 700;
          }
      ]
    },
    west: {
      source: '{allCities}',
      filters: [
          function(item) {
              // console.log(item.selected);
              return [4,12,13,15,20,24,25,31].indexOf(item.getId()) >= 0;
          }
      ]
    },
    obls: {
      source: '{allCities}',
      filters: [
          function(item) {
              // console.log(item.selected);
              return [1,3,4,5,6,10,12,13,14,15,19,20,22,23,24,25,26,29,30,31,36,38].indexOf(item.getId()) >= 0;
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
    checkedCitiesStore: {
      source: '{allCities}',
      filters: [
        function(item) {
          return item.get('checked');
        }
      ],
      sorters: [
        {
          property: 'population',
          direction: 'DESC'
        }
      ]
    },
    planStore: {
        source: '{allCities}',
        id: 'simpleplancities',
        filters: [
            function(item) {
                // console.log(item.selected);
                return item.get('checked') && (!!item.get('budget') || !!item.get('quantity') || !!item.get('coverage'));
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
    },
    disabledNext: function (get) {
      var enabled = get('step') <= 1 || (get('step') == 2 && get('foundFaces').length > 0) || (get('step') >= 3 && get('planCitiesCount') > 0)
      return !enabled;
    }
  },

  data: {
    // startDate: null,
    // endDate: null,
    startDate: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()+1, 1)),
    endDate: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()+2, 0)),
    steps: 6,
    step: 0,
    A: 80,
    maxOnStreet: 5,
    minDistanceOnStreet: 500,
    minDistance: 700,
    otsFrom: 1,
    minPrice: null,
    maxCoverage: null,
    optimal: null,
    oblCenters: false,
    westUkraine: false,
    milCities: false,
    manualCities: false,
    foundFaces: [],
    planCitiesCount: 0,
    facesCount: null,
    selPoiCats: []
  }
});
