Ext.define('Bigmedia.model.KSPolygon', {
    extend: 'Ext.data.Model',

    fields: [
      { name: 'id', type: 'int'},
      { name: 'lat1'},
      { name: 'lat2'},
      { name: 'lon1'},
      { name: 'lon2'},
      // { name: 'cnt_transit_male'},
      // { name: 'cnt_transit_female'},
      { name: 'lon'},
      { name: 'lat'},
      { name: 'transit'},
      //{ name: 'cnt_transit'},
      //{ name: 'full_cnt_unique_transit'},
      // { name: 'cnt_avg_transit'}
      // {
      //   name: 'centroid',
      //   calculate: function (data) {
      //     return new ol.geom.Point(ol.proj.fromLonLat(data.lon1 + (data.lon2 - data.lon1)/2, data.lat1 + (data.lat2 - data.lat1)/2));
      //   }
      // },
      // {
      //   name: 'polygon',
      //   calculate: function (data) {
      //     return new ol.geom.Polygon([ol.proj.fromLonLat(data.lon1, data.lat1), ol.proj.fromLonLat(data.lon1, data.lat2), ol.proj.fromLonLat(data.lon2, data.lat2), ol.proj.fromLonLat(data.lon2, data.lat1), ol.proj.fromLonLat(data.lon1, data.lat1)])
      //   }
      // }
    ]
});
