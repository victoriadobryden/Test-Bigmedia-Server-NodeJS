Ext.define('Bigmedia.store.LinkPoiRulesTree', {
  extend: 'Ext.data.TreeStore',

  storeId: 'LinkPoiRulesTree',
  alias: 'store.LinkPoiRulesTree',
  root: {
    expanded: true,
    children: [
      {
        text: 'Найближчий', leaf: true, ref: 'CLOSEST',
        sortFn: function (a, z) {
          return Math.round(a.distance / 50) - Math.round(z.distance / 50);
        }
      }, {
        text: 'Найдешевший', leaf: true, ref: 'CHEAPEST',
        sortFn: function (a, z) {
          return a.price - z.price;
        }
      }, {
        text: 'З найвищим рейтингом', leaf: true, ref: 'COOLEST',
        sortFn: function (z, a) {
          return a.ots - z.ots;
        }
      }
    ]
  },
  fields: [
    { name: 'text' },
    { name: 'ref' },
    { name: 'sortFn' }
  ]
});
