Ext.define('Bigmedia.view.map.MapViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.map-mapview',

    listen: {
      store: {
        '#FormatsTree': {
          needrefresh: 'onFormatsRulesRefresh'
        },
        '#LinkPoiRulesTree': {
          needrefresh: 'onFormatsRulesRefresh'
        }
      }
    },

    bindings: {
      onBufferChanged: '{buffer}',
      onBeforePoiChanged: '{beforepoi}',
      onFilterPoi: '{filterPoi}',
      onMaximumFacesChanged: '{maximumfaces}',
      onShowKSHitmapChanged: '{showKSHitmap}'
    },

    onShowKSHitmapChanged: function (visible) {
      var me = this,
        map = me.lookupReference('facesmap');
      // if (map.KSHeatmapLayer) {
      //   map.KSHeatmapLayer.setVisible(visible);
      // };
      // console.log(map.CityHeatmapLayer)
      if (map.CityHeatmapLayer) {
        map.CityHeatmapLayer.setVisible(visible);
      };
    },

    onFocusGooglePlace: function (edit) {
      var me = this,
        map = me.lookupReference('facesmap');
      map.showPlace();
      // console.log(map.googlePlace);
      // if (map.googlePlace) {
      // }
    },

    onClearGooglePlace: function () {
      var me = this,
          map = me.lookupReference('facesmap');
      map.updatePlace();
    },

    onSelectGooglePlace: function (place) {
      var me = this,
          map = me.lookupReference('facesmap');
      map.updatePlace([place.geometry.location.lng(),place.geometry.location.lat()]);
      Bigmedia.Vars.taglog('googlesearch', {formatted_address: place.formatted_address, name: place.name, place_id: place.place_id, url: place.url, vicinity: place.vicinity, lat:place.geometry.location.lat(), lon: place.geometry.location.lng(), plus_code: place.plus_code});
    },
    onManagePOI: function () {
      var me = this,
        dmp = me.lookup('dlgmanagepoi');
        dmp.show();
        // view.dlgManagePOI.show();
    },

    onCreatePoint: function () {
        var me = this,
            map = me.lookupReference('facesmap');
        map.maskDraw.setActive(true,'Point');
    },

    onCreateLine: function () {
        var me = this,
            map = me.lookupReference('facesmap');
        map.maskDraw.setActive(true,'LineString');
    },

    onCreatePolygon: function () {
        var me = this,
            map = me.lookupReference('facesmap');
        map.maskDraw.setActive(true,'Polygon');
    },

    onCreateCircle: function () {
        var me = this,
            map = me.lookupReference('facesmap');
        map.maskDraw.setActive(true,'Circle');
    },

    onMaskEdit: function (btn) {
        var me = this,
            map = me.lookupReference('facesmap');
        map.maskModify.setActive(btn.pressed);
    },

    deferedOnMaximumFacesChanged: function (newVal) {
      var me = this,
        map = me.lookupReference('facesmap');
      delete me.maximumFacesChangedDefer;
      map.setMaximumFaces(newVal);
    },

    onMaximumFacesChanged: function (newVal) {
      var me = this;
      if (me.maximumFacesChangedDefer) {
          Ext.undefer(me.maximumFacesChangedDefer);
          delete me.maximumFacesChangedDefer;
      }
      me.maximumFacesChangedDefer = Ext.defer(me.deferedOnMaximumFacesChanged, 700, me, [newVal]);
    },

    deferedOnFormatsRulesRefresh: function () {
      var me = this,
        map = me.lookupReference('facesmap');
      delete me.formatsRulesRefreshDefer;
      map.formatsRulesChanged();
    },

    onFormatsRulesRefresh: function () {
      var me = this;
      if (me.formatsRulesRefreshDefer) {
          Ext.undefer(me.formatsRulesRefreshDefer);
          delete me.formatsRulesRefreshDefer;
      }
      me.formatsRulesRefreshDefer = Ext.defer(me.deferedOnFormatsRulesRefresh, 700, me);
    },

    deferedOnBufferChanged: function (newVal) {
      var me = this,
        map = me.lookupReference('facesmap');
      delete me.bufferChangesDefer;
      map.setBuffer(newVal);
    },

    onBufferChanged: function (newVal) {
      var me = this;
      if (me.bufferChangesDefer) {
          Ext.undefer(me.bufferChangesDefer);
          delete me.bufferChangesDefer;
      }
      me.bufferChangesDefer = Ext.defer(me.deferedOnBufferChanged, 700, me, [newVal]);
    },

    deferedOnBeforePoiChanged: function (newVal) {
      var me = this,
          map = me.lookupReference('facesmap');
      delete me.beforepoiChangesDefer;
      map.setBeforePoi(newVal);
    },

    onBeforePoiChanged: function (newVal) {
      var me = this;
      if (me.beforepoiChangesDefer) {
          Ext.undefer(me.beforepoiChangesDefer);
          delete me.beforepoiChangesDefer;
      }
      me.beforepoiChangesDefer = Ext.defer(me.deferedOnBeforePoiChanged, 700, me, [newVal]);
    },

    onMaskSelect: function () {
        var me = this,
            map = me.lookupReference('facesmap');
        map.maskDraw.setActive(false);
        map.maskModify.setActive(false);
    },

    onMaskClear: function () {
        var me = this,
            map = me.lookupReference('facesmap');
        map.maskLayer.getSource().clear(true);
        // map.bufferLayer.getSource().clear(true);
        map.maskDraw.setActive(false);
        map.maskModify.setActive(false);
        // map.filterFaces.setActive(false);
        map.recalcBuffer();
    },

    onFilterPoi: function (newVal) {
      var me = this,
        map = me.lookupReference('facesmap');
      map.filterFaces.setActive(newVal);
    },

    onFilter: function (btn) {

    }
});
