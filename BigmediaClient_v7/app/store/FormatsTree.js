Ext.define('Bigmedia.store.FormatsTree', {
  extend: 'Ext.data.TreeStore',

  storeId: 'FormatsTree',
  alias: 'store.FormatsTree',
  root: {
    expanded: true,
    children: [
      { text: '3x6', leaf: true, ref: '3x6', refId: 1, filterFn: function (item) {
        return item.id_size == 1
      } },
      { text: '2.3x3.14', leaf: true, ref: '2.3x3.14', refId: 34, filterFn: function (item) {
        return item.id_size == 34
      } },
      { text: '1.2x1.8', leaf: true, ref: '1.2x1.8', refId: 13, filterFn: function (item) {
        return item.id_size == 13
      } },
      { text: 'Інші', leaf: true, ref: 'OTHER', refId: -1, filterFn: function (item) {
        return item.id_size != 1 && item.id_size != 13 && item.id_size != 34
      } }
    ]
  },
  fields: [
    { name: 'text' },
    { name: 'ref' },
    { name: 'refId' }
  ]
});
