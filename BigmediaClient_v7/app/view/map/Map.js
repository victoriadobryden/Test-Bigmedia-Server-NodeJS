Ext.define("Bigmedia.view.map.Map", {
  extend: "GeoExt.component.Map",
  xtype: 'facesmap',
  requires: [
    "Bigmedia.view.map.MapController",
    "Bigmedia.view.map.MapModel",
    'Bigmedia.view.map.MapHint',
    'Bigmedia.view.map.FacePopup',
    'Bigmedia.view.det.DetFace'
  ],
  controller: "main-map",
  // viewModel: {
  //     type: "main-map"
  // },
  config: {
    geoStore: null,
    grid: null,
    gridMoitoring: null,
    cartStore: null,
    cartGrid: null,
    selStore: null,
    selGrid: null,
    buffer: 500,
    faceAsCircleRes: 8,
    replaceStore: null,
    replaceGrid: null,
    replaceBuffer: 300,
    replaceFaceId: null,
    replaceMode: false,
    facePopupVisible: false,
    actions: {},
    filterCart: false,
    poiStore: null,
    beforePoi: false,
    detFace: null,
    maximumFaces: 0,
    CityPolygonStore: null,
    KSPolygonsStore: null,
    KSStreetsStore: null
  },
  viewModel: {
    data: {
      replaceMode: false,
      hiddenShowCoverageBtn: true
    }
  },
  fid: 1,
  autoId: function () {
    // console.log(this.fid);
    return this.fid++;
  },
  listeners: {
    beforerender: function () {
      var me = this;
      me.popup = Ext.create('Bigmedia.view.map.FacePopup',
        {
          map: me,
          renderTo: me.up('panel').getEl()
        });
      if (me.popup) {
        me.popupOverlay = new ol.Overlay({
          element: me.popup.getEl().dom,
          // autoPan: false,
          autoPan: true,
          autoPanAnimation: {
            duration: 250
          }
        });
        me.popupOverlay.on('change:position', function (e) {
          if (!me.popupOverlay.getPosition()) {
            me.fireEvent('overlayclosed');
          }
          if (me.popupOverlay.getPosition() && me.getReplaceStore() && me.getViewModel().get('replaceMode') && me.getReplaceStore().findExact('id', me.popup.getRecord().getId()) < 0) {
            // console.log('change replace id');
            me.setReplaceFaceId(me.popup.getRecord().getId());
          }
          me.getViewModel().set('facePopupVisible', !!me.popupOverlay.getPosition());
        });
        me.map.addOverlay(me.popupOverlay);
      }
      me.hint = Ext.create('Bigmedia.view.map.MapHint',
        {
          map: me,
          renderTo: me.up('panel').getEl()
          // ,
          // popupHtml: '<b>{popupRecord.name}</b><br>' +
          //     '{popupRecord.city}' +
          //     '<span data-qtip="{popupRecord.address}"> ' + '{popupRecord.address}' + ' {popupRecord.housenumber}</span>'
        }
      );
      me.faceHint = Ext.create('Bigmedia.view.map.MapHint',
        {
          map: me,
          renderTo: me.up('panel').getEl()
        });
      // console.log(me.popup);
      // console.log('before: %o', me.popup.lookup('testlike').getEl().dom.onclick);
      if (me.hint) {
        me.hintOverlay = new ol.Overlay({
          element: me.hint.getEl().dom,
          autoPan: false,
          // autoPan: true,
          autoPanAnimation: {
            duration: 250
          }
        });
        me.hintOverlay.on('change:position', function (e) {
          if (!me.hintOverlay.getPosition()) {
            me.fireEvent('overlayclosed');
          }
          //me.getViewModel().set('facePopupVisible', !!me.popupOverlay.getPosition());
        });
        me.map.addOverlay(me.hintOverlay);
      }
      if (me.faceHint) {
        me.faceHintOverlay = new ol.Overlay({
          element: me.faceHint.getEl().dom,
          autoPan: false,
          // autoPan: true,
          autoPanAnimation: {
            duration: 250
          }
        });
        me.faceHintOverlay.on('change:position', function (e) {
          if (!me.faceHintOverlay.getPosition()) {
            me.fireEvent('faceoverlayclosed');
          }
          //me.getViewModel().set('facePopupVisible', !!me.popupOverlay.getPosition());
        });
        me.map.addOverlay(me.faceHintOverlay);
      }
      me.btnCoverage = Ext.create('Ext.button.Button', {
        text: Bigmedia.Locales.mapBtnCoverageText,
        // cls: 'ol-unselectable ol-control',
        renderTo: me.up('panel').getEl(),
        ui: 'map-soft-red',
        enableToggle: true,
        disabled: false,
        hidden: !(me.getCartStore() && me.getCartStore().getCount() > 0),
        // bind: {
        //     hidden: '{hiddenShowCoverageBtn}'
        // },
        style: 'left: 5px; bottom: 5px; position: absolute',
        toggleHandler: function (btn, state) {
          me.cartCoveragesLayer.setVisible(state);
          if (state && !me.cartCoveragesLoaded) {
            me.syncCoverages();
          }
        },
        listeners: {
          afterrender: function (item) {
            // new ol version is html, so buttons behavior is as expected
            // item.getEl().dom.onclick = function() {
            //     item.toggle();
            // }
          }
        }
      });
      // console.log([myElement, btn.getEl()]);
      var myControl = new ol.control.Control({ element: me.btnCoverage.getEl().dom });
      myControl.setMap(me.map);

      me.btnReplace = Ext.create('Ext.button.Button', {
        text: Bigmedia.Locales.mapBtnReplacementText,
        // cls: 'ol-unselectable ol-control',
        // renderTo: me.up('panel').getEl(),
        renderTo: Ext.getBody(),
        ui: 'map-soft-red',
        enableToggle: true,
        // hidden: !(me.getCartStore() && me.getCartStore().getCount() > 0) || !me.getReplaceStore(),
        hidden: true,
        // disabled: true,
        ariaLabelledBy: 'Replace',
        // bind: {
        //     hidden: '{hiddenShowCoverageBtn}'
        // },
        style: 'right: 5px; top: 5px; position: absolute',
        toggleHandler: function (btn, state) {
          // console.log(state);
          if (state && (me.getDetFace() || me.popupOverlay.getPosition())) {
            var recId = (me.getDetFace() && me.getDetFace().getRecord()) ? me.getDetFace().getRecord().getId() : ((me.popup && me.popup.getRecord()) ? me.popup.getRecord().getId() : null);
            if (!recId) {
              return false;
            }
            me.setReplaceFaceId(recId);
          }
          me.getViewModel().set('replaceMode', state);
        },
        listeners: {
          afterrender: function (item) {
            // item.setHidden(true);
            // new ol version is html, so buttons behavior is as expected
            // item.getEl().dom.onclick = function() {
            //     item.toggle();
            // }
          }
        }
      });
      var replaceControl = new ol.control.Control({ element: me.btnReplace.getEl().dom });
      replaceControl.setMap(me.map);
    },
    render: function () {
      var me = this;
      // me.map.setTarget(me.getEl().dom);
      // var styleJson = 'https://api.maptiler.com/maps/streets/style.json?key=h0EMGwSkpmD2aBU090bQ';
      // olms.apply(me.map, styleJson);
      me.initLayers();
    }
  },
  updateDetFace: function (newVal) {
    var me = this;
    if (newVal) {
      newVal.addListener('show', function () {
        me.getViewModel().set('facePopupVisible', true);
      }, me);
      newVal.addListener('hide', function () {
        me.getViewModel().set('facePopupVisible', false);
      }, me);
      // console.log('updateDetFace');
    }
  },

  constructor: function (config) {
    var me = this;
    me.mixins.observable.constructor.call(me, config);
    var center = [30.524474, 50.460969];

    // var mtSource = new ol.source.TileJSON({
    //     url: 'https://api.maptiler.com/maps/basic/tiles.json?key=o9nh2eHiq2TFiMtDC95O',
    //     // url: 'https://api.maptiler.com/maps/f699e734-fb91-474d-9ebc-d2be0393a611/tiles.json?key=o9nh2eHiq2TFiMtDC95O',
    //     tileSize: 512,
    //     crossOrigin: 'anonymous'
    //   });
    // Oleg
    var apiKey = 'HUkTvNkEjgvRtcMbm1TvYPD4fC-nHjbhzX-fBfOKiLc';
    // Sas
    //var apiKey = 't4kncjNICU6uvyfsLDOlbZ6uwuyDB1N_xJ8XMnrmUJE';
    var hereLayers = [
      {
        base: 'base',
        type: 'maptile',
        scheme: 'normal.day',
        apiKey: apiKey
      },
      {
        base: 'aerial',
        type: 'maptile',
        scheme: 'satellite.day',
        apiKey: apiKey
      },
      {
        base: 'aerial',
        type: 'maptile',
        scheme: 'hybrid.day',
        apiKey: apiKey
      }
    ];
    var urlTpl = 'https://{1-4}.{base}.maps.ls.hereapi.com' +
      '/{type}/2.1/maptile/newest/{scheme}/{z}/{x}/{y}/256/png' +
      '?apiKey={apiKey}&lg=ukr'
    me.tileLayers = [];
    var i, ii;
    for (i = 0, ii = hereLayers.length; i < ii; i++) {
      var layerDesc = hereLayers[i];
      me.tileLayers.push(new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.XYZ({
          url: createUrl(urlTpl, layerDesc),
          attributions: 'Map Tiles &copy; ' + new Date().getFullYear() + ' ' +
            '<a href="http://developer.here.com">HERE</a>'
        })
      }));
      // me.getMap().addLayer(me.tileLayers[i]);
    }

    function createUrl(tpl, layerDesc) {
      return tpl
        .replace('{base}', layerDesc.base)
        .replace('{type}', layerDesc.type)
        .replace('{scheme}', layerDesc.scheme)
        .replace('{apiKey}', layerDesc.apiKey)
    }

    me.tileLayers[0].setVisible(true);
    me.tileLayer = me.tileLayers[0];
    me.map = new ol.Map(
      {
        layers:
          me.tileLayers,
        view: new ol.View({
          constrainResolution: true,
          center: ol.proj.fromLonLat(center),
          // projection: 'EPSG:4326',
          zoom: 17,
          minZoom: 5,
          maxZoom: 18
        })
      });
    me.initMap();
    me.callParent(config);
    var boundariesStore = Ext.getStore('CityBoundaries');
    if (boundariesStore) {
      if (boundariesStore.getCount() > 0) {
        me.loadCityBoundaries();
      } else {
        boundariesStore.on('load', me.loadCityBoundaries, me);
      }
    }
    me.getViewModel().bind('{replaceMode}', function (rm) {
      if (me.btnReplace) {
        me.btnReplace.setPressed(rm);
      }
      me.fireEventArgs('replacemodechanged', [rm]);
    });
    me.getViewModel().bind('{facePopupVisible}', function (v) {
      if (me.btnReplace) {
        me.btnReplace.setVisible(((me.getDetFace() && me.getDetFace().isVisible()) || !!me.popupOverlay.getPosition()) && !!me.getReplaceStore());
      }
    });
  },

  flashFace: function (face) {
    var me = this,
      duration = 3000,
      start = new Date().getTime(),
      listenerKey = me.tileLayer.on('postrender', animate);

    function animate(event) {
      var vectorContext = ol.render.getVectorContext(event);
      var frameState = event.frameState;
      var flashGeom = face.get('geometry').clone();
      var elapsed = frameState.time - start;
      var elapsedRatio = elapsed / duration;
      // radius will be 5 at start and 30 at end.
      var radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
      var opacity = ol.easing.easeOut(1 - elapsedRatio);

      var style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          stroke: new ol.style.Stroke({
            color: 'rgba(255, 0, 0, ' + opacity + ')',
            width: 0.25 + opacity
          })
        })
      });

      vectorContext.setStyle(style);
      vectorContext.drawGeometry(flashGeom);
      if (elapsed > duration) {
        ol.Observable.unByKey(listenerKey);
        return;
      }
      // tell OpenLayers to continue postrender animation
      me.map.render();
    }
    me.map.render();
  },

  showStreet: function (coords) {
    var me = this;
    if (me.map.getView().getZoom() < 13) {
      me.map.getView().setZoom(15);
      me.map.getView().setCenter(ol.proj.fromLonLat(coords));
    } else {
      me.map.getView().setCenter(ol.proj.fromLonLat(coords));
    }
  },

  showOSMFeature: function (feature) {
    var me = this;
    if (me.map.getView().getZoom() < 13) {
      me.map.getView().setZoom(15);
      me.maskLayer.getSource().addFeature(feature);
      // me.map.getView().setCenter(ol.proj.fromLonLat(coords));
    } else {
      me.maskLayer.getSource().addFeature(feature);
      // me.map.getView().setCenter(ol.proj.fromLonLat(coords));
    }
  },

  popupFace: function (face) {
    var me = this;
    if (me.getDetFace()) {
      me.getDetFace().setRecord(face);
    }
    var extent = me.map.getView().calculateExtent();
    if (ol.extent.containsCoordinate(extent, face.get('geometry').getCoordinates())) {
      // me.flashFace(face);
    } else {
      if (me.map.getView().getZoom() < 13) {
        // me.map.getView().setZoom(15);
        me.map.getView().setCenter(face.get('geometry').getCoordinates());
      } else {
        me.map.getView().setCenter(face.get('geometry').getCoordinates());
      }
    }
    me.flashFace(face);
    // me.map.getView().once('change:center', function(){
    //     // me.popup.setRecord(face);
    //     // me.popupOverlay.setPosition(face.get('geometry').getCoordinates());
    // });
    // if (me.map.getView().getZoom() < 13) {
    //     me.map.getView().setZoom(15);
    //     me.map.getView().setCenter(face.get('geometry').getCoordinates());
    // } else {
    //     me.map.getView().setCenter(face.get('geometry').getCoordinates());
    // }
  },

  hintPoi: function (poi) {
    var me = this;
    if (me.map.getView().getZoom() < 13) {
      me.map.getView().once('change:center', function () {
        // console.log('here');
        // me.hint.setRecord(poi);
        me.hint.setHtml('<b>' + poi.get('name') + '</b><br>' +
          (poi.get('city') ? poi.get('city') + ', ' : '') +
          '<span data-qtip="' + poi.get('address') + '">' + (poi.get('address') ? ' ' + poi.get('address') : '') + (poi.get('housenumber') ? ' ' + poi.get('housenumber') : '') + '</span>');
        me.hintOverlay.setPosition(poi.get('centroid').getCoordinates());
      });
      // me.map.getView().setZoom(15);
      me.map.getView().setCenter(poi.get('centroid').getCoordinates());
    } else {
      me.map.getView().once('change:center', function () {
        // console.log('here');
        // me.hint.setRecord(poi);
        me.hint.setHtml('<b>' + poi.get('name') + '</b><br>' +
          (poi.get('city') ? poi.get('city') + ', ' : '') +
          '<span data-qtip="' + poi.get('address') + '">' + (poi.get('address') ? ' ' + poi.get('address') : '') + (poi.get('housenumber') ? ' ' + poi.get('housenumber') : '') + '</span>');
        me.hintOverlay.setPosition(poi.get('centroid').getCoordinates());
      });
      // me.popup.setRecord(face);
      me.map.getView().setCenter(poi.get('centroid').getCoordinates());
      // me.popupOverlay.setPosition(face.get('geometry').getCoordinates());
    }
    // console.log(me.map.getView().getZoom());
  },

  hintFace: function (face) {
    var me = this;
    if (me.map.getView().getZoom() < 13) {
      me.map.getView().once('change:center', function () {
        // console.log('here');
        me.hint.setRecord(poi);
        me.hintOverlay.setPosition(poi.get('geometry').getCoordinates());
      });
      // me.map.getView().setZoom(15);
      me.map.getView().setCenter(poi.get('geometry').getCoordinates());
    } else {
      me.map.getView().once('change:center', function () {
        // console.log('here');
        me.hint.setRecord(poi);
        me.hintOverlay.setPosition(poi.get('geometry').getCoordinates());
      });
      // me.popup.setRecord(face);
      me.map.getView().setCenter(poi.get('geometry').getCoordinates());
      // me.popupOverlay.setPosition(face.get('geometry').getCoordinates());
    }
    // console.log(me.map.getView().getZoom());
  },

  updateReplaceMode: function (newVal) {
    this.getViewModel().set('replaceMode', newVal);
  },

  updateBuffer: function (newVal, oldVal) {
    if (newVal >= 0) {
      this.recalcBuffer();
    }
  },

  removeLinkToPoiFilter: function () {
    var me = this,
      store = me.getGeoStore() || me.getCartStore();
    if (!store) {
      return
    }
    store.removeFilter('filterLinkToPoi');
  },

  addLinkToPoiFilter: function () {
    // var me = this,
    //   store = me.getGeoStore() || me.getCartStore();
    // if (!store) {
    //   return
    // }
    // var maximumFaces = me.getMaximumFaces(),
    //   fTreeStore = Ext.getStore('FormatsTree'),
    //   lprTreeStore = Ext.getStore('LinkPoiRulesTree'),
    //   pois = me.poiLayer.getSource().getFeatures(),
    //   linksPoiToFace = {};

    // console.log(this.linksPoiToFace);

    // store.addFilter(new Ext.util.Filter({
    //   id: 'filterLinkToPoi',
    //   filterFn: function (f) {
    //     if (!f.get('geometry')) {
    //       return false;
    //     }
    //     var pois = me.poiLayer.getSource().getFeatures(),
    //     fCoords = f.get('geometry').getCoordinates(),
    //     fLonLat = ol.proj.toLonLat(fCoords);
    //     return buffers.some((poly)=>{
    //       var inBuffer = turf.booleanPointInPolygon(turf.point(fCoords), poly);
    //       if (!inBuffer || !me.getBeforePoi()) {
    //         return inBuffer;
    //       }
    //       return pois.some((p)=>{
    //         // if (p.getGeometry().getType() == 'Point') {
    //         var centroid = Bigmedia.Vars.getOlGeometryCentroid(p.getGeometry()),
    //         pLonLat = ol.proj.toLonLat(centroid.getCoordinates());
    //         return ((p.getGeometry().getType() != 'Point') || turf.distance(fLonLat, pLonLat, {units: 'kilometers'}) * 1000 <= me.getBuffer()) && faceBeforePoi(f.get('angle'), turf.bearingToAzimuth(turf.bearing(fLonLat, pLonLat)));
    //         // } else {
    //         //   return inBuffer;
    //         // }
    //       });
    //     });
    //   }
    // }));
  },

  updateMaximumFaces: function (newVal, oldVal) {
    var me = this;
    me.removeLinkToPoiFilter();
    if (newVal || oldVal) {
      if (me.filterFaces && me.filterFaces.getActive()) {
        me.filterFaces.refresh();
      }
      me.addLinkToPoiFilter();
    }
  },

  formatsRulesChanged: function () {
    var me = this;
    if (me.filterFaces && me.filterFaces.getActive()) {
      me.filterFaces.refresh();
    }
    me.addLinkToPoiFilter();
  },

  updateBeforePoi: function (newVal, oldVal) {
    var me = this;
    if (me.filterFaces && me.filterFaces.getActive()) {
      me.filterFaces.refresh();
    }
  },

  loadCityBoundaries: function () {
    var me = this,
      boundariesStore = Ext.getStore('CityBoundaries'),
      cFeatures = [], coords = [];
    boundariesStore.each(function (record) {
      var f = new ol.Feature(record.data);
      cFeatures.push(f);
    });

    me.citiesLayer.getSource().addFeatures(cFeatures);
  },
  updateReplaceFaceId: function (newVal) {
    var me = this;
    me.replaceBufferLayer.getSource().clear(true);
    if (newVal) {
      me.replaceFace.create(newVal, me.getReplaceBuffer());
    } else {
      // if (me.getViewModel().get('replaceMode')) {
      //
      // }
      me.replaceFace.setActive(false);
    }
    me.fireEventArgs('replacefaceidchanged', [newVal]);
  },
  updateReplaceBuffer: function (newVal, oldVal) {
    if (newVal >= 0) {
      this.recalcReplaceBuffer(newVal);
    }
  },
  recalcReplaceBuffer: function (newVal) {
    var me = this,
      bufSource = me.replaceBufferLayer.getSource(),
      buffer = me.getReplaceBuffer(),
      features = [];
    bufSource.clear(true);
    if (newVal) {
      me.replaceFace.create(me.getReplaceFaceId(), newVal);
    }
  },
  recalcBuffer: function (feature) {
    var me = this,
      bufSource = me.bufferLayer.getSource(),
      buffer = me.getBuffer(),
      features = [];
    if (feature) {
      // if (feature.getGeometry().getType() === 'Point' || feature.getGeometry().getType() === 'LineString') {
      if (bufSource.getFeatureById(feature.getId())) {
        bufSource.removeFeature(bufSource.getFeatureById(feature.getId()));
      }
      features = [feature];
      // }
    } else {
      bufSource.clear(true);
      features = me.maskLayer.getSource().getFeatures();
      // .filter(function(item){
      //     return item.getGeometry().getType() === 'Point' || item.getGeometry().getType() === 'LineString';
      // });

      // var pois = me.poiLayer.getSource().getFeatures();
      // features = features.concat(pois);
    }
    if (features.length > 0) {
      me.createBuffer(features);
      if (me.filterFaces && me.filterFaces.getActive()) {
        me.filterFaces.refresh();
      }
    }
  },
  createBuffer: function (maskFeatures) {
    var me = this,
      unit = 'kilometers',
      buffer = me.getBuffer();

    function pointToLonLat(point) {
      return ol.proj.toLonLat(point);
    }
    function lineToLonLat(line) {
      return line.map(function (point) { return pointToLonLat(point); });
    }
    function multiLineToLonLat(mline) {
      return mline.map(function (line) { return lineToLonLat(line); });
    }

    // var fTurf = maskFeatures.map(function(item){
    //     var c;
    //     // console.log(item.getGeometry().getCoordinates());
    //     // console.log(ol.proj.toLonLat(item.getGeometry().getCoordinates()));
    //     if (item.getGeometry().getType() === 'Point') {
    //         c = pointToLonLat(item.getGeometry().getCoordinates());
    //     } else if (item.getGeometry().getType() === 'LineString') {
    //         c = lineToLonLat(item.getGeometry().getCoordinates());
    //     } else {
    //         c = multiLineToLonLat(item.getGeometry().getCoordinates());
    //     }
    //     console.log('item.getId() : %d', item.getId());
    //     return {
    //         type: "Feature",
    //         geometry: {
    //             type: item.getGeometry().getType(),
    //             coordinates: c //item.getGeometry().getCoordinates()
    //         }
    //     };
    // });

    var bufFeatures = maskFeatures.map(function (item) {
      var c, maskGeoType = item.getGeometry().getType();
      // console.log(item.getGeometry().getCoordinates());
      // console.log(ol.proj.toLonLat(item.getGeometry().getCoordinates()));
      var meters = me.map.getView().getProjection().getMetersPerUnit();
      // console.log(buffer);
      if (item.getGeometry().getType() === 'Point') {
        // c = pointToLonLat(item.getGeometry().getCoordinates());
        // var units = me.map.getView().getProjection().getUnits();
        // console.log(units);
        // console.log();
        // if (ol.proj.METERS_PER_UNIT[units] != 0) {
        var t = turf.circle(pointToLonLat(item.getGeometry().getCoordinates()), buffer / 1000, {
          steps: 32,
          units: 'kilometers'
        });
        var f = new ol.Feature({
          // geometry: ol.geom.Polygon.fromCircle(new ol.geom.Circle(item.getGeometry().getCoordinates(), buffer / ol.proj.METERS_PER_UNIT[units]))
          // geometry: ol.geom.Polygon.fromCircle(new ol.geom.Circle(item.getGeometry().getCoordinates(), buffer / meters))
          geometry: new ol.geom.Polygon([t.geometry.coordinates[0].map(function (point) {
            return ol.proj.fromLonLat(point);
          })])
        });
        f.setId(item.getId());
        return f;
      } else if (item.getGeometry().getType() === 'Circle') {
        var units = me.map.getView().getProjection().getUnits();
        // console.log(units);
        // console.log();
        // if (ol.proj.METERS_PER_UNIT[units] != 0) {
        if (meters != 0) {
          var f = new ol.Feature({
            geometry: ol.geom.Polygon.fromCircle(new ol.geom.Circle(item.getGeometry().getCenter(), item.getGeometry().getRadius())) // + buffer / ol.proj.METERS_PER_UNIT[units]
          });
          f.setId(item.getId());
          return f;
        } else {
          c = multiLineToLonLat(ol.geom.Polygon.fromCircle(item.getGeometry()).getCoordinates());
          maskGeoType = 'Polygon';
        }
      } else if (item.getGeometry().getType() === 'LineString') {
        c = lineToLonLat(item.getGeometry().getCoordinates());
      } else {
        // c = multiLineToLonLat(item.getGeometry().getCoordinates());
        var f = item.clone();
        f.setId(item.getId());
        return f;
      }
      var t = turf.buffer({
        type: "Feature",
        geometry: {
          type: maskGeoType,
          coordinates: c //item.getGeometry().getCoordinates()
        }
      }, buffer / 1000, { units: unit });
      var f = new ol.Feature({
        geometry: new ol.geom.Polygon([t.geometry.coordinates[0].map(function (point) {
          return ol.proj.fromLonLat(point);
        })])
      });
      f.setId(item.getId());
      return f;
    });

    me.bufferLayer.getSource().addFeatures(bufFeatures);

    // if(fTurf.length === 0) {
    //     return null;
    // }
    // var buffered;
    // if (maskFeatures.length > 1) {
    //     buffered = turf.buffer(turf.featureCollection(fTurf), buffer/1000, unit); //turf.featureCollection(fTurf)
    // } else {
    //     buffered = turf.buffer(fTurf, buffer/1000, unit); //fTurf[0]
    //     // buffered = turf.featureCollection([buffered]);
    // }
    // // console.log(buffered);
    // var bufArray = buffered.features.map(function(item){
    //     var coords = item.geometry.coordinates[0],
    //         f = new ol.Feature({
    //             geometry: new ol.geom.Polygon([coords.map(function(point){
    //                 return ol.proj.fromLonLat(point)
    //             })])
    //         });
    //     console.log('item : %o', item);
    //     f.setId(item.properties.id);
    //     return f;
    // });
    // // console.log(bufArray);
    // me.bufferLayer.getSource().addFeatures(bufArray);
  },
  updateKSPolygonsStore: function (newVal, oldVal) {
    // console.log('updateKSPolygonsStore');
    var me = this;
    if (oldVal) {
      oldVal.removeListener('endupdate', me.onKSPolygonsStoreChanged, me);
    }
    if (newVal) {
      newVal.on('endupdate', me.onKSPolygonsStoreChanged, me);
    }
  },
  updateCityPolygonStore: function (newVal, oldVal) {
    // console.log('onCityPolygonStoreChanged');
    var me = this;
    if (oldVal) {
      oldVal.removeListener('endupdate', me.onCityPolygonStoreChanged, me);
    }
    if (newVal) {
      newVal.on('endupdate', me.onCityPolygonStoreChanged, me);
    }
  },
  updateKSStreetsStore: function (newVal, oldVal) {
    console.log('updateKSStreetsStore');
    var me = this;
    if (oldVal) {
      oldVal.removeListener('endupdate', me.onKSStreetsStoreChanged, me);
    }
    if (newVal) {
      newVal.on('endupdate', me.onKSStreetsStoreChanged, me);
    }
  },
  updateGeoStore: function (newVal, oldVal) {
    // console.log('UpdateGeoStore');
    var me = this;
    if (oldVal) {
      // oldVal.removeListener('datachanged', me.onGeoStoreDataChanged, me);
      oldVal.removeListener('endupdate', me.onGeoStoreDataChanged, me);
      oldVal.removeListener('filterchange', me.onGeoStoreDataChanged, me);
      oldVal.removeListener('updatemap', me.onGeoStoreDataChanged, me);
    }
    if (newVal) {
      // newVal.on('datachanged', me.onGeoStoreDataChanged, me);
      // newVal.on('endupdate', me.onGeoStoreDataChanged, me);
      // newVal.on('filterchange', me.onGeoStoreDataChanged, me);
      newVal.on('updatemap', me.onGeoStoreDataChanged, me);
      if (me.facesLayer.getSource().getFeatures().length != newVal.getDataSource().getCount()) {
        me.reloadFaces();
      }
    }
  },
  updatePoiStore: function (newVal, oldVal) {
    var me = this;
    if (oldVal) {
      // oldVal.removeListener('datachanged', me.onGeoStoreDataChanged, me);
      oldVal.removeListener('endupdate', me.onPoiStoreDataChanged, me);
      // oldVal.removeListener('filterchange', me.onPoiStoreDataChanged, me);
    }
    if (newVal) {
      // newVal.on('datachanged', me.onGeoStoreDataChanged, me);
      newVal.on('endupdate', me.onPoiStoreDataChanged, me);
      // newVal.on('filterchange', me.onGeoStoreDataChanged, me);
      if (me.poiLayer.getSource().getFeatures().length === 0) {
        me.reloadPoi();
      }
    }
  },
  updateReplaceStore: function (newVal, oldVal) {
    var me = this;
    if (oldVal) {
      oldVal.removeListener('datachanged', me.onReplaceStoreDataChanged, me);
    }
    if (newVal) {
      newVal.on('datachanged', me.onReplaceStoreDataChanged, me);
      me.reloadReplaceFaces();
    }
  },
  updateGrid: function (newVal, oldVal) {
    // console.log('updateGrid %o, %o',newVal,oldVal);
    var me = this;
    if (oldVal) {
      oldVal.removeListener('selectionchange', me.onGridSelectionChanged, me);
      // oldVal.removeListener('rowclick', me.onGridRowClick, me);
      newVal.removeListener('reconfigure', me.onGridReconfigure, me);
      newVal.getSelectionModel().removeListener('focuschange', me.onGridFocusChange, me);
      me.setGeoStore(null);
    }
    if (newVal) {
      newVal.on('selectionchange', me.onGridSelectionChanged, me);
      // // newVal.on('rowclick', me.onGridRowClick, me);
      newVal.on('reconfigure', me.onGridReconfigure, me);
      newVal.getSelectionModel().on('focuschange', me.onGridFocusChange, me);
      me.setGeoStore(newVal.getStore());
    }
  },
  onGridReconfigure: function (grid, geoStore) {
    //console.log('onGridReconfigure',geoStore);
    var me = this;
    me.setGeoStore(geoStore);
    me.reloadFaces();
  },
  onGridSelectionChanged: function (grid) {
    var me = this,
      store = grid.getStore();
    // me.deselectAll();
    // if(grid.getSelection().length > 0){
    //     store.each(function(rec){
    //         if(rec.get('selected')){
    //             me.selectFace(rec);
    //         }
    //     });
    // }
    // if (me.getSelStore()) {
    //   me.reloadSelFaces();
    // }
  },
  onGridFocusChange: function (selModel, oldFocused, newFocused) {
    var me = this;
    if (me.focusLayer) {
      me.focusLayer.getSource().clear();
    }
    if (newFocused) {
      var point = newFocused.get('geometry');
      if (point) {
        if (me.popup) {
          me.popupFace(newFocused);
        } else {
          me.map.getView().setCenter(point.getCoordinates());
        }
      }
      var rec;
      if (me.cartLayer) {
        rec = me.cartLayer.getSource().getFeatureById(newFocused.getId());
        if (rec) {
          me.focusLayer.getSource().addFeature(rec.clone());
        }
      }
      if (!rec && me.facesLayer) {
        rec = me.facesLayer.getSource().getFeatureById(newFocused.getId());
        if (rec) {
          me.focusLayer.getSource().addFeature(rec.clone());
        }
      }
      if (!rec && me.selLayer) {
        rec = me.selLayer.getSource().getFeatureById(newFocused.getId());
        if (rec) {
          me.focusLayer.getSource().addFeature(rec.clone());
        }
      }
    } else {

    }
  },
  onGridRowClick: function (grid, record, tr, rowIndex, e, eOpts) {
    var me = this,
      point = record.get('geometry');
    if (point) {
      if (me.popup) {
        me.popupFace(record);
        // me.popup.setRecord(record);
        // me.popupOverlay.setPosition(point.getCoordinates());
      } else {
        me.map.getView().setCenter(point.getCoordinates());
      }
    }
  },
  reloadFaces: function () {
    // console.log('start reloadFaces');
    // return;
    var me = this,
      features = [],
      store = me.getGeoStore(),
      layer = me.facesLayer,
      source = layer.getSource();
    if (!layer) {
      return;
    }
    source.forEachFeature(function (f) {
      if (!store.getData().getByKey(f.getId())) {
        // toRemove.push(f);
        if (me.popupOverlay && me.popup && me.popup.getRecord() && me.popup.getRecord().getId() === f.getId()) {
          me.popupOverlay.setPosition(undefined);
          me.coveragesLayer.getSource().clear();
          if (me.getDetFace()) {
            me.getDetFace().hide();
          }
        }
        source.removeFeature(f);
      }
    });
    var extent = ol.extent.createEmpty();
    store.getData().each(function (item) {
      if (item.data.geometry && !source.getFeatureById(item.getId())) {
        var f = new ol.Feature(item.data);
        f.setId(item.getId());
        //f.set('angle',item.get('angle'));
        f.set('origObj', item);
        features.push(f);
        if (!me.extended) {
          ol.extent.extend(extent, f.getGeometry().getExtent());
        }
      }
      return true;
    });
    // console.log(store);

    // store.getData().each(function (item) {
    //     // console.log(item);
    //     if (item.data.geometry) {
    //         var f = new ol.Feature(item.data);
    //         f.setId(item.getId());
    //         //f.set('angle',item.get('angle'));
    //         features.push(f);
    //         if (!me.extended) {
    //             ol.extent.extend(extent, f.getGeometry().getExtent());
    //         }
    //     }
    //     return true;
    // });
    // console.log('Features count: %d', features.length);
    // layer.getSource().clear(true);
    layer.getSource().addFeatures(features);
    if (extent && !ol.extent.isEmpty(extent) && !me.extended) {
      me.extended = true;
      me.map.getView().fit(extent, me.map.getSize(), { minResolution: 0.4 });
    }
    // console.log('end reloadFaces');
  },
  reloadReplaceFaces: function () {
    // console.log('reloadFaces');
    var me = this,
      features = [],
      store = me.getReplaceStore(),
      layer = me.replaceLayer;
    if (!layer) {
      return;
    }
    // console.log(store);
    // var extent = ol.extent.createEmpty();

    store.getData().each(function (item) {
      // console.log(item);
      if (item.data.geometry) {
        var f = new ol.Feature(item.data);
        f.setId(item.getId());
        f.set('origObj', item);
        //f.set('angle',item.get('angle'));
        features.push(f);
        // if (!me.extended) {
        //     ol.extent.extend(extent, f.getGeometry().getExtent());
        // }
      }
      return true;
    });
    // console.log('Features count: %d', features.length);
    layer.getSource().clear(true);
    layer.getSource().addFeatures(features);
    // if (extent && !ol.extent.isEmpty(extent) && !me.extended){
    //     me.extended = true;
    //     me.map.getView().fit(extent, me.map.getSize(), {minResolution: 0.4});
    // }
  },

  blueStyle: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: '#0099CC'
      }),
      stroke: new ol.style.Stroke({
        color: '#fff',
        width: 2
      })
    })
  }),

  defaultPoiColor: '0099CC',

  createPoiStyleIcon: function (catId, color) {
    var me = this,
      size = 14,
      catStore = Ext.getStore('PoiCategoriesTree'),
      node = catId ? catStore.getNodeById(catId) : null,
      clr = color || me.defaultPoiColor;
    blueStyle = me.blueStyle;
    if (!node) {
      return blueStyle;
    }
    var iconPath = 'resources/images/symbols/' + node.get('iconPath');
    // console.log(iconPath);
    return Ext.Ajax.request({
      url: iconPath,
      method: 'GET'
    }).then(function (response, opts) {
      // console.log(response);
      try {
        var canvas =
        /** @type {HTMLCanvasElement} */ (document.createElement('canvas'));
        var ctx = canvas.getContext('2d');
        var v = canvg.Canvg.fromString(ctx, response.responseText);
        v.documentElement.children.forEach(function (child) {
          if (child.type === 'path') {
            child.styles['fill'] = new canvg.Property(v.document, 'fill', '#' + clr);
          }
        });
        // console.log(v);
        v.render();
        style = new ol.style.Style({
          image: new ol.style.Icon({
            // src: iconPath,
            // size: size,
            // color: '#' + clr,
            img: canvas,
            imgSize: [size, size]
          })
        });
        if (!me.poiStyleCache[catId]) {
          me.poiStyleCache[catId] = {};
        }
        me.poiStyleCache[catId][clr] = style;
        return style;
      } catch (e) {
        console.error(e);
        me.poiStyleCache[catId] = {};
        me.poiStyleCache[catId][clr] = blueStyle;
        return blueStyle;
      }
    },
      function (response, opts) {
        console.error('server-side failure with status code ' + response.status);
        me.poiStyleCache[catId] = {};
        me.poiStyleCache[catId][clr] = blueStyle;
        return blueStyle;
      });
  },

  reloadPoi: function () {
    var me = this,
      features = [],
      store = me.getPoiStore(),
      layer = me.poiLayer;
    if (!layer) {
      return;
    }
    var newCats = {};
    layer.getSource().clear();
    // console.log('reloadPoi');
    store.getData().each(function (item) {
      // if (item.data.geometry && !layer.getSource().getFeatureById(item.getId())) {
      var f = new ol.Feature(item.data),
        clr = item.data.color || me.defaultPoiColor;
      f.setId(item.getId());
      f.set('origObj', item);
      features.push(f);
      if (item.data.categoryId && (!me.poiStyleCache[item.data.categoryId] || !me.poiStyleCache[item.data.categoryId][clr]) && (!newCats[item.data.categoryId] || !newCats[item.data.categoryId][clr])) {
        if (!newCats[item.data.categoryId]) {
          newCats[item.data.categoryId] = {};
        }
        newCats[item.data.categoryId][clr] = item.data.categoryId;
      }
      // }
      return true;
    });
    // layer.getSource().getFeatures().forEach(function(f){
    //     if (!store.getById(f.getId())) {
    //         layer.getSource().removeFeature(f);
    //     }
    // });
    // console.log([features]);
    if (Object.keys(newCats).length > 0) {
      Promise.all(Object.keys(newCats).reduce(function (res, catId) {
        for (var clr in newCats[catId]) {
          res.push(me.createPoiStyleIcon(catId, clr))
        }
        return res;
      }, [])).then(function () {
        // layer.getSource().clear(true);
        layer.getSource().addFeatures(features);
        // me.createBuffer(features);
        me.recalcBuffer();
      });
    } else {
      // layer.getSource().clear();
      if (features.length) {
        layer.getSource().addFeatures(features);
      }
      // me.createBuffer(features);
      me.recalcBuffer();
    }
  },
  onPoiStoreDataChanged: function (store) {
    // console.log('onPoiStoreDataChanged');
    this.reloadPoi();
  },

  onCityPolygonStoreChanged: function (store) {
    var me = this;
    me.reloadCityPolygons();
  },
  reloadCityPolygons: function () {
    //console.log('--------------reloadCityPolygons-------------')
    var me = this,
      features = [],
      store = me.getCityPolygonStore(),
      layer = me.CityHeatmapLayer,
      source = layer.getSource();
    if (!layer) {
      return;
    }
    store.getData().each(function (item) {
      var f = source.getFeatureById(item.getId());
      if (!f) {
        f = new ol.Feature(item.data);
        f.setGeometry(new ol.geom.Point(ol.proj.fromLonLat([item.data.lon, item.data.lat])));
        f.setId(item.getId());
        f.set('origObj', item);
        f.set('transit', item.data.transit);
        f.set('weight', item.data.weight);
        features.push(f);
      } else {
        f.set('transit', item.data.transit);
        f.set('weight', item.data.weight);
      }
    });
    layer.getSource().addFeatures(features);

    me.CityPolygonLayer.getSource().clear();
    var pFeatures = [];
    store.each(record => {
      var data = record.getData();
      var pf = new ol.Feature();
      pf.setGeometry(new ol.geom.Polygon([data.geog[0].map(geo => { return ol.proj.fromLonLat(geo); })]));
      pf.setId(record.getId());
      //console.log(pf);
      pFeatures.push(pf);
    });
    me.CityPolygonLayer.getSource().addFeatures(pFeatures);
  },
  onKSPolygonsStoreChanged: function (store) {
    var me = this;
    this.reloadKSPolygons();
  },
  reloadKSPolygons: function () {
    var me = this,
      features = [],
      store = me.getKSPolygonsStore(),
      layer = me.KSHeatmapLayer,
      source = layer.getSource();
    if (!layer) {
      return;
    }
    source.forEachFeature(function (f) {
      if (!store.getData().getByKey(f.getId())) {
        source.removeFeature(f);
      }
    });
    store.getData().each(function (item) {
      var f = source.getFeatureById(item.getId());
      if (!f) {
        f = new ol.Feature(item.data);
        // f.setGeometry(new ol.geom.Point(ol.proj.fromLonLat([item.data.lon1 + (item.data.lon2 - item.data.lon1)/2, item.data.lat1 + (item.data.lat2 - item.data.lat1)/2])));
        f.setGeometry(new ol.geom.Point(ol.proj.fromLonLat([item.data.lon, item.data.lat])));
        f.setId(item.getId());
        f.set('origObj', item);
        features.push(f);
      } else {
        f.set('transit', item.data.transit);
      }
    });
    layer.getSource().addFeatures(features);

    me.KSPolygonLayer.getSource().clear();
    var pFeatures = [];
    store.each(record => {
      var data = record.getData();
      var pf = new ol.Feature();
      pf.setGeometry(new ol.geom.Polygon([[ol.proj.fromLonLat([data.lon1, data.lat1]), ol.proj.fromLonLat([data.lon1, data.lat2]), ol.proj.fromLonLat([data.lon2, data.lat2]), ol.proj.fromLonLat([data.lon2, data.lat1]), ol.proj.fromLonLat([data.lon1, data.lat1])]]));
      pf.setId(record.getId());
      pFeatures.push(pf);
    });
    me.KSPolygonLayer.getSource().addFeatures(pFeatures);
  },
  onKSStreetsStoreChanged: function (store) {
    var me = this;
    this.reloadKSStreets();
  },
  reloadKSStreets: function () {
    // console.log('start reloadFaces');
    // return;
    var me = this,
      features = [],
      store = me.getKSStreetsStore(),
      layer = me.KSStreetLayer,
      source = layer.getSource();
    if (!layer) {
      return;
    }
    source.forEachFeature(function (f) {
      if (!store.getData().getByKey(f.getId())) {
        source.removeFeature(f);
      }
    });
    store.getData().each(function (item) {
      var f = source.getFeatureById(item.getId());
      if (!f) {
        f = new ol.Feature();
        // f.setGeometry(new ol.geom.Point(ol.proj.fromLonLat([item.data.lon1 + (item.data.lon2 - item.data.lon1)/2, item.data.lat1 + (item.data.lat2 - item.data.lat1)/2])));
        f.setId(item.getId());
        f.set('direction', item.get('direction'));
        // console.log(item);
        var olGeometry = Bigmedia.Vars.convertTurfToOl(item.get('geometry'));
        // console.log(olGeometry);
        f.setGeometry(olGeometry);
        features.push(f);
      }
      // else {
      //   f.set('cnt_transit', item.data.cnt_transit);
      // }
    });
    layer.getSource().addFeatures(features);
  },
  onGeoStoreDataChanged: function (store) {
    // onGeoStoreAdd: function (store) {
    var me = this;
    // console.log('onGeoStoreDataChanged');
    // console.log([me.getGeoStore().isLoading(), me.getGeoStore().bgLoading]);
    if (!me.getGeoStore().isLoading() && !me.getGeoStore().bgLoading) {
      this.reloadFaces();
    }
  },
  onGeoStoreRemove: function (store) {
    // console.log('onStoreDataChanged');
    this.reloadFaces();
  },
  refreshReplaced: function () {
    this.updateReplaceBuffer(this.getReplaceBuffer());
  },
  onReplaceStoreDataChanged: function (store) {
    // console.log('onReplaceStoreDataChanged');
    var me = this;
    if (!store.holdReload) {
      var masked = !!store.getFilters().get('filterReplaceMapMask');
      if (masked) {
        me.refreshReplaced();
      } else {
        me.reloadReplaceFaces();
      }
    }
  },
  updateCartStore: function (newVal, oldVal) {
    var me = this;
    if (oldVal) {
      oldVal.removeListener('datachanged', me.onCartStoreDataChanged, me);
    }
    if (newVal) {
      newVal.on('datachanged', me.onCartStoreDataChanged, me);
      if (me.cartLayer.getSource().getFeatures().length === 0) {
        me.reloadCartFaces();
      }
    }
    me.extended = false;
    if (me.btnCoverage && me.btnCoverage.getEl().dom) {
      me.btnCoverage.setVisible(newVal && newVal.getCount() > 0);
    }
  },
  updateCartGrid: function (newVal, oldVal) {
    // console.log('updateGrid %o, %o',newVal,oldVal);
    var me = this;
    if (oldVal) {
      oldVal.removeListener('selectionchange', me.onGridSelectionChanged, me);
      // oldVal.removeListener('rowclick', me.onGridRowClick, me);
      newVal.removeListener('reconfigure', me.onCartGridReconfigure, me);
      newVal.getSelectionModel().removeListener('focuschange', me.onGridFocusChange, me);
      me.setCartStore(null);
    }
    if (newVal) {
      newVal.on('selectionchange', me.onGridSelectionChanged, me);
      // newVal.on('rowclick', me.onGridRowClick, me);
      newVal.on('reconfigure', me.onCartGridReconfigure, me);
      newVal.getSelectionModel().on('focuschange', me.onGridFocusChange, me);
      if (!me.getCartStore()) {
        me.setCartStore(newVal.getStore());
      }
    }
    if (me.btnCoverage) {
      me.btnCoverage.setVisible(newVal && newVal.getStore().getCount() > 0);
    }
    // me.getViewModel().set('hiddenShowCoverageBtn', !!newVal);
  },
  onCartGridReconfigure: function (grid, cartStore) {
    // console.log('onGridReconfigure');
    var me = this;
    me.extended = false;
    me.setCartStore(cartStore);
    me.reloadCartFaces();
  },
  updateSelStore: function (newVal, oldVal) {
    var me = this;
    if (oldVal) {
      oldVal.removeListener('datachanged', me.onSelStoreDataChanged, me);
    }
    if (newVal) {
      newVal.on('datachanged', me.onSelStoreDataChanged, me);
      if (me.selLayer.getSource().getFeatures().length === 0) {
        me.reloadSelFaces();
      }
    }
  },
  updateSelGrid: function (newVal, oldVal) {
    var me = this;
    if (oldVal) {
      oldVal.removeListener('selectionchange', me.onGridSelectionChanged, me);
      newVal.removeListener('reconfigure', me.onSelGridReconfigure, me);
      newVal.getSelectionModel().removeListener('focuschange', me.onGridFocusChange, me);
      me.setCartStore(null);
    }
    if (newVal) {
      newVal.on('selectionchange', me.onGridSelectionChanged, me);
      newVal.on('reconfigure', me.onSelGridReconfigure, me);
      newVal.getSelectionModel().on('focuschange', me.onGridFocusChange, me);
      if (!me.getSelStore()) {
        me.setSelStore(newVal.getStore());
      }
    }
  },
  onSelGridReconfigure: function (grid, selStore) {
    var me = this;
    me.setSelStore(selStore);
    me.reloadSelFaces();
  },
  syncCoverages: function () {
    var me = this,
      features = [],
      store = me.getCartStore(),
      citiesStore = Ext.getStore('CityBoundaries'),
      layer = me.cartLayer,
      cities = {};
    if (!layer) {
      // console.log('no cartlayer');
      return;
    }
    me.cartCoveragesLayer.getSource().clear(true);
    store.each(function (rec) {
      var face = rec.get('face') ? rec.get('face') : rec;
      if (citiesStore.getById(face.get('id_city'))) {
        if (!cities[face.get('id_city')]) {
          cities[face.get('id_city')] = { coverages: [], grps: 0 };
        }
        cities[face.get('id_city')].grps += face.get('grp') ? face.get('grp') : 0.01;
        Bigmedia.Vars.coverageDays.forEach(function (day, i) {
          if (!face.get('coverages')) {
            var coverages = Bigmedia.Vars.calculateFaceCoverages(face);
          }
          if (face.get('coverages') && face.get('coverages')[i]) {
            if (!cities[face.get('id_city')].coverages[i]) {
              cities[face.get('id_city')].coverages.push(face.get('coverages')[i]);
            } else {
              try {
                cities[face.get('id_city')].coverages[i] = cities[face.get('id_city')].coverages[i].union(face.get('coverages')[i]);
              } catch (e) {
                console.error('error union coverages map001');
              }
            }
          } else {
            // console.log('no coverage: %o', face);
          }
        });
      }
    });
    var covFeatures = [];
    Object.keys(cities).forEach(function (id_city) {
      var city = citiesStore.getById(id_city);
      if (city) {
        // Bigmedia.Vars.coverageDays.forEach(function(day, i){
        if (cities[id_city].coverages[4]) {
          try {
            var union = jsts.operation.union.UnaryUnionOp.union(cities[id_city].coverages[4]);
            var intersected = jsts.operation.overlay.OverlayOp.intersection(city.get('jsts'), union);
            var olFeature = Bigmedia.Vars.convertJstsToOl(intersected, me.getView().getProjection());
            if (olFeature) {
              covFeatures.push(olFeature);
            }
          } catch (e) {
            console.error('error calculate covFeatures');
          }
        }
        // });
      }
    });
    me.cartCoveragesLayer.getSource().addFeatures(covFeatures);
    me.cartCoveragesLoaded = true;
  },
  reloadCartFaces: function () {
    // console.log('reloadCartFaces');
    var me = this,
      features = [],
      store = me.getCartStore(),
      layer = me.cartLayer;
    if (!layer || !store) {
      return;
    }
    if (me.popupOverlay) {
      me.popupOverlay.setPosition(undefined);
      me.coveragesLayer.getSource().clear();
      if (me.getDetFace()) {
        me.getDetFace().hide();
      }
    }
    // console.log(store);
    var extent = ol.extent.createEmpty();

    // me.cellsLayer.getSource().clear(true);

    store.getData().each(function (item) {
      // console.log(item);
      if (item.data.geometry) {
        var f = new ol.Feature(item.data);
        f.setId(item.getId());
        f.set('origObj', item);
        //f.set('angle',item.get('angle'));
        features.push(f);
        if (!me.extended) {
          ol.extent.extend(extent, f.getGeometry().getExtent());
        }
      }

      return true;
    });
    // console.log('Features count: %d', features.length);
    layer.getSource().clear(true);
    layer.getSource().addFeatures(features);
    // console.log([store, store.getCount()]);
    if (me.btnCoverage && me.btnCoverage.getEl().dom) {
      // me.btnCoverage.setVisible(store && store.getCount() > 0);
      me.btnCoverage.setHidden(!store || store.getCount() === 0);
    }
    if (me.cartCoveragesLayer.getVisible()) {
      me.syncCoverages();
    } else {
      me.cartCoveragesLoaded = false;
    }
    if (extent && !ol.extent.isEmpty(extent) && !me.extended) {
      me.extended = true;
      me.map.getView().fit(extent, me.map.getSize(), { minResolution: 0.4 });
    }
  },
  onCartStoreDataChanged: function (store) {
    // console.log('onStoreDataChanged');
    this.reloadCartFaces();
  },
  reloadSelFaces: function () {
    // console.log('reloadSelFaces');
    var me = this,
      features = [],
      store = me.getSelStore(),
      layer = me.selLayer;
    if (!layer || !store) {
      return;
    }
    if (me.popupOverlay) {
      me.popupOverlay.setPosition(undefined);
      if (me.getDetFace()) {
        me.getDetFace().hide();
      }
    }
    store.getData().each(function (item) {
      if (item.data.geometry) {
        var f = new ol.Feature(item.data);
        f.setId(item.getId());
        f.set('origObj', item);
        features.push(f);
      }
      return true;
    });
    layer.getSource().clear(true);
    layer.getSource().addFeatures(features);
  },
  onSelStoreDataChanged: function (store) {
    // console.log('onStoreDataChanged');
    this.reloadSelFaces();
  },
  initMap: function () {
    var me = this;
    me.poiStyleCache = {};
    var greyStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          color: 'rgba(100, 100, 100, 0.8)'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(50, 50, 50, 0.6)',
          width: 2
        })
      })
    });
    var blueStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          color: '#0099CC'
        }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 2
        })
      })
    });
    var redStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          color: '#8B0000'
        }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 2
        })
      })
    });
    var faceStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          // color: '#8B0000'
          color: '#2c9f2c'
        }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 2
        })
      })
    });
    var selectStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          // color: '#0099CC'
          color: '#f5db24'
        }),
        stroke: new ol.style.Stroke({
          // color: '#fff',
          color: '#2c9f2c',
          width: 2
        })
      })
    });
    var selectCartStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          // color: '#0099CC'
          color: '#f5db24'
        }),
        stroke: new ol.style.Stroke({
          // color: '#fff',
          color: '#8B0000',
          width: 2
        })
      })
    });
    var cartStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          // color: '#0099CC'
          color: '#8B0000'
        }),
        stroke: new ol.style.Stroke({
          // color: '#fff',
          color: '#fff',
          width: 2
        })
      })
    });
    var textFill = new ol.style.Fill({
      color: '#fff'
    });
    var textStroke = new ol.style.Stroke({
      color: 'rgba(0, 0, 0, 0.6)',
      width: 3
    });
    me.invisibleFill = new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.01)'
    });
    var approxCellStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 4,
        fill: new ol.style.Fill({
          color: '#8B0000'
          // color: '#eee'
        }),
        stroke: new ol.style.Stroke({
          // color: '#fff',
          color: '#000',
          width: 1
        })
      })
    });
    var styleCache = {}, vectorStyleCache = {};
    function createVectorStyle(feature, resol) {
      var angle = feature.get('angle') | 0;
      if (feature.get("hidden")) {
        return null;
      }
      if (resol > me.getFaceAsCircleRes()) {
        return greyStyle;
      }
      var size = 11;
      var style = vectorStyleCache[angle];
      if (!style) {
        var canvas =
        /** @type {HTMLCanvasElement} */ (document.createElement('canvas'));
        var render = ol.render.toContext(
          /** @type {CanvasRenderingContext2D} */(canvas.getContext('2d')),
          { size: [size, size] });
        render.setFillStrokeStyle(
          new ol.style.Fill({ color: 'rgba(100, 100, 100, 0.8)' }),
          new ol.style.Stroke({ color: 'rgba(50, 50, 50, 0.6)', width: 1 }));
        render.drawPolygon(new ol.geom.Polygon(
          [[[0, 0], [0, 2], [4, 2], [1, 4], [4, 3], [4, 8], [6, 8], [6, 3], [10, 4], [6, 2], [11, 2], [11, 0], [0, 0]]]));
        style = new ol.style.Style({
          image: new ol.style.Icon({
            img: canvas,
            imgSize: [canvas.width, canvas.height],
            rotation: (-1) * (angle + 180) * Math.PI / 180,
            anchor: [5, 0],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            rotateWithView: true
          })
        });
        vectorStyleCache[size] = style;
      }

      return style;
    }
    var createFaceStyle = function (feature, resol) {
      if (feature.get("hidden")) {
        return null;
      }
      // return new ol.style.Style({
      //     image: new ol.style.Icon({
      //         src: 'resources/xyRk_80.jpg',
      //         // scale: 0.1,
      //         // opacity: 0.3,
      //         rotateWithView: false
      //     })
      // });
      if (resol > me.getFaceAsCircleRes()) {
        return faceStyle;
      }
      var angle = feature.get('angle') || 0,
        icon = feature.get('icon'),
        pos = feature.get('pos') || 0;
      var style = (styleCache[icon] && styleCache[icon][angle]) ? styleCache[icon][angle][pos] : null;
      if (!style) {
        var icon_offset_x = 12,
          icon_offset_y = 6,
          anchor_x = 9,
          anchor_y = 12,
          width = 18,
          height = 18;
        switch (icon) {
          case 'b':
            icon_offset_x = 168;
            icon_offset_y = 3;
            anchor_x = 12;
            anchor_y = 17;
            width = 24;
            height = 24;
            break;
          case 'l':
            icon_offset_x = 325;
            icon_offset_y = 2;
            anchor_x = 15;
            anchor_y = 18;
            width = 30;
            height = 30;
            break;
        }
        if (pos) {
          anchor_x -= (anchor_x * pos) / 2;
        }
        style = new ol.style.Style({
          image: new ol.style.Icon({
            rotation: (-1) * angle * Math.PI / 180,
            offset: [icon_offset_x, icon_offset_y],
            size: [width, height],
            src: 'resources/sides_ico.png',
            anchor: [anchor_x, anchor_y],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            rotateWithView: true
          })
        });
        if (!styleCache[icon]) {
          styleCache[icon] = {};
        }
        if (!styleCache[icon][angle]) {
          styleCache[icon][angle] = {};
        }
        styleCache[icon][angle][pos] = style;
      }
      return style;
    };
    var selectedStyleCache = {};
    var createSelectedFaceStyle = function (feature, resol) {
      if (feature.get("hidden")) {
        return null;
      }
      if (resol > me.getFaceAsCircleRes()) {
        if (me.cartLayer.getSource().getFeatureById(feature.getId())) {
          return selectCartStyle;
        }
        return selectStyle;
      }
      var angle = feature.get('angle') || 0,
        icon = feature.get('icon'),
        pos = feature.get('pos') || 0;

      var style = (selectedStyleCache[icon] && selectedStyleCache[icon][angle]) ? selectedStyleCache[icon][angle][pos] : null;
      if (!style) {
        var icon_offset_x = 52,
          icon_offset_y = 6,
          anchor_x = 9,
          anchor_y = 12,
          width = 18,
          height = 18;
        switch (icon) {
          case 'b':
            icon_offset_x = 208;
            icon_offset_y = 3;
            anchor_x = 12;
            anchor_y = 17;
            width = 24;
            height = 24;
            break;
          case 'l':
            icon_offset_x = 365;
            icon_offset_y = 2;
            anchor_x = 15;
            anchor_y = 18;
            width = 30;
            height = 30;
            break;
        }
        if (pos) {
          anchor_x -= (anchor_x * pos) / 2;
        }

        style = new ol.style.Style({
          image: new ol.style.Icon({
            rotation: (-1) * angle * Math.PI / 180,
            offset: [icon_offset_x, icon_offset_y],
            size: [width, height],
            src: 'resources/sides_ico.png',
            anchor: [anchor_x, anchor_y],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            rotateWithView: true
          })
        });
        if (!selectedStyleCache[icon]) { selectedStyleCache[icon] = {}; }
        if (!selectedStyleCache[icon][angle]) {
          selectedStyleCache[icon][angle] = {};
        }
        selectedStyleCache[icon][angle][pos] = style;
      }
      return style;
    };
    var cartStyleCache = {};
    var createCartFaceStyle = function (feature, resol) {
      //console.log(feature)
      if (feature.get("hidden")) {
        return null;
      }
      if (resol > me.getFaceAsCircleRes()) {
        return cartStyle;
      }
      var angle = feature.get('angle') || 0,
        icon = feature.get('icon'),
        pos = feature.get('pos') || 0;
      var style = (cartStyleCache[icon] && cartStyleCache[icon][angle]) ? cartStyleCache[icon][angle][pos] : null;
      if (!style) {
        var icon_offset_x = 12,
          icon_offset_y = 6,
          anchor_x = 9,
          anchor_y = 12,
          width = 18,
          height = 18;
        switch (icon) {
          case 'b':
            icon_offset_x = 168;
            icon_offset_y = 3;
            anchor_x = 12;
            anchor_y = 17;
            width = 24;
            height = 24;
            break;
          case 'l':
            icon_offset_x = 325;
            icon_offset_y = 2;
            anchor_x = 15;
            anchor_y = 18;
            width = 30;
            height = 30;
            break;
        }
        if (pos) {
          anchor_x -= (anchor_x * pos) / 2;
        }
        style = new ol.style.Style({
          image: new ol.style.Icon({
            rotation: (-1) * angle * Math.PI / 180,
            offset: [icon_offset_x, icon_offset_y],
            size: [width, height],
            src: 'resources/sides_ico.png',
            anchor: [anchor_x, anchor_y],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            rotateWithView: true
          })
        });
        if (!cartStyleCache[icon]) {
          cartStyleCache[icon] = {};
        }
        if (!cartStyleCache[icon][angle]) {
          cartStyleCache[icon][angle] = {};
        }
        cartStyleCache[icon][angle][pos] = style;
      }
      return style;
    };
    source = new ol.source.Vector({

    });
    me.webglPointsStyle = {
      "variables": {
      },
      // "filter": ['!',
      //   ["get", "selected"],
      // ],
      symbol: {
        symbolType: 'image',
        src: 'resources/sides_ico_v6.png',
        "size": [
          "interpolate",
          [
            "exponential",
            2.5
          ],
          [
            "zoom"
          ],
          2,
          26,
          14,
          38
        ],
        rotation: ['/', ['*', 3.14159265, ['-', 360, ['get', 'angle']]], 180],
        // rotation: ['get', 'angle'],
        color: '#0288d1',
        rotateWithView: true,
        offset: [0, 0],
        textureCoord: [
          'case', ['>=', ['zoom'], 15], [0, 0.5, 0.5, 1], [0.5, 0.5, 1, 1]
          // 0, 0, 0.5, 0.5
          // 'match',
          // ['get', 'shape'],
          // 'light',
          // [0, 0, 0.25, 0.5],
          // 'sphere',
          // [0.25, 0, 0.5, 0.5],
          // 'circle',
          // [0.25, 0, 0.5, 0.5],
          // 'disc',
          // [0.5, 0, 0.75, 0.5],
          // 'oval',
          // [0.5, 0, 0.75, 0.5],
          // 'triangle',
          // [0.75, 0, 1, 0.5],
          // 'fireball',
          // [0, 0.5, 0.25, 1],
          // [0.75, 0.5, 1, 1] ],
        ]
      }
      // "symbol": {
      //   "symbolType": "circle",
      //   "size": [
      //     "interpolate",
      //     [
      //       "exponential",
      //       2.5
      //     ],
      //     [
      //       "zoom"
      //     ],
      //     2,
      //     ["*", ["get", "distance"], 0.001],
      //     // 1,
      //     14,
      //     ["*", ["get", "distance"], 0.032]
      //     // 32
      //   ],
      //   "color": //"#ff0000",
      //   ['case', ['==', [ 'get', 'colorIndex' ], 0], wColor, aColor],
      //   "offset": [
      //     0,
      //     0
      //   ],
      //   "opacity": //0.5
      //     [ 'interpolate', [ 'linear' ], ['-', ['var', 'curTime'], ['get', 'timeFromStart']], 0, 1, 3, 0.7, 5, 0.1 , 7.0, 0.0]
      //     // [ '-', 1.0, ['/', ['-', ['var', 'curTime'], ['get', 'timeFromStart']], 5] ]
      // }
    };
    me.webglSelPointsStyle = {
      "variables": {
      },
      symbol: {
        symbolType: 'image',
        src: 'resources/sides_ico_v6.png',
        "size": [
          "interpolate",
          [
            "exponential",
            2.5
          ],
          [
            "zoom"
          ],
          2,
          30,
          14,
          42
        ],
        rotation: ['/', ['*', 3.14159265, ['-', 360, ['get', 'angle']]], 180],
        color: '#CA17D1',
        rotateWithView: true,
        offset: [0, 0],
        textureCoord: [
          'case', ['>=', ['zoom'], 15], [0, 0, 0.5, 0.5], [0.5, 0, 1, 0.5]
        ]
      }
    };

    me.webglFocusPointsStyle = {
      "variables": {},
      "symbol": {
        symbolType: 'image',
        src: 'resources/sides_ico_v6.png',
        "size": ["interpolate",
          [
            "exponential",
            2.5
          ],
          [
            "zoom"
          ],
          2,
          30,
          14,
          42
        ],
        rotation: ['/', ['*', 3.14159265, ['-', 360, ['get', 'angle']]], 180],
        color: '#193E52',
        rotateWithView: true,
        offset: [0, 0],
        textureCoord: [
          'case', ['>=', ['zoom'], 15], [0, 0, 0.5, 0.5], [0.5, 0, 1, 0.5]
        ]
      }
    };

    var facesLayer = new ol.layer.WebGLPoints({
      source: source,
      style: me.webglPointsStyle,
      disableHitDetection: false,
      name: 'faces'
    });

    me.facesLayer = facesLayer;

    var selLayer = new ol.layer.WebGLPoints({
      source: new ol.source.Vector(),
      style: me.webglSelPointsStyle,
      disableHitDetection: false,
      name: 'selfaces'
    });

    me.selLayer = selLayer;

    var focusLayer = new ol.layer.WebGLPoints({
      source: new ol.source.Vector(),
      style: me.webglFocusPointsStyle,
      disableHitDetection: false,
      name: 'selfaces'
    });

    me.focusLayer = focusLayer;

    // var poiSource = new ol.source.Vector({
    // });
    // var poiLayer = new ol.layer.Vector({
    //     source: poiSource,
    //     style: createPoiStyle,
    //     name: 'pois'
    // });
    // me.poiLayer = poiLayer;

    var cartSource = new ol.source.Vector({});

    var cartLayer = new ol.layer.Vector({
      source: cartSource,
      // style: me.redStyle
      // maxResolution: 30,
      style: createCartFaceStyle,
      name: 'cartFaces'
    });

    me.cartLayer = cartLayer;

    var replaceSource = new ol.source.Vector({
      //url: 'geojson.json',
      //format: new ol.format.GeoJSON()
      //features: []
      //features: new ol.Collection()
    });

    var replaceLayer = new ol.layer.Vector({
      source: replaceSource,
      //    //style: me.redStyle
      // Disable cluster layer
      // maxResolution: 30,
      style: createVectorStyle,
      name: 'replaces',
      visible: false
    });

    me.replaceLayer = replaceLayer;


    var invisibleFill = new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.01)'
    });

    var maxFeatureCount;

    var calculateClusterInfo = function (resolution) {
      maxFeatureCount = 0;
      var features = clusterSource.getFeatures();
      var feature, radius;
      for (var i = features.length - 1; i >= 0; --i) {
        feature = features[i];
        var originalFeatures = feature.get('features');
        var extent = ol.extent.createEmpty();
        for (var j = 0, jj = originalFeatures.length; j < jj; ++j) {
          ol.extent.extend(extent, originalFeatures[j].getGeometry().getExtent());
        }
        maxFeatureCount = Math.max(maxFeatureCount, jj);
        radius = 1 * Math.min(ol.extent.getWidth(extent), ol.extent.getHeight(extent)) /
          resolution;
        radius = radius < 12 ? 12 : radius;
        feature.set('radius', radius);
      }
    }

    var currentResolution;

    var styleFunction = function (feature, resolution) {
      // Disable cluster layer
      // if (resolution != currentResolution) {
      //     calculateClusterInfo(resolution);
      //     currentResolution = resolution;
      // }
      var style;
      var size = feature.get('features').length;
      if (size > 1) {
        style = [new ol.style.Style({
          image: new ol.style.Circle({
            radius: feature.get('radius'),
            fill: new ol.style.Fill({
              color: [80, 185, 72, 0.5]
            })
          }),
          text: new ol.style.Text({
            text: size.toString(),
            fill: textFill,
            stroke: textStroke
          })
        })];
      } else {
        var originalFeature = feature.get('features')[0];
        style = [createFaceStyle(originalFeature, resolution)];
      }
      return style;
    }

    var map = me.getMap();
    var tileLayer = map.getLayers().item(0);

    me.citiesLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 3
        })
      }),
      minResolution: 30
    });

    // map.addLayer(me.citiesLayer);

    var pixelRatio = ol.has.DEVICE_PIXEL_RATIO;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var boundariesStore = Ext.getStore('CityBoundaries');

    // function gradient(feature, resolution) {
    //     var city = boundariesStore.getById(feature.get('id_city'));
    //     if (feature.get('grp') && city) {
    //         var r = Math.sqrt(city.get('area') * feature.get('grp') / (100 * Math.PI)) * Math.sqrt(2);
    //         var radius = r / resolution * pixelRatio * 1.6;
    //         var extent = feature.getGeometry().getExtent();
    //         var cx = feature.get('origin').getCoordinates()[0],
    //             cy = feature.get('origin').getCoordinates()[1];
    //         var x = (cx - ol.extent.getBottomLeft(extent)[0]) / resolution * pixelRatio,
    //             y = (ol.extent.getTopLeft(extent)[1] - cy) / resolution * pixelRatio;
    //         var grad = context.createRadialGradient(x, y,
    //             radius, x, y, 0);
    //             grad.addColorStop(1, 'rgba(0,255,0,0.9)');
    //             grad.addColorStop(0, 'rgba(255,255,255,0.2)');
    //             return grad;
    //     } else {
    //         return null;
    //     }
    // }

    // Generate style for gradient
    var fill = new ol.style.Fill();
    var style = new ol.style.Style({
      fill: fill,
      stroke: new ol.style.Stroke({
        color: '#ddd',
        width: 1
      })
    });

    var coverageStyle = function (feature, resolution) {
      fill.setColor(gradient(feature, resolution));
      return style;
    }

    me.cartCoveragesLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      visible: false,
      minResolution: 3,
      // maxResolution: 40,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 0, 0, 0.3)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ddd',
          width: 1
        })
      })
    });
    // map.addLayer(me.cartCoveragesLayer);

    me.coveragesLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      minResolution: 3,
      maxResolution: 50,
      // gradient - pretty but unefficient
      // style: coverageStyle
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.3)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ddd',
          width: 1
        })
      })
    });
    // map.addLayer(me.coveragesLayer);

    me.bufferLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 255, 0, 0.1)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 1
        }),
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: '#ffcc33'
          })
        })
      })
    });
    // map.addLayer(me.bufferLayer);

    me.replaceBufferLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        }),
        stroke: new ol.style.Stroke({
          color: '#888888',
          width: 1
        }),
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: '#ffcc33'
          })
        })
      })
    });

    var radiusLayer = new ol.layer.Vector({
      source: new ol.source.Vector()
    });
    me.radiusLayer = radiusLayer;
    // map.addLayer(radiusLayer);

    var selFeatures = new ol.Collection;

    var selectSingleClick = new ol.interaction.Select({
      //Disable cluster layer
      // layers: [clusterLayer, facesLayer, cartLayer],
      layers: [facesLayer, cartLayer, replaceLayer],
      style: createSelectedFaceStyle,
      // multi: true,
      // filter: function (f, layer) {
      //     console.log([f, layer]);
      //     return f.get('selected');
      // }
      // toggleCondition: function (mapBrowserEvent) {
      //     return ol.events.condition.singleClick(mapBrowserEvent)
      // },
      addCondition: function (mapBrowserEvent) {
        return ol.events.condition.singleClick(mapBrowserEvent)
      },
      removeCondition: function (mapBrowserEvent) {
        return ol.events.condition.singleClick(mapBrowserEvent)
      },
      features: selFeatures
      // ,
      // addCondition: ol.events.condition.singleClick
      //filter: function(f,l){
      //    return l.get('name') !== 'cluster';
      //}
      /*, style: function(){return null;}*/
    });
    map.addInteraction(selectSingleClick);

    // disable doubleclick
    // var selectDoubleClick = new ol.interaction.Select({
    //     layers: [facesLayer],
    //     condition: ol.events.condition.doubleClick
    // });
    // map.addInteraction(selectDoubleClick);

    // hide face popup when user clicks on the tile layer
    me.map.on('singleclick', function (evt) {
      me.popupOverlay.setPosition(undefined);
      me.coveragesLayer.getSource().clear();
      // if (me.getDetFace()) {
      //     me.getDetFace().hide();
      // }
    });

    var onSelect = function (evt) {
      if (evt.selected.length == 0 && evt.deselected.length == 0) {
        me.popupOverlay.setPosition(undefined);
        // console.log('hide popup');
        return;
      }
      var grid = me.getGrid();
      var store = me.getGeoStore(),
        cartStore = me.getCartStore(),
        replaceStore = me.getReplaceStore();
      if (evt.selected.length > 0) {
        var selected = evt.selected[0];
        if (selected.get('features')) { //event on clustered object
          var originalFeatures = selected.get('features');
          var extent = ol.extent.createEmpty();
          for (var j = 0, jj = originalFeatures.length; j < jj; ++j) {
            ol.extent.extend(extent, originalFeatures[j].getGeometry().getExtent());
          }
          map.getView().fit(extent, map.getSize(), { minResolution: 0.4 });
          selectSingleClick.getFeatures().remove(selected);
          return;
        }
        var rec;
        if (cartStore) {
          rec = cartStore.getById(selected.getId());
          if (rec && me.getCartGrid()) {
            me.getCartGrid().getView().focusRow(rec);
          }
        }
        if (!rec && store) {
          rec = store.getById(selected.getId());
          if (rec && me.getGrid()) {
            me.getGrid().getView().focusRow(rec);
          }
        }
        // console.log(rec.get('popupPhotoId'));
        if (!rec && replaceStore) {
          rec = replaceStore.getById(selected.getId());
          if (rec && me.getReplaceGrid()) {
            me.getReplaceGrid().getView().focusRow(rec);
          }
        }
        if (rec) {
          // me.popupFace(rec);
          if (me.getDetFace()) {
            me.getDetFace().setRecord(rec);
          } else if (me.getDetFace() != false) {
            me.popup.setRecord(rec);
            me.popupOverlay.setPosition(selected.getGeometry().getCoordinates());
          }
        }
        // selectSingleClick.getFeatures()
        selFeatures.remove(selected);
      }
      if (evt.deselected.length > 0) {
        // selectSingleClick.getFeatures().remove(evt.deselected[0]);
        var deselected = evt.deselected[0];
        var rec;
        if (cartStore) {
          rec = cartStore.getById(deselected.getId());
        }
        if (!rec && store) {
          rec = store.getById(deselected.getId());
        }
        if (!rec && replaceStore) {
          rec = replaceStore.getById(deselected.getId());
        }
        // console.log(rec.get('popupPhotoId'));
        if (rec) {
          // me.popupFace(rec);
          if (me.getDetFace()) {
            me.getDetFace().setRecord(rec);
          } else if (me.getDetFace() != false) {
            me.popup.setRecord(rec);
            me.popupOverlay.setPosition(deselected.getGeometry().getCoordinates());
          }
        }
        selFeatures.push(deselected);
        // console.log(selectSingleClick.getFeatures());
      }

      // Remove interactions on deselect rows in grid
      // if (evt.deselected.length > 0) {
      //     evt.deselected.forEach(function (f) {
      //         var recs = evt.deselected.map(function (f) {
      //             var rec = grid.getStore().getById(f.getId());
      //             if (rec) {
      //                 rec.set('selected',false,{silent: true});
      //             }
      //             return rec;
      //         });
      //         if (grid.deselect) {
      //             grid.deselect(recs, true);
      //         }
      //         else {
      //             grid.getSelectionModel().deselect(recs, true);
      //         }
      //     });
      // }

    }

    var onDoubleClick = function (evt) {
      if (evt.selected.length == 0 && evt.deselected.length == 0) return;
      var grid = me.getGrid();
      var store = me.getGeoStore();
      if (evt.selected.length > 0) {
        var selected = evt.selected[0];
        if (selected.get('features')) { //event on clustered object
          //var originalFeatures = selected.get('features');
          //var extent = ol.extent.createEmpty();
          //for (var j = 0, jj = originalFeatures.length; j < jj; ++j) {
          //    ol.extent.extend(extent, originalFeatures[j].getGeometry().getExtent());
          //}
          //map.getView().fit(extent, map.getSize(), {minResolution: 0.4});
          //selectSingleClick.getFeatures().remove(selected);
          return;
        }

        var recs = evt.selected.map(function (f) {
          return grid.getStore().getById(f.getId());
        });
        selectDoubleClick.getFeatures().remove(selected);
        if (recs.length > 0) {
          if (grid.select) {
            //grid.select(recs,true);
          }
          else {
            grid.getView().focusRow(recs[0]);
            grid.fireEventArgs('celldblclick', [null, null, null, recs[0]]);
            //grid.getSelectionModel().select(recs, true);
          }
        }
      }
    }

    function syncSelMap2Grid() {
      var grid = me.getGrid();
      var mapSelected = selectSingleClick.getFeatures();
      mapSelected.forEach(function (f) {
        grid.getSelection().select(f.get('num'));
      });
    }

    me.selectAll = function () {
      selectSingleClick.getFeatures().extend(facesLayer.getSource().getFeatures());
    }

    me.deselectAll = function () {
      selectSingleClick.getFeatures().clear();
    }

    me.selectFace = function (face) {
      var f = facesLayer.getSource().getFeatureById(face.getId());
      if (!f) {
        f = cartLayer.getSource().getFeatureById(face.getId());
      }
      if (f) {
        selectSingleClick.getFeatures().push(f);
      }
    }

    me.deselectFace = function (face) {
      var f = facesLayer.getSource().getFeatureById(face.getId());
      if (!f) {
        f = cartLayer.getSource().getFeatureById(face.getId());
      }
      if (f) {
        selectSingleClick.getFeatures().remove(f);
      }
    }

    me.showFaceCoverage = function (face) {
      // TODO showFaceCoverage
      me.coveragesLayer.getSource().clear(true);
      var coverages = Bigmedia.Vars.getCoverages([parseFloat(face.get('lon')), parseFloat(face.get('lat'))], face.get('id_city'), face.get('grp'), face.get('angle'));
      if (coverages) {
        // console.log(item.record.get('coverages')[item.field]);
        var olFeature = Bigmedia.Vars.convertJstsToOl(coverages[0], me.map.getView().getProjection());
        olFeature.setProperties({ id_city: face.get('id_city'), origin: face.get('geometry'), grp: face.get('grp') });
        me.coveragesLayer.getSource().addFeatures([olFeature]);
      }
      delete me.highlightFaceCoverageTimer;
    }

    me.showPoiHint = function (poi, coords) {
      // TODO showFaceCoverage
      // me.hint.setRecord(poi.get('origObj'));
      me.hint.setHtml('<b>' + poi.get('origObj').get('name') + '</b><br>' +
        (poi.get('origObj').get('city') ? poi.get('origObj').get('city') + ', ' : '') +
        '<span data-qtip="' + poi.get('origObj').get('address') + '">' + (poi.get('origObj').get('address') ? ' ' + poi.get('origObj').get('address') : '') + (poi.get('origObj').get('housenumber') ? ' ' + poi.get('origObj').get('housenumber') : '') + '</span>');
      if (coords) {
        me.hintOverlay.setPosition(coords);
      } else {
        me.hintOverlay.setPosition(poi.getGeometry().getCoordinates());
      }
      // me.hintPoi(poi.get('origObj'));
      delete me.showPoiHintTimer;
    }

    me.showFaceHint = function (face) {
      // me.faceHint.setRecord(face);
      var origFace = face.get('origObj');
      var grid = me.getGrid(),
        cartGrid = me.getCartGrid(),
        replaceGrid = me.getReplaceGrid();
      me.faceHint.setHtml('<b>' + origFace.get('supplierNo') + '</b> (' + origFace.get('doorsNo') + ')<br>' +
        origFace.get('city') + ' <b>' + origFace.get('catab') + ' ' + origFace.get('size') + ' ' + origFace.get('sidetype') + '</b><br><span data-qtip="' + origFace.get('address') + '"> ' + origFace.get('address') + '</span>');
      me.faceHintOverlay.setPosition(face.getGeometry().getCoordinates());
      delete me.showFaceHintTimer;
      if (grid) {
        grid.getView().focusRow(origFace);
      }
      if (cartGrid) {
        cartGrid.getView().focusRow(origFace);
      }
      if (replaceGrid) {
        replaceGrid.getView().focusRow(origFace);
      }
    }

    map.on('pointermove', function (evt) {
      me.hintOverlay.setPosition(undefined);
      // me.faceHintOverlay.setPosition(undefined);
      if (me.highlightFaceCoverageTimer) {
        clearTimeout(me.highlightFaceCoverageTimer);
        delete me.highlightFaceCoverageTimer;
      }
      if (me.showPoiHintTimer) {
        clearTimeout(me.showPoiHintTimer);
        delete me.showPoiHintTimer;
      }

      if (evt.dragging) {
        return;
      }

    });

    selectSingleClick.on('select', onSelect);
    // disable doubleclick
    // selectDoubleClick.on('select', onDoubleClick);

    var maskStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2
      }),
      // image: new ol.style.Icon({
      //     anchor: [0.5, 1],
      //     anchorXUnits: 'fraction',
      //     anchorYUnits: 'fraction',
      //     color: 'rgba(255, 0, 0, 0.5)',
      //     src: 'resources/images/symbols/amenity/bar.svg'
      // })
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          // color: '#ffcc33'
          color: 'rgba(255, 204, 51, 0.6)'
        })
      })
    });

    me.poiIconStyleCache = {};
    me.poiCircleStyleCache = {};

    function createPoiStyle(feature, resol) {
      if (feature.get("hidden")) {
        return null;
      }
      // if (resol > me.getFaceAsCircleRes()) {
      //     return maskStyle;
      // }
      var catId = feature.get('categoryId'),
        clr = feature.get('color') || me.defaultPoiColor,
        iconId = feature.get('iconId');
      if (catId) {
        return me.poiStyleCache[catId][clr] || maskStyle;
      }
      if (iconId) {
        if (!me.poiIconStyleCache[iconId]) {
          me.poiIconStyleCache[iconId] = new ol.style.Style({
            image: new ol.style.Icon({
              src: 'api/v1/icons/' + iconId + '/image',
              // color: '#' + clr,
              // scale: 0.1,
              // opacity: 0.3,
              rotateWithView: false
            })
          });
        }
        return me.poiIconStyleCache[iconId];
      }
      if (feature.get('color') !== me.defaultPoiColor) {
        if (!me.poiCircleStyleCache[clr]) {
          me.poiCircleStyleCache[clr] = new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6,
              fill: new ol.style.Fill({
                color: '#' + clr
              }),
              stroke: new ol.style.Stroke({
                color: '#fff',
                width: 2
              })
            })
          });
        }
        return me.poiCircleStyleCache[clr];
      }
      if (feature.getGeometry().getType() === 'Point') {
        return me.blueStyle;
      }
      return maskStyle;
    }

    var vector = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: createPoiStyle
    });

    me.maskLayer = vector;
    me.poiLayer = vector;

    // me.maskLayer.getSource().on('addfeature', function(){
    //     if (!me.poiStore) {
    //         return;
    //     }
    // });

    function updateFeatureInPoiStore(f) {
      if (!me.getPoiStore()) {
        return;
      }
      var centroid = Bigmedia.Vars.getOlGeometryCentroid(f.getGeometry()),
        lonlat = ol.proj.toLonLat(centroid.getCoordinates());
      var rec = f.get('origObj');
      if (rec) {
        // console.log([rec.get('lon'), rec.get('lat')].concat(lonlat));
        rec.set({
          lon: lonlat[0],
          lat: lonlat[1],
          centroid: centroid,
          geometry: f.getGeometry()
        });
      }
    }

    me.maskModify = {
      init: function () {
        // this.modify = new ol.interaction.Modify({
        //     source: vector.getSource()
        // });

        // Old version
        this.select = new ol.interaction.Select({
          layers: [vector]
        });
        map.addInteraction(this.select);
        this.modify = new ol.interaction.Modify({
          features: this.select.getFeatures(),
          deleteCondition: function (event) {
            return ol.events.condition.shiftKeyOnly(event) &&
              ol.events.condition.singleClick(event);
          }
        });
        map.addInteraction(this.modify);
        this.setEvents();
      },
      setEvents: function () {
        // var selectedFeatures = this.select.getFeatures();
        // this.select.on('change:active', function() {
        //     selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
        // });
        this.modify.on('modifyend', function (e) {
          // console.log(e);
          e.features.forEach(function (feature) {
            updateFeatureInPoiStore(feature);
            me.recalcBuffer(feature);
          });
        });
      },
      setActive: function (active) {
        this.modify.setActive(active);
        if (active) {
          me.maskDraw.setActive(false);
        }
        // this.select.setActive(active);
      }
    };

    me.maskModify.init();

    function addFeatureToPoiStore(f) {
      if (!me.getPoiStore()) {
        return;
      }
      var lonlat, namePrefix = '';

      // console.log(Bigmedia.Vars.olFormat.writeGeometry(f.getGeometry(), { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'}));
      // var turfGeometry = Bigmedia.Vars.convertOlToTurf(f.getGeometry());
      var centroid = Bigmedia.Vars.getOlGeometryCentroid(f.getGeometry());
      lonlat = ol.proj.toLonLat(centroid.getCoordinates());
      switch (f.getGeometry().getType()) {
        case 'Point':
          // lonlat = ol.proj.toLonLat(f.getGeometry().getCoordinates());
          namePrefix = 'Point on ';
          break;
        case 'LineString':
          // lonlat = ol.proj.toLonLat(f.getGeometry().getCoordinates());
          namePrefix = 'Line near ';
          break;
        case 'Circle':
          namePrefix = 'Circle around ';
          // lonlat = ol.proj.toLonLat(f.getGeometry().getCenter());
          break;
        default:
          namePrefix = 'Polygon with centroid on ';
        // lonlat = ol.proj.toLonLat(f.getGeometry().getCenter());
      }
      Ext.Ajax.request({
        //http://10.10.100.3
        url: 'geocoding/reverse?lat=' + lonlat[1] + '&lon=' + lonlat[0] + '&format=geojson&accept-language=uk,en,ru&countrycodes=ua&addressdetails=1&polygon_geojson=1',

        callback: function (opts, success, response) {
          var newRec = {
            name: namePrefix + lonlat[0] + ', ' + lonlat[1],
            geometry: f.getGeometry(),
            lon: lonlat[0],
            lat: lonlat[1],
            centroid: centroid
            // ,
            // id: f.getId()
          };
          if (success) {
            try {
              var json = JSON.parse(response.responseText);
              if (json.features) {
                newRec.name = namePrefix + json.features[0].properties.display_name;
                newRec.address = json.features[0].properties.address.road;
                newRec.city = json.features[0].properties.address.city;
                newRec.housenumber = json.features[0].properties.address.housenumber;
                // Bigmedia.Vars.convertTurfToOl(turf.centroid(json.features[0].geometry).geometry);
              }
            } catch (e) {

            }
          }
          // console.log(newRec);
          me.getPoiStore().beginUpdate();
          var newPoi = me.getPoiStore().add(newRec)[0];
          f.set('origObj', newPoi);
          f.setId(newPoi.getId());
          me.getPoiStore().endUpdate();
        }
      })
    }

    me.maskDraw = {
      init: function () {
        map.addInteraction(this.Point);
        this.Point.setActive(false);
        map.addInteraction(this.LineString);
        this.LineString.setActive(false);
        map.addInteraction(this.Polygon);
        this.Polygon.setActive(false);
        map.addInteraction(this.Circle);
        this.Circle.setActive(false);
        this.setEvents();
      },
      Point: new ol.interaction.Draw({
        source: vector.getSource(),
        type: /** @type {ol.geom.GeometryType} */ ('Point')
      }),
      LineString: new ol.interaction.Draw({
        source: vector.getSource(),
        type: /** @type {ol.geom.GeometryType} */ ('LineString')
      }),
      Polygon: new ol.interaction.Draw({
        source: vector.getSource(),
        type: /** @type {ol.geom.GeometryType} */ ('Polygon')
      }),
      Circle: new ol.interaction.Draw({
        source: vector.getSource(),
        type: /** @type {ol.geom.GeometryType} */ ('Circle')
      }),
      setEvents: function () {
        this.Point.on('drawend', function (evt) {
          evt.feature.setId(me.autoId());
          addFeatureToPoiStore(evt.feature);
          me.recalcBuffer(evt.feature);
        });
        this.LineString.on('drawend', function (evt) {
          evt.feature.setId(me.autoId());
          addFeatureToPoiStore(evt.feature);
          me.recalcBuffer(evt.feature);
        });
        this.Circle.on('drawend', function (evt) {
          evt.feature.setId(me.autoId());
          addFeatureToPoiStore(evt.feature);
          me.recalcBuffer(evt.feature);
        });
        this.Polygon.on('drawend', function (evt) {
          evt.feature.setId(me.autoId());
          addFeatureToPoiStore(evt.feature);
          me.recalcBuffer(evt.feature);
        });
      },
      getActive: function () {
        return this.activeType ? this[this.activeType].getActive() : false;
      },
      setActive: function (active, type) {
        if (active && type) {
          this.activeType && this[this.activeType].setActive(false);
          this[type].setActive(true);
          this.activeType = type;
          me.maskModify.setActive(false);
        } else {
          this.activeType && this[this.activeType].setActive(false);
          this.activeType = null;
        }
      }
    };
    me.maskDraw.init();

    me.maskDraw.setActive(false);
    me.maskModify.setActive(false);
    var snap = new ol.interaction.Snap({
      source: vector.getSource()
    });

    // map.addLayer(me.maskLayer);
    map.addInteraction(snap);

    var placeStyle = new ol.style.Style({
      image: new ol.style.Icon({
        src: 'resources/images/place.svg',
        rotateWithView: false
      })
    });

    me.placeLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: []
      }),
      style: placeStyle
    });

    me.CityHeatmapLayer = new ol.layer.Heatmap({
      source: new ol.source.Vector({
        features: []
      }),
      minResolution: 5,
      maxResolution: 350,
      opacity: 0.7,
      blur: 15,
      radius: 20,
      weight: function (feature) {
        return feature.get('weight')
      },
    });
    map.getView().on('change:resolution', function () {
      if (me.CityHeatmapLayer) {
        me.CityHeatmapLayer.setRadius(15 * 50 / map.getView().getResolution())
        me.CityHeatmapLayer.setBlur(10 * 80 / map.getView().getResolution())
      }
      //  console.log((9 * 90 / map.getView().getResolution()),(10 * 90 / map.getView().getResolution()),map.getView().getResolution());
    });
    var CityPolygonStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.1)'
      }),
      stroke: new ol.style.Stroke({
        color: '#000000',
        width: 1
      })
    });
    me.CityPolygonLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: []
      }),
      name: 'CityPolygon',
      style: CityPolygonStyle,
      minResolution: 5,
      maxResolution: 20
    });

    me.KSHeatmapLayer = new ol.layer.Heatmap({
      source: new ol.source.Vector({
        features: []
      }),
      minResolution: 5,
      maxResolution: 350,
      opacity: 0.7,
      blur: 15,
      radius: 20,
      weight: function (feature) {
        // var male = Ext.getStore('KSParamsTree').getNodeById('sex_male').getChecked(),
        //   female = Ext.getStore('KSParamsTree').getNodeById('sex_female').getChecked();
        // if (male != female) {
        //   return feature.get('cnt_transit_' + (male ? 'male' : 'female')) / Ext.getStore('KSPolygons').max('cnt_transit_' + (male ? 'male' : 'female'));
        // }
        return feature.get('transit') / Ext.getStore('KSPolygons').max('transit');//+Ext.getStore('KSPolygons').min('cnt_transit'))/2);
      },
    });

    map.getView().on('change:resolution', function () {
      if (me.KSHeatmapLayer) {
        me.KSHeatmapLayer.setRadius(15 * 50 / map.getView().getResolution())
        me.KSHeatmapLayer.setBlur(10 * 80 / map.getView().getResolution())
      }
      //  console.log((9 * 90 / map.getView().getResolution()),(10 * 90 / map.getView().getResolution()),map.getView().getResolution());
    });

    var KSPolygonStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.1)'
      }),
      stroke: new ol.style.Stroke({
        color: '#000000',
        width: 1
      })
    });

    me.KSPolygonLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: []
      }),
      style: KSPolygonStyle,
      minResolution: 5,
      maxResolution: 20
    });

    // var KSLineArrowStyleFunction = function (feature) {
    //   const geometry = feature.getGeometry();
    //   const styles = [
    //     // linestring
    //     new ol.style.Style({
    //       stroke: new ol.style.Stroke({
    //         color: '#ffcc33',
    //         width: 1,
    //       }),
    //     }),
    //   ];
    //   const direction = feature.get('direction');

    //   geometry.forEachSegment(function (start, end) {
    //     let dx = end[0] - start[0];
    //     let dy = end[1] - start[1];
    //     let point = end;
    //     // if (direction === 'backward') {
    //     //   dx = start[0] - end[0];
    //     //   dy = start[1] - end[1];
    //     //   point = start;
    //     // }
    //     const rotation = Math.atan2(dy, dx);
    //     // arrows
    //     styles.push(
    //       new ol.style.Style({
    //         geometry: new ol.geom.Point(point),
    //         image: new ol.style.Icon({
    //           src: 'resources/images/arrow.png',
    //           anchor: [0.75, 0.5],
    //           rotateWithView: true,
    //           rotation: -rotation,
    //         }),
    //       })
    //     );
    //   });

    //   return styles;
    // };

    // me.KSStreetLayer = new ol.layer.Vector({
    //   source: new ol.source.Vector({
    //     features: []
    //   }),
    //   style: KSLineArrowStyleFunction,
    //   // minResolution: 5,
    //   maxResolution: 20
    // });

    me.initLayers = function () {
      map.addLayer(me.citiesLayer);
      map.addLayer(me.cartCoveragesLayer);
      map.addLayer(me.coveragesLayer);
      map.addLayer(me.bufferLayer);
      map.addLayer(me.maskLayer);
      map.addLayer(me.replaceBufferLayer);
      map.addLayer(me.placeLayer);
      // map.addLayer(me.poiLayer);
      map.addLayer(me.replaceLayer);
      map.addLayer(me.facesLayer);
      map.addLayer(me.cartLayer);
      map.addLayer(me.selLayer);
      map.addLayer(me.radiusLayer);
      map.addLayer(me.focusLayer);
      // map.addLayer(me.KSPolygonLayer);
      // map.addLayer(me.KSHeatmapLayer);
      // map.addLayer(me.KSStreetLayer);
      map.addLayer(me.CityPolygonLayer);
      map.addLayer(me.CityHeatmapLayer);
    }

    var faceBeforePoi = function (angle, azimuth) {
      return (angle >= 0 && angle <= 90 &&
        azimuth >= (90 - angle) &&
        azimuth <= (270 - angle)
      ) ||
        (
          angle > 90 && angle < 270 &&
          (
            azimuth >= (450 - angle) ||
            azimuth <= (270 - angle)
          )
        ) ||
        (
          angle >= 270 && angle <= 360 &&
          azimuth <= (630 - angle) &&
          azimuth >= (450 - angle)
        );
    };

    var applyMapMask = function (store, layer) {
      var buffers = [],
        filtered = [],
        fObj = {};
      me.linksPoiToFace = {};
      me.linksFaceToBuffer = {};
      me.bufferLayer.getSource().forEachFeature(function (f) {
        if (f.getGeometry().getType() !== 'Point' && f.getGeometry().getType() !== 'LineString') {
          buffers.push({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: f.getGeometry().getCoordinates()
            },
            id: f.getId()
          });
        }
      });
      store.removeFilter('filterMapMask', true);
      var facesArr = store.getRange();
      if (buffers.length > 0) {
        facesArr.forEach((f) => {
          // console.log('f=>',f) //Якщо є конструкція з невірними коортинаами виникає помилка фільтрації 
          var fCoords = f.get('geometry').getCoordinates();
          buffers.forEach((poly) => {
            if (turf.booleanPointInPolygon(turf.point(fCoords), poly)) {
              if (!me.linksFaceToBuffer[f.getId()]) {
                me.linksFaceToBuffer[f.getId()] = {};
              }
              me.linksFaceToBuffer[f.getId()][poly.id] = poly.id;
            }
          });
        })
        facesArr = facesArr.filter((f) => !!me.linksFaceToBuffer[f.getId()]);
      }
      // add linksPoiToFace to prevent double calculation
      var pois = me.poiLayer.getSource().getFeatures();
      for (var i = 0; i < pois.length; i++) {
        p = pois[i];
        facesArr.filter((f) => me.linksFaceToBuffer[f.getId()] && me.linksFaceToBuffer[f.getId()][p.getId()]).forEach((f) => {
          var fCoords = f.get('geometry').getCoordinates(),
            fLonLat = ol.proj.toLonLat(fCoords),
            centroid = Bigmedia.Vars.getOlGeometryCentroid(p.getGeometry()),
            pLonLat = ol.proj.toLonLat(centroid.getCoordinates()),
            distance = turf.distance(fLonLat, pLonLat, { units: 'kilometers' }) * 1000;
          if (((p.getGeometry().getType() != 'Point') || distance <= me.getBuffer()) && (!me.getBeforePoi() || faceBeforePoi(f.get('angle'), turf.bearingToAzimuth(turf.bearing(fLonLat, pLonLat))))) {
            if (!me.linksPoiToFace[p.getId()]) {
              me.linksPoiToFace[p.getId()] = []
            }
            me.linksPoiToFace[p.getId()].push({
              id: f.getId(),
              id_size: f.get('id_size'),
              distance: distance,
              price: f.get('finalPrice'),
              ots: f.get('ots')
            })
            // fObj[f.getId()] = +f.getId();
            // filtered.push(f.getId());
          }
        })
      }

      store.addFilter(new Ext.util.Filter({
        id: 'filterMapMask',
        // property: 'id',
        // operator: 'in',
        // value: Object.values(fObj)
        filterFn: function (face) {
          var maximumFaces = me.getMaximumFaces();
          if (maximumFaces > 0) {
            var fTreeStore = Ext.getStore('FormatsTree'),
              lprTreeStore = Ext.getStore('LinkPoiRulesTree'),
              sizeWeights = {},
              weight = 0,
              format = fTreeStore.getRoot().firstChild;
            while (format) {
              sizeWeights[format.id_size] = weight;
              weight++;
              format = format.nextSibling;
            }
            var getSizeWeight = function (id_size) {
              return sizeWeights[id_size] || sizeWeights[-1];
            }
            try {
              Object.keys(me.linksPoiToFace).forEach((poiId) => {
                // var lpf = me.linksPoiToFace[poiId].filter( f => !clone.isItemFiltered(clone.getByKey(f.id)) );
                var lpf = me.linksPoiToFace[poiId];
                lpf.sort((a, z) => getSizeWeight(a.id_size) - getSizeWeight(z.id_size));
                var lpr = lprTreeStore.getRoot().lastChild;
                while (lpr) {
                  lpf.sort(lpr.get('sortFn'));
                  lpr = lpr.previousSibling;
                }
                me.linksPoiToFace[poiId] = lpf.slice(0, maximumFaces);
              });
            } catch (e) {
              console.log('error link faces to poi filter');
            } finally {
              // Ext.destroy(appliedFilters);
              // Ext.destroy(clone);
            }
          }
          // console.log(me.linksPoiToFace);
          Object.values(me.linksPoiToFace).forEach((lpf) => {
            lpf.forEach((f) => {
              fObj[f.id] = +f.id;
            });
          });
          return !!fObj[face.getId()]
        }
      }));


    }

    me.filterFaces = {
      refresh: function () {
        if (me.getGeoStore()) {
          applyMapMask(me.getGeoStore(), me.facesLayer);
        }
        if (me.getFilterCart() && me.getCartStore()) {
          applyMapMask(me.getCartStore(), me.cartLayer);
        }

      },
      setActive: function (active) {
        if (active) {
          this.refresh();
        } else {
          if (me.getGeoStore()) {
            me.getGeoStore().removeFilter('filterMapMask');
          }
          if (me.getFilterCart() && me.getCartStore()) {
            me.getCartStore().removeFilter('filterMapMask');
          }
        }
      },
      getActive: function () {
        return (me.getGeoStore() && !!me.getGeoStore().getFilters().get('filterMapMask')) || (me.getFilterCart() && me.getCartStore() && me.getCartStore().getFilters().get('filterMapMask'));
      }
    };

    me.resolutionFactor = function (point) {
      var resolutionAtEquator = map.getView().getResolution();
      var pointResolution = ol.proj.getPointResolution(map.getView().getProjection(), resolutionAtEquator, point, 'm');
      var resolutionFactor = resolutionAtEquator / pointResolution;
      return resolutionFactor;
    }

    me.replaceFace = {
      createRadius: function (bf) {
        var face = this.replaceFace,
          center = bf.getGeometry().getCenter(),
          coord = bf.getGeometry().getLastCoordinate(),
          line = new ol.geom.LineString([center, coord], 'XY'),
          radius = turf.distance(ol.proj.toLonLat(center), ol.proj.toLonLat(coord), { units: 'kilometers' }),
          text = radius < 1 ? (Math.round(radius * 1000) + 'm') : (Math.round(radius * 100) / 100 + 'km');
        var rf = new ol.Feature({
          geometry: line
        });
        rf.setStyle(new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#0500BD',
            width: 3
          }),
          text: new ol.style.Text({
            font: '12px Verdana',
            text: text,
            offsetY: -10,
            placement: 'line',
            textAlign: 'center',
            fill: new ol.style.Fill({
              color: '#0500BD'
            }),
            stroke: new ol.style.Stroke({
              color: '#FFFFFF',
              width: 2
            }),
          })
        }));
        radiusLayer.getSource().addFeature(rf);
      },
      create: function (id, radius) {
        var facesStore = me.getGeoStore() || (me.getGrid() ? me.getGrid().getStore() : null),
          cartStore = me.getCartStore() || (me.getCartGrid() ? getCartGrid().getStore() : null),
          replaceStore = me.getReplaceStore(),
          face, faces = [];
        if (!replaceStore) {
          return;
        }
        me.replaceLayer.setVisible(false);
        me.replaceBufferLayer.getSource().clear(true);
        replaceStore.holdReload = true;
        replaceStore.removeFilter('filterReplaceMapMask', true);
        face = (facesStore ? facesStore.getById(id) : null) || (cartStore ? cartStore.getById(id) : null);
        if (!face) {
          // console.log('no face for replace found');
          return;
        }
        this.faceId = id;
        this.replaceFace = face;
        me.reloadReplaceFaces();
        replaceStore.each(function (f) {
          if (!((facesStore && facesStore.getById(f.getId())) || (cartStore && cartStore.getById(f.getId())))) {
            faces.push({
              type: 'Feature',
              properties: {
                id: f.getId()
              },
              geometry: {
                type: 'Point',
                coordinates: f.get('geometry').getCoordinates()
              }
            });
          }
        });
        var olRadius = radius * me.resolutionFactor(face.get('geometry').getCoordinates());
        var olCircle = new ol.geom.Circle(face.get('geometry').getCoordinates(), olRadius, 'XY');
        var fBuffer = new ol.Feature({
          geometry: olCircle,
          properties: {
            id: face.getId()
          }
        });
        fBuffer.setId(face.getId());
        me.radiusLayer.getSource().clear(true);
        me.replaceBufferLayer.getSource().addFeature(fBuffer);
        me.replaceFace.createRadius(fBuffer);
        var buffers = [];
        me.replaceBufferLayer.getSource().forEachFeature(function (f) {
          var polygon = ol.geom.Polygon.fromCircle(f.getGeometry());
          buffers.push({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: polygon.getCoordinates()
            }
          });
        });
        var within = turf.within({
          "type": "FeatureCollection",
          "features": faces
        }, {
          "type": "FeatureCollection",
          "features": buffers
        }),
          filtered = within.features.map(function (f) {
            return f.properties.id;
          });

        replaceStore.addFilter(new Ext.util.Filter({
          property: 'id',
          id: 'filterReplaceMapMask',
          operator: 'in',
          value: filtered
        }));
        this.updateDeltas();
        replaceStore.holdReload = false;
        me.reloadReplaceFaces();
        this.setActive(true);
      },
      updateReplaceBuffer: function () {
        var facesStore = me.getGeoStore() || (me.getGrid() ? me.getGrid().getStore() : null),
          cartStore = me.getCartStore() || (me.getCartGrid() ? getCartGrid().getStore() : null),
          replaceStore = me.getReplaceStore(),
          face, faces = [];
        if (!replaceStore) {
          // console.log('no replaceStore received');
          return;
        }
        me.replaceLayer.setVisible(false);
        // this.setActive(false);
        // me.replaceBufferLayer.getSource().clear(true);
        // replaceStore.removeFilter('filterReplaceMapMask');
        var id = this.faceId;
        face = (facesStore ? facesStore.getById(id) : null) || (cartStore ? cartStore.getById(id) : null);
        if (!face) {
          // console.log('no face for replace found');
          return;
        }
        replaceStore.holdReload = true;
        replaceStore.removeFilter('filterReplaceMapMask', true);
        me.reloadReplaceFaces();
        replaceStore.each(function (f) {
          if (!((facesStore && facesStore.getById(f.getId())) || (cartStore && cartStore.getById(f.getId())))) {
            faces.push({
              type: 'Feature',
              properties: {
                id: f.getId()
              },
              geometry: {
                type: 'Point',
                coordinates: f.get('geometry').getCoordinates()
              }
            });
          }
        });
        var buffers = [];
        me.radiusLayer.getSource().clear(true);
        me.replaceBufferLayer.getSource().forEachFeature(function (f) {
          var polygon = ol.geom.Polygon.fromCircle(f.getGeometry());
          buffers.push({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: polygon.getCoordinates()
            }
          });
          me.replaceFace.createRadius(f);
        });
        var within = turf.within({
          "type": "FeatureCollection",
          "features": faces
        }, {
          "type": "FeatureCollection",
          "features": buffers
        }),
          filtered = within.features.map(function (f) {
            return f.properties.id;
          });

        replaceStore.addFilter(new Ext.util.Filter({
          property: 'id',
          id: 'filterReplaceMapMask',
          operator: 'in',
          value: filtered
        }));
        this.updateDeltas();
        replaceStore.holdReload = false;
        me.reloadReplaceFaces();
        me.replaceLayer.setVisible(true);
        // replaceStore.each(function(rec){
        //     rec.set('deltaGrp', (rec.get('grp') - face.get('grp') > 0 ? '+' : '') + (rec.get('grp') - face.get('grp')));
        // });
        // this.setActive(true);
      },
      updateDeltas: function () {
        var getDeltaText = function (delta) {
          if (!delta) return;
          return delta > 0 ? '<span style="color:red"><sup>+' + Math.round(delta * 100) / 100 + '</sup></span>' : '<span style="color:blue"><sub>' + Math.round(delta * 100) / 100 + '</sub></span>';
        }
        var face = this.replaceFace;
        me.getReplaceStore().each(function (rec) {
          var distance = turf.distance(ol.proj.toLonLat(rec.get('geometry').getCoordinates()), ol.proj.toLonLat(face.get('geometry').getCoordinates()), { units: 'kilometers' });
          distance = Math.round(distance * 1000);
          var deltaGrp = rec.get('grp') - face.get('grp'),
            deltaOts = rec.get('ots') - face.get('ots'),
            deltaPrice = rec.get('finalPrice') - face.get('finalPrice');
          rec.set({
            distance: distance,
            deltaGrp: getDeltaText(rec.get('grp') - face.get('grp')),
            deltaOts: getDeltaText(rec.get('ots') - face.get('ots')),
            deltaPrice: getDeltaText(rec.get('finalPrice') - face.get('finalPrice'))
          });
        });
      },
      setActive: function (active) {
        if (active) {
          me.replaceBufferLayer.setVisible(true);
          me.replaceLayer.setVisible(true);
          me.replaceMaskModify.setActive(true);
          // this.refresh();
        } else {
          me.replaceMaskModify.setActive(false);
          me.replaceBufferLayer.setVisible(false);
          me.replaceLayer.setVisible(false);
          me.radiusLayer.getSource().clear(true);
          me.replaceBufferLayer.getSource().clear(true);
          me.getReplaceStore().removeFilter('filterReplaceMapMask');
        }
      },
      getActive: function () {
        return !!me.getReplaceStore().getFilters().get('filterReplaceMapMask');
      }
    };

    me.replaceMaskModify = {
      init: function () {
        this.modify = new ol.interaction.Modify({
          source: me.replaceBufferLayer.getSource()
        });
        map.addInteraction(this.modify);
        this.setEvents();
      },
      setEvents: function () {
        this.modify.on('modifystart', function () {
          me.radiusLayer.setVisible(false);
          me.replaceLayer.setVisible(false);
        });
        this.modify.on('modifyend', function () {
          // me.replaceFace.updateReplaceBuffer();
          var fArray = me.replaceBufferLayer.getSource().getFeatures();
          if (fArray.length > 0) {
            var f = fArray[0];
            if (f.getGeometry().getType() === 'Circle') {
              var olRadius = f.getGeometry().getRadius();
              me.setReplaceBuffer(olRadius / me.resolutionFactor(f.getGeometry().getCenter()));
            }
          }
          me.radiusLayer.setVisible(true);
          me.replaceLayer.setVisible(true);
          me.fireEventArgs('replaceradiuschanged', [me.getReplaceBuffer()])
        });
      },
      setActive: function (active) {
        this.modify.setActive(active);
        // if (active) {
        //     me.maskDraw.setActive(false);
        // }
      }
    };

    me.replaceMaskModify.init();
  },

  updatePlace: function (coords) {
    var me = this;
    me.placeLayer.getSource().clear();
    if (coords) {
      var place = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coords))
      });
      me.placeLayer.getSource().addFeature(place);
      // me.map.getView().animate({center: place.getGeometry().getCoordinates()});
      me.showPlace();
    }
  },

  showPlace: function () {
    var me = this;
    var arr = me.placeLayer.getSource().getFeatures();
    if (arr && arr[0]) {
      if (me.map.getView().getZoom() < 15) {
        me.map.getView().animate({
          center: arr[0].getGeometry().getCoordinates(),
          zoom: 15
        });
      } else {
        me.map.getView().animate({ center: arr[0].getGeometry().getCoordinates() });
      }
    }
  }

});
