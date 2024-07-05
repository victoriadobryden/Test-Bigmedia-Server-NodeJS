Ext.define('Bigmedia.model.SearchFaceByNumber', {
  extend: 'Ext.data.Model',

  fields: [
    { name: 'id'},
    { name: 'manualNo', type: 'string'},
    { name: 'faceId'},
    { name: 'supplierNo', calculate: function (data) {
      if (!data.manualNo || !data.faceId) { return null; }
      var face = Ext.getStore('Faces').getById(data.faceId);
      return face ? face.get('supplierNo') : null;
    }},
    { name: 'isFree', calculate: function (data) {
      if (!data.manualNo || !data.faceId) { return null; }
      var face = Ext.getStore('Faces').getById(data.faceId);
      if (!face) { return null; }
      var periodFilter = Ext.getStore('Faces').getFilters().getByKey('filter_period');
      return !periodFilter || periodFilter.filter(face);
      // TODO:
      // return face ? face.get('status') : null;
    }},
    { name: 'status', calculate: function (data) {
      return data.isFree === null ? null : (data.isFree ? 'вільна' : 'продана');
    }},
    { name: 'supplier', calculate: function (data) {
      if (!data.manualNo || !data.faceId) { return null; }
      var face = Ext.getStore('Faces').getById(data.faceId);
      return face ? face.get('supplier') : null;
    }},
    { name: 'city', calculate: function (data) {
      if (!data.manualNo || !data.faceId) { return null; }
      var face = Ext.getStore('Faces').getById(data.faceId);
      return face ? face.get('city') : null;
    }},
    { name: 'address', calculate: function (data) {
      if (!data.manualNo || !data.faceId) { return null; }
      var face = Ext.getStore('Faces').getById(data.faceId);
      return face ? face.get('address') : null;
    }},
    { name: 'catab', calculate: function (data) {
      if (!data.manualNo || !data.faceId) { return null; }
      var face = Ext.getStore('Faces').getById(data.faceId);
      return face ? face.get('catab') : null;
    }},
    { name: 'size', calculate: function (data) {
      if (!data.manualNo || !data.faceId) { return null; }
      var face = Ext.getStore('Faces').getById(data.faceId);
      return face ? face.get('size') : null;
    }},
    { name: 'doorsNo', calculate: function (data) {
      if (!data.manualNo || !data.faceId) { return null; }
      var face = Ext.getStore('Faces').getById(data.faceId);
      return face ? face.get('doorsNo') : null;
    }},
    { name: 'price', calculate: function (data) {
      if (!data.manualNo || !data.faceId) { return null; }
      var face = Ext.getStore('Faces').getById(data.faceId);
      return face ? face.get('price') : null;
    }}
  ]
});
