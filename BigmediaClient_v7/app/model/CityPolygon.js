Ext.define('Bigmedia.model.CityPolygon', {
    extend: 'Ext.data.Model',

    fields: [
      { name: 'id', type: 'int'},
      { name: 'idCity', type: 'int'},
      { name: 'idPolygon', type: 'int'},
      { name: 'lat', type: 'float'},
      { name: 'lon', type: 'float'},
      { name: 'type', type: 'string'},
      { name: 'geog',type:'array'},
      { name: 'transit', type: 'float'},
      { name: 'weight', type: 'float'}
    ]
});
