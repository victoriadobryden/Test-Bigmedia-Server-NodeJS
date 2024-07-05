Ext.define('Bigmedia.view.map.MapView', {
  extend: 'Ext.panel.Panel',

  xtype: 'facesmapview',

  requires: [
    'Bigmedia.view.map.MapViewController',
    'Bigmedia.view.map.MapViewModel',
    'Bigmedia.view.map.Map',
    'Bigmedia.view.grid.Replaces',
    'Bigmedia.view.dialog.DlgReplaceGrid',
    'Bigmedia.view.dialog.DlgManagePOI',
    'Bigmedia.view.det.DetFace',
    'Bigmedia.store.SearchMapTiler',
    'Bigmedia.store.GoogleMapSearchHistory',
    'Bigmedia.component.GoogleMapSearchField',
    'Ext.layout.container.Absolute',
    'Ext.tree.Panel',
    'Ext.tip.ToolTip'
  ],

  controller: 'map-mapview',
  viewModel: {
    data: {
      replaceMode: false,
      toolbarPosition: 'top',
      replaceStore: null,
      showKSHitmap: false
      // showHeatmapBtn: false
      // buffer: 500,
      // beforepoi: false
    }
  },

  config: {
    toolbarPosition: 'top',
    toolbarHidden: false,
    geoStore: null,
    grid: null,
    gridMoitoring: null,
    cartStore: null,
    cartGrid: null,
    replaceStore: null,
    poiStore: null,
    faceAsCircleRes: 8,
    actions: {},
    filterCart: false,
    detFace: null,
    // KSPolygonsStore: null,
    CityPolygonStore: null,
    showHeatmapBtn: false,
    showKSHitmap: false
  },

  initComponent: function () {
    var me = this;
    me.dlgReplace = Ext.create('Bigmedia.view.dialog.DlgReplaceGrid', {
      listeners: {
        hide: function (dlg) {
          me.getViewModel().set('replaceMode', false);
          me.getMap().getViewModel().set('replaceMode', false);
          me.getMap().setReplaceFaceId(null);
        },
        recordselected: function (record) {
          me.getMap().popupFace(record);
        },
        radiuschanged: function (radius) {
          me.getMap().setReplaceBuffer(radius);
        },
        sourcechanged: function () {
          me.getMap().refreshReplaced();
        },
        addclick: function (face) {
          var faceId = me.getMap().getReplaceFaceId();
          if (me.getActions().add) {
            Ext.callback(me.getActions().add, me.getActions().scope, [face]);
          } else {
            var store = (me.getCartStore() || me.getCartGrid().getStore());
            try {
              if (store) {
                if (me.getReplaceStore()) {
                  me.getReplaceStore().remove(face);
                }
                store.add(face);
              }
            } catch (e) {
              console.log(e);
            } finally {
              me.getMap().refreshReplaced();
            }
          }
          // me.getMap().setReplaceFaceId(faceId);
          // me.getMap().popupFace(face);
          // me.getMap().refreshReplaced();
        },
        replaceclick: function (face, replaceFaceId) {
          if (me.getActions().replace) {
            Ext.callback(me.getActions().replace, me.getActions().scope, [face, replaceFaceId]);
          } else {
            var store = me.getCartStore() || (me.getCartGrid() ? me.getCartGrid().getStore() : null);
            if (store && store.getById(replaceFaceId)) {
              store.add(face);
              if (!me.getReplaceStore().getById(replaceFaceId)) {
                me.getReplaceStore().add(store.getById(replaceFaceId));
              }
              store.remove(store.getById(replaceFaceId));
            }
          }
          me.getMap().setReplaceFaceId(face.getId());
          me.getMap().popupFace(face);
          // me.getMap().refreshReplaced();
        }
      }
    });
    me.callParent();
    me.dlgReplace.setMapView(this);
  },
  updateShowKSHitmap: function(newVal){
    Bigmedia.Vars.updateShowKSHitmap(newVal);
  },
  updateShowHeatmapBtn: function (newVal) {
    this.getViewModel().set('showHeatmapBtn', newVal);
  },

  updateDetFace: function (newVal) {
    if (!newVal) {
      return
    }
    var me = this;
    me.getMap().setDetFace(newVal);
    newVal.setMap(me.getMap());
  },

  updateActions: function (newVal) {
    if (this.getMap()) {
      this.getMap().setActions(newVal);
    }
  },

  updateFilterCart: function (newVal) {
    var me = this,
      map = me.getMap();
    if (map) {
      // console.log('here');
      map.setFilterCart(newVal);
    } else {
      me.on({
        afterrender: {
          fn: function () {
            map = me.getMap();
            map.setFilterCart(newVal);
          },
          single: true,
          scope: me
        }
      });
    }
  },

  updateFaceAsCircleRes: function (newVal) {
    var me = this,
      map = me.getMap();
    if (map) {
      // console.log('here');
      map.setFaceAsCircleRes(newVal);
    } else {
      me.on({
        afterrender: {
          fn: function () {
            map = me.getMap();
            map.setFaceAsCircleRes(newVal);
          },
          single: true,
          scope: me
        }
      });
    }
  },

  deferTipShow: function (tip) {
    tip.show();
  },

  listeners: {
    afterrender: function () {
      var me = this;
      if (!me.getMap()) {
        return;
      }
      var mapEl = me.lookup('mapcontainer').getEl();
      mapEl.on('mousemove', function (e) {
        e = e.parentEvent.event;
        // console.log(e,e.target,e.srcElement);
        var target = e.target || e.srcElement,
          rect = target.getBoundingClientRect(),
          offsetX = e.clientX - rect.left,
          offsetY = e.clientY - rect.top;
        me.tipCoords = { x: Math.floor(offsetX), y: Math.floor(offsetY) };
        if (Bigmedia.Vars.getUser().get('orgId') !== 1) return;
        // console.log(Bigmedia.Vars.getUser().get('orgId') )
        if (me.tip && me.getViewModel().get('showKSHitmap')) {
          var tipData = me.getToolTipData(me.tipCoords);
        } else {
          return;
        }
        if (!me.getViewModel().get('showKSHitmap')) {
          me.tip.hide();
          return;
        }
        if (me.deferTipShowTimer) {
          Ext.undefer(me.deferTipShowTimer);
        }
        if (tipData.transit) {
          me.tip.update(tipData);
          me.deferTipShowTimer = Ext.defer(me.deferTipShow, 200, me, [me.tip]);
        } else {
          me.tip.hide();
        }
      });
      if (Bigmedia.Vars.getUser().get('orgId') === 1) {
        me.tip = Ext.create('Ext.tip.ToolTip', {
          target: 'mapcontainer',
          trackMouse: true,
          dismissDelay: 0,
          autoHide: false,
          // hideDelay: 0,
          showDelay: 500,
          // html: 'Some text',
          tpl: new Ext.XTemplate(
            '<div  style="font-size: .75rem">polygonId: {polygonId}</div>'
            // ,'<div style="font-size: .75rem">Transit All: {cnt_transit}</div>'
            // ,'<div style="font-size: .75rem">Transit Unique: {full_cnt_unique_transit}</div>'
            , '<div style="color: RED; font-size: .80rem">Transit Used in the report: {transit}</div>'
            // ,'<div>Transit avg: {cnt_avg_transit}</div>'
            // "<tpl if='loading'><div>Loading...</div>",
            // "<tpl else>",
            // '<div><b>F:</b> {fq}MHz</div>',
            // '<div><b>T:</b> {t}ms</div>',
            // '<div style="display: flex; align-items: center;"><div style="float: left;"><b>Mag:</b> {mag}' +  ' ({magPx}p)</div><div style="float: left; margin-left: 3px;width: 15px; height: 15px; border: 1px solid #555; background-color:#{c}"></div></div>',
            // "<tpl if='l'>",
            // "<hr>",
            // "<div><b>RxF:</b> {rFq}MHz</div><div><b>Bw:</b> {bw}MHz</div><div><b>P:</b> {p}" + " ({pPx}p)</div><div><b>Dur:</b> {lMs}ms ({lPx}px)</div>",
            // "<hr>",
            // "<div>{l}</div></tpl>",
            // "</tpl>"
          ),
          anchor: 'left',
          showOnTap: true,
          listeners: {
            beforeshow: function (tip, eOpts) {
              if (!me.getViewModel().get('showKSHitmap')) {
                return false;
              }
              var data = me.getToolTipData();
              if (data.transit) {
                tip.update(data);
              } else {
                return false;
              }
            }
          }
        });
      };
    }
  },

  getToolTipData: function (c) {
    var me = this,
      coords = c || me.tipCoords,
      map = me.getMap().map;
    var x = coords.x,
      y = coords.y,
      mapCoords = map.getCoordinateFromPixel([x, y]),
      pLonLat = ol.proj.toLonLat(mapCoords);
    var pRec;
    if (!me.getViewModel().get('showKSHitmap')) return

    let layers = me.getMap().getLayers();

    layers.forEach((layer) => {
      if (layer.get('name') === 'CityPolygon') {
        let data = layer.getSource().getFeatures();

        data.forEach((poly) => {
          var coords = poly.getGeometry().getCoordinates();
          if (mapCoords[0] >= coords[0][0][0] && mapCoords[0] <= coords[0][2][0] &&
            mapCoords[1] >= coords[0][0][1] && mapCoords[1] <= coords[0][2][1]) {
            pRec = Ext.getStore('CityPolygon').findRecord("id", poly.getId()).getData()
            // if(Bigmedia.Vars.getUser().get('Id')===1) 
            // console.log(pRec.idPolygon,pRec.transit)
            // console.log(poly.getId());
          }
        })
      }
    })
    //console.log(pLonLat,mapCoords);
    // var kspStore = Ext.getStore('KSPolygons');
    // var CityStore = Ext.getStore('CityPolygon');
    //CityPolygonStore
    // var pRec;
    // kspStore.each((rec) => {
    //   if (rec.get('lon1') <= pLonLat[0] && pLonLat[0] <= rec.get('lon2') && rec.get('lat1') <= pLonLat[1] && pLonLat[1] <= rec.get('lat2')) {
    //     pRec = rec;
    //     return false;
    //   }
    // })
    return {
      polygonId: pRec ? pRec.idPolygon : null,
      // cnt_transit: pRec ? Math.ceil(pRec.get('cnt_transit')) : null,
      // transit: pRec ? Math.ceil(pRec.get('transit')) : null,
      transit: pRec ? Math.ceil(pRec.transit) : null,
      // full_cnt_unique_transit: pRec ? Math.ceil(pRec.get('full_cnt_unique_transit')) : null
      // cnt_avg_transit: pRec ? pRec.get('cnt_avg_transit') : null
    };
  },

  refreshReplaceStore: function () {
    var me = this;
    // console.log('refreshReplaceStore');
    // console.log([me.copyReplaceStore, me.getReplaceStore()]);
    if (me.copyReplaceStore && me.getReplaceStore()) {
      me.copyReplaceStore.beginUpdate();
      me.copyReplaceStore.removeAll();
      var toAdd = [];
      me.getReplaceStore().each(function (rec) {
        var cloned = rec.clone();
        cloned.setId(rec.getId());
        cloned.set('inCart', false);
        toAdd.push(cloned);
      });
      me.copyReplaceStore.add(toAdd);
      me.copyReplaceStore.endUpdate();
    }
  },

  updateReplaceStore: function (newVal, oldVal) {
    var me = this,
      map = me.getMap();
    // console.log('updateReplaceStore: %o', newVal);
    if (oldVal && me.copyReplaceStore) {
      oldVal.un('refreshonmap', me.refreshReplaceStore);
      me.copyReplaceStore.destroy();
      me.copyReplaceStore = null;
    }
    if (newVal) {
      me.copyReplaceStore = new Ext.data.Store({
        model: 'Face',
        proxy: 'memory'
      });
      newVal.on('refreshonmap', me.refreshReplaceStore, me);
      me.refreshReplaceStore();
    }
    me.getViewModel().set('replaceStore', me.copyReplaceStore);
    me.dlgReplace.setReplaceStore(me.copyReplaceStore);
    if (newVal) {
      map.setReplaceStore(me.copyReplaceStore);
    }
  },

  updateToolbarHidden: function (newVal) {
    this.lookupViewModel().set('toolbarHidden', newVal);
  },

  updateToolbarPosition: function (newVal) {
    if (newVal) {
      // this.lookupViewModel().set('mapToolbarPosition', newVal);
      this.lookupViewModel().set('mapToolbarOnLeft', (newVal === 'left'));
      // this.lookupReference('maptoolbar').setDock(newVal);
    }
    this.lookupViewModel().set('toolbarPosition', newVal);
  },

  updateGeoStore: function (newVal, oldVal) {
    var me = this,
      map = me.getMap();
    if (newVal) {
      map.setGeoStore(newVal);
    }
  },
  updateKSPolygonsStore: function (newVal, oldVal) {
    var me = this,
      map = me.getMap();
    if (newVal) {
      map.setKSPolygonsStore(newVal);
      map.setKSStreetsStore(Ext.getStore('KSStreets'));
    }
  },
  updateCityPolygonStore: function (newVal, oldVal) {
    // console.log('CityPolygon Update')
    var me = this,
      map = me.getMap();
    if (newVal) {
      map.setCityPolygonStore(newVal);
      map.setCityPolygonStore(Ext.getStore('CityPolygon'));
    }
  },
  updatePoiStore: function (newVal, oldVal) {
    var me = this,
      map = me.getMap();
    // console.log(newVal);
    if (newVal) {
      // dmp.setPoiStore(newVal);
      map.setPoiStore(newVal);
      // me.dlgManagePOI.setPoiStore(newVal);
    }
  },
  updateGrid: function (newVal, oldVal) {
    var me = this,
      map = me.getMap();
    if (newVal) {
      map.setGrid(newVal);
    }
    // console.log('updateGrid',newVal);
  },
  updateCartStore: function (newVal, oldVal) {
    var me = this,
      map = me.getMap();
    if (newVal) {
      map.setCartStore(newVal);
      // console.log('updateCartStore',newVal);
    }
  },
  updateCartGrid: function (newVal, oldVal) {
    var me = this,
      map = me.getMap();
    if (newVal) {
      map.setCartGrid(newVal);
    }
  },

  recalcKSData: function () {

  },

  deferRefreshKSData: function () {
    var me = this;
    if (me.refreshKSDataTimer) {
      Ext.undefer(me.refreshKSDataTimer);
    }
    me.refreshKSDataTimer = Ext.defer(me.refreshKSData, 800, me);
  },
  deferRefreshOTSData: function () {
    var me = this;
    map = me.getMap();
    if (me.refreshKSDataTimer) {
      Ext.undefer(me.refreshKSDataTimer);
    }
    me.refreshKSDataTimer = Ext.defer(me.recalcOTSData, 800, me);
  },
  refreshKSData: function () {
    var me = this,
      tPanel = me.lookup('treepanel');
    var records = tPanel.getChecked();
    var data = {
      daysOfWeek: [],
      hours: [],
      groups: [],
      sex: [],
      types: [],
      version: []
    }
    var ages = [], levels = [], columns = [];
    Ext.Array.each(records, function (rec) {
      if (data[rec.get('group')]) {
        data[rec.get('group')].push(rec.get('code'))
      } else {
        if (rec.get('group') == 'age') {
          ages.push(rec.get('code'))
        }
        if (rec.get('group') == 'incomeLevel') {
          levels.push(rec.get('code'))
        }
        if (rec.get('group') == 'columns') {
          columns.push(rec.get('code'));
        }
      }
    });

    ages.forEach((a) => {
      levels.forEach((l, i) => {
        data.groups.push(a + ' ' + l);
      });
    });
    var dc = (+ new Date()).toString();
    fetch('/api/v1/heatmap?_dc=' + dc, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
      .then(response => response.json())
      .then(data => {
        var kspStore = Ext.getStore('KSPolygons');
        kspStore.beginUpdate();
        Ext.suspendLayouts();
        kspStore.suspendEvents();
        kspStore.removeAll();
        try {
          var bytes = CryptoJS.Rabbit.decrypt(data, dc + 'yQeKcGT1ydcKvHXbedkQ');
          decrypted = bytes.toString(CryptoJS.enc.Utf8);
          // console.log(decrypted);
          // return JSON.parse(decrypted);
          var json = JSON.parse(decrypted);
          json.forEach(row => {
            var rec = kspStore.getById(row.id);
            if (rec) {
              rec.set({
                // cnt_transit_male: row.cnt_transit_male,
                // cnt_transit_female: row.cnt_transit_female,
                cnt_transit: row.full_cnt_transit,
                transit: row.transit,
                full_cnt_unique_transit: row.full_cnt_unique_transit
              });
            } else {
              kspStore.add(row);
            }
          })
        } catch (e) {
          // some
          console.error(e);
        } finally {
          kspStore.resumeEvents();
          Ext.resumeLayouts(true);
          kspStore.endUpdate();
          kspStore.fireEvent('endupdate');
        }
      });

    fetch('/api/v1/heatmap/streets?_dc=' + dc, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      // body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
      .then(response => response.json())
      .then(data => {
        var kssStore = Ext.getStore('KSStreets');
        kssStore.beginUpdate();
        Ext.suspendLayouts();
        kssStore.suspendEvents();
        kssStore.removeAll();
        try {
          data.forEach(row => {
            row.geometry = JSON.parse(row.geometry);
            kssStore.add(row);
          })
        } catch (e) {
          // some
          console.error(e);
        } finally {
          kssStore.resumeEvents();
          Ext.resumeLayouts(true);
          kssStore.endUpdate();
          kssStore.fireEvent('endupdate');
        }
      });
  },

  loadMapPolygonsData: function (prop) {
    let dc = (+ new Date()).toString(),
      me = this;
    var CityPolygonStore = Ext.getStore('CityPolygon');
    if (CityPolygonStore.getData().length != 0) {
      me.recalcMapTransitData(prop);
      return;
    };
    fetch('/api/v1/heatinfoots/polygons?_dc=' + dc, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(prop) // body data type must match "Content-Type" header
    })
      .then(response => response.json())
      .then(data => {
        CityPolygonStore.beginUpdate();
        Ext.suspendLayouts();
        CityPolygonStore.suspendEvents();
        CityPolygonStore.removeAll();
        try {
          var bytes = CryptoJS.Rabbit.decrypt(data, dc + 'j8Z5f644XYePh4g7sEfE');
          decrypted = bytes.toString(CryptoJS.enc.Utf8);
          var json = JSON.parse(decrypted);
          // console.log(json);
          json.forEach(row => {
            // console.log(row);
            CityPolygonStore.add(row);
          })
        } catch (e) {
          // some
          console.log(e);
        } finally {
          CityPolygonStore.resumeEvents();
          Ext.resumeLayouts(true);
          CityPolygonStore.endUpdate();
          CityPolygonStore.fireEvent('endupdate');
          me.recalcMapTransitData(prop);
        }
      });
  },
  recalcMapTransitData: function (prop) {
    let dc = (+ new Date()).toString(),
      me = this;
    fetch('/api/v1/heatinfoots/traff?_dc=' + dc, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(prop) // body data type must match "Content-Type" header
    })
      .then(response => response.json())
      .then(data => {
        var CityPolygonStore = Ext.getStore('CityPolygon');
        CityPolygonStore.beginUpdate();
        Ext.suspendLayouts();
        CityPolygonStore.suspendEvents();
        try {
          var bytes = CryptoJS.Rabbit.decrypt(data, dc + 'j8Z5f644XYePh4g7sEfE');
          decrypted = bytes.toString(CryptoJS.enc.Utf8);
          var json = JSON.parse(decrypted);
          json.forEach(row => {
            var rec = CityPolygonStore.getData().getByKey(id = row.id);
            if (rec) {
              rec.set({ transit: row.transit });
              rec.set({ weight: row.weight });
            }
          })
        } catch (e) {
          console.log(e);
        } finally {
          CityPolygonStore.resumeEvents();
          Ext.resumeLayouts(true);
          CityPolygonStore.endUpdate();
          CityPolygonStore.fireEvent('endupdate');
          me.recalcTableOTSSData(prop);
        }
      })
  },

  recalcMapsOTSSData: function (data) {
    let dc = (+ new Date()).toString();
    fetch('/api/v1/heatinfoots/map?_dc=' + dc, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
      .then(response => response.json())
      .then(data => {
        console.log('recalcMapsOTSSData', prop);
        //var kspStore = Ext.getStore('KSPolygons');
        var CityPolygonStore = Ext.getStore('CityPolygon');
        //console.log('CityPolygonStore=>',CityPolygonStore)
        CityPolygonStore.beginUpdate();
        Ext.suspendLayouts();
        CityPolygonStore.suspendEvents();
        CityPolygonStore.removeAll();
        // kspStore.beginUpdate();
        // Ext.suspendLayouts();
        // kspStore.suspendEvents();
        // kspStore.removeAll();
        try {
          var bytes = CryptoJS.Rabbit.decrypt(data, dc + 'j8Z5f644XYePh4g7sEfE');
          decrypted = bytes.toString(CryptoJS.enc.Utf8);
          var json = JSON.parse(decrypted);
          // console.log(json);
          json.forEach(row => {
            //console.log(row);
            CityPolygonStore.add(row);
            // var rec = kspStore.getById(row.id);
            //   if (rec) { 
            //     // rec.set({cnt_avg_transit: row.cnt_unique_transit});
            //     rec.set({full_cnt_unique_transit: row.full_cnt_unique_transit});
            //     rec.set({cnt_transit: row.cnt_transit});
            //     rec.set({transit: row.transit});
            //   } else {
            //     kspStore.add(row);
            //   }
          })
        } catch (e) {
          // some
          console.log(e);
        } finally {
          CityPolygonStore.resumeEvents();
          Ext.resumeLayouts(true);
          CityPolygonStore.endUpdate();
          CityPolygonStore.fireEvent('endupdate');
          // kspStore.resumeEvents();
          // Ext.resumeLayouts(true);
          // kspStore.endUpdate();
          // kspStore.fireEvent('endupdate');
        }
      });
  },
  recalcTableOTSSData: function (prop) {
    var dc = (+ new Date()).toString(),
      me = this;
    map = this.getMap();
    fetch('/api/v1/heatinfoots?_dc=' + dc, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(prop) // body data type must match "Content-Type" header
    })
      .then(response => response.json())
      .then(data => {
        // console.log('recalcTableOTSSData',prop)
        var fStore = Ext.getStore('Faces'),
            CartStore = me.getViewModel().get('curCamp.proposals');
        if (CartStore) {
          CartStore.beginUpdate();
          CartStore.suspendEvents();
        }
        fStore.beginUpdate();
        Ext.suspendLayouts();
        fStore.suspendEvents();
        try {
          var bytes = CryptoJS.Rabbit.decrypt(data, dc + 'j8Z5f644XYePh4g7sEfE');
          decrypted = bytes.toString(CryptoJS.enc.Utf8);
          var json = JSON.parse(decrypted);
          
          if (CartStore) {
            // me.getViewModel().get('curCamp.proposals')
            CartStore.each(function (record) {
              var recData = record.getData(),
                rec = json.find(el => el.idFace == recData.faceId)
              console.log(recData.faceId,rec );
              if (typeof rec !== 'undefined') {
                record.set('ksOTS', rec.ots);
                record.set('ksGRP', rec.grp);
                record.set('ksTRP', rec.trp);
                record.set('useKSData', true);

              } else {
                record.set('ksOTS', 0);
                record.set('ksGRP', 0);
                record.set('ksTRP', 0);
                record.set('useKSData', false);
              }
            });
          }

          json.forEach(row => {
            var rec = fStore.getById(row.idFace);
            if (rec) {
              rec.set('ksOTS', row.ots);
              rec.set('ksGRP', row.grp);
              rec.set('ksTRP', row.trp);
              rec.set('useKSData', true);
            }
          })
        } catch (e) {
          // some
          console.log(e);
        } finally {
          if (CartStore) {
            CartStore.resumeEvents();
            CartStore.endUpdate();
          }
          fStore.resumeEvents();
          Ext.resumeLayouts(true);
          fStore.endUpdate();
          // console.log(fStore);
        }
      });
  },
  setNullFilter: function () {
    var filter = [],
      me = this,
      Faces = Ext.getStore('Faces');
    filter.push(new Ext.util.Filter({ id: 'ks_fm_city', property: 'city', operator: 'in', value: [
      Ext.getStore('Cities').getById(1).data.name, 
      Ext.getStore('Cities').getById(4).data.name, 
      Ext.getStore('Cities').getById(5).data.name,
      Ext.getStore('Cities').getById(12).data.name,
      Ext.getStore('Cities').getById(24).data.name
    ]}));
    // console.log(Bigmedia.Vars.getUser().get('clientType'),Bigmedia.Vars.getUser().get('showHeatmap'));
    if (
      (Bigmedia.Vars.getUser().get('orgId') !== 1) &&
      (!(Bigmedia.Vars.getUser().get('clientType') === 474 && Bigmedia.Vars.getUser().get('showHeatmap')))
    ) {
      // console.log(Bigmedia.Vars.getUser().get('clientType')===474,Bigmedia.Vars.getUser().get('showHeatmap'));
      filter.push(new Ext.util.Filter({ id: 'ks_fm_supplier', property: 'supplier', operator: 'in', value: ['BIGMEDIA'] }));
    };
    // console.log(Bigmedia.Vars.getUser().get('clientType')===474,Bigmedia.Vars.getUser().get('showHeatmap'));
    Faces.addFilter(filter);

    Faces.beginUpdate();
    Ext.suspendLayouts();
    Faces.suspendEvents();
    Faces.each(function (rec) {
      rec.set('ksOTS', 0);
      rec.set('ksGRP', 0);
      rec.set('ksTRP', 0);
      rec.set('useKSData', false);
    });
    Faces.resumeEvents();
    Ext.resumeLayouts(true);
    Faces.endUpdate();
  },
  filterOTSData: function () {
    var me = this;
        // view = me.up('facesmapview');
    me.setNullFilter();
    if (Ext.getStore('KSPolygons').getCount() === 0 &&  me.getViewModel().get('showKSHitmap') ) {
      me.recalcOTSData();
    }
  },
  recalcOTSData: function () {
    var me = this,
      tPanel = me.lookup('treepanel');
    //console.log(tPanel);
    var records = tPanel.getChecked();
    var data = {
      ages: [],
      groups: [],
      sex: [],
      daysOfWeek: []
    }
    Ext.Array.each(records, function (rec) {
      if (data[rec.get('group')]) {
        data[rec.get('group')].push(rec.get('code'))
      } else {
        if (rec.get('group') == 'age') {
          data['ages'].push(rec.get('code'))
        }
        if (rec.get('group') == 'incomeLevel') {
          data['groups'].push(rec.get('code'))
        }
      }
    });
    //console.log(data);
    if (
      data['ages'].length != 0 && data['groups'].length != 0 &&
      data['sex'].length != 0 && data['daysOfWeek'].length != 0) {
      me.loadMapPolygonsData(data);
    }
    else {
      me.setNullFilter();
    }
  },
  // layout: 'fit',
  layout: 'border',
  minWidth: 300,

  dockedItems: [
    {
      xtype: 'toolbar',
      dock: 'top',
      bind: {
        hidden: '{toolbarHidden || mapToolbarOnLeft}'
      },
      vertical: false,
      cls: 'map-toolbar',
      overflowHandler: 'scroller',
      items: [
        {
          xtype: 'button',
          // text: 'Select',
          iconCls: 'x-fa fa-mouse-pointer',
          toggleGroup: 'maskActions',
          handler: 'onMaskSelect',
          pressed: true,
          tooltip: 'Select mode'
        }, {
          xtype: 'button',
          // text: 'Create',
          iconCls: 'x-fa fa-pencil-alt',
          toggleGroup: 'maskActions',
          tooltip: 'Draw mode',
          menu: {
            plain: true,
            items: [
              {
                iconCls: 'x-fa fa-map-marker',
                text: Bigmedia.Locales.mapViewPointText,
                handler: 'onCreatePoint',
                tooltip: 'Draw point'
              },
              {
                iconCls: 'x-fa fa-route',
                text: Bigmedia.Locales.mapViewRouteText,
                handler: 'onCreateLine',
                tooltip: 'Draw line'
              },
              {
                iconCls: 'x-fa fa-draw-polygon',
                text: Bigmedia.Locales.mapViewPolygonText,
                handler: 'onCreatePolygon',
                tooltip: 'Draw polygon'
              },
              {
                iconCls: 'x-fa fa-circle',
                text: Bigmedia.Locales.mapViewCircleText,
                handler: 'onCreateCircle',
                tooltip: 'Draw circle'
              }
            ]
          }
        }, {
          xtype: 'button',
          enableToggle: true,
          // text: 'Edit',
          iconCls: 'x-fa fa-arrows-alt',
          toggleGroup: 'maskActions',
          handler: 'onMaskEdit',
          tooltip: 'Edit mode'
        }, {
          xtype: 'button',
          iconCls: 'x-fa fa-eraser',
          // text: 'Clear',
          handler: 'onMaskClear',
          hidden: true,
          tooltip: 'Remove all drawings'
        }, {
          xtype: 'splitbutton',
          iconCls: 'x-fa fa-filter',
          enableToggle: true,
          tooltip: 'Apply filter',
          bind: {
            pressed: '{filterPoi}'
          },
          menu: {
            plain: true,
            items: [{
              xtype: 'container',
              layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
              },
              items: [
                {
                  xtype: 'slider',
                  fieldLabel: Bigmedia.Locales.mapViewBufferText,
                  padding: 10,
                  width: 350,
                  bind: '{buffer}',
                  increment: 10,
                  minValue: 0,
                  maxValue: 1500
                }, {
                  xtype: 'numberfield',
                  width: 50,
                  minValue: 0,
                  maxValue: 1500,
                  step: 100,
                  value: 500,
                  hideTrigger: true,
                  bind: '{buffer}'
                }, {
                  xtype: 'checkbox',
                  // width: 50,
                  hideLabel: true,
                  bind: {
                    value: '{beforepoi}'
                  },
                  padding: 10,
                  boxLabel: 'перед об\'єктом'
                }
              ]
            }]
          }
        },
        {
          xtype: 'button',
          iconCls: 'x-fa fa-restroom',
          enableToggle: true,
          tooltip: 'Показати розподілення Аудиторії',
          hidden: true,
          bind: {
            // hidden: '{user.id != 1 && user.id != 2356 && user.id != 14716 && user.id != 14714 && user.id != 13177 && user.id != 9170 && user.id != 578 && user.id != 3541 && user.id != 3534 && user.id != 693}',
            //user.orgId != 1 && !userLoggedIn && 
            // hidden: '{ !userLoggedIn && user.showHeatmap!==true }',
            hidden: '{ !user.showHeatmap }',
            pressed: '{showKSHitmap}',
          },
          // handler: 'onbtnOTSHitmap',
          listeners: {
            click: function (btn) {
              //var dlg = Ext.create('Bigmedia.view.dialog.DlgOTSData');
              //dlg.show();
              var view = this.up('facesmapview');
              this.up('facesmapview').updateShowKSHitmap(view.getViewModel().get('showKSHitmap'));
              // if (Ext.getStore('KSPolygons').getCount() === 0) {
              //   //btn.up('facesmapview').refreshKSData();
              //   btn.up('facesmapview').recalcOTSData();
              // }
              btn.up('facesmapview').filterOTSData();
              if (!view.getViewModel().get('showKSHitmap')) {
                Ext.getStore('Faces').filters.removeAtKey('ks_fm_city');
                Ext.getStore('Faces').filters.removeAtKey('ks_fm_supplier');
                var data = { ages: [], groups: [], sex: [], daysOfWeek: [], doors: true };
                btn.up('facesmapview').recalcTableOTSSData(data);
              }
            }
          }
        }
      ]
    },
    {
      dock: 'right',
      xtype: 'treepanel',
      reference: 'treepanel',
      hidden: true,
      bind: {
        hidden: '{!showKSHitmap}',
      },
      checkPropagation: 'both',
      rootVisible: false,
      width: 160,
      // store: (Bigmedia.Vars.getUser() && Bigmedia.Vars.getUser().get('orgId') === 1) ? 'OTSParamsTreeClient' : 'OTSParamsTree',
      // store: 'OTSParamsTreeClient',
      store: 'OTSParamsTree',
      //store: 'KSParamsTree',
      listeners: {
        checkchange: function (node, checked) {
          var view = this.up('facesmapview');
          //console.log(view);
          view.deferRefreshOTSData();
          //view.deferRefreshKSData();
        }
      }
    }
  ],


  items: [
    {
      xtype: 'panel',
      reference: 'mapcontainer',
      id: 'mapcontainer',
      // layout: 'fit',
      layout: 'absolute',
      region: 'center',
      items: [
        {
          xtype: 'facesmap',
          reference: 'facesmap',
          anchor: '100% 100%',
          minWidth: 100,
          listeners: {
            replacemodechanged: function (status) {
              var view = this.up('facesmapview');
              view.getViewModel().set('replaceMode', status);
              view.dlgReplace.setVisible(status);
            },
            overlayclosed: function () {
              // var view = this.up('facesmapview'),
              //     panel = view.lookup('replacepanel');
              // panel.collapse();
            },
            replaceradiuschanged: function (radius) {
              var view = this.up('facesmapview');
              view.dlgReplace.getViewModel().set('replaceRadius', radius);
            },
            replacefaceidchanged: function (faceId) {
              var view = this.up('facesmapview');
              view.dlgReplace.getViewModel().set('replaceFaceId', faceId);
            }
          }
        },
        {
          xtype: 'googlemapsearchfield',
          store: 'GoogleMapSearchHistory',
          // xtype: 'searchfield',
          anchor: '100%',
          padding: '10px 40px 0 40px',
          reference: 'searchmap',
          bind: {
            hidden: '{!userLoggedIn}'
          },
          listeners: {
            clearplace: 'onClearGooglePlace',
            selectplace: 'onSelectGooglePlace',
            focus: 'onFocusGooglePlace'
          }
          // triggers: {
          //   clear: {
          //     cls: 'x-fa fa-times',
          //     hidden: true,
          //     weight: 0
          //   },
          //   search: {
          //     cls: 'x-fa fa-search-location',
          //     weight: 1
          //   },
          //   picker: {
          //     hidden: true
          //     // handler: 'onTriggerClick',
          //     // scope: 'this',
          //     // focusOnMousedown: true
          //   }
          // },
        }
      ],
      listeners: {
        render: function (panel) {
          panel.down('textfield').show();
        }
      }
    }

    // ,
    // {
    //     xtype: 'dlgmanagepoi',
    //     reference: 'dlgmanagepoi',
    //     listeners: {
    //         recordselected: function (record) {
    //             var me = this,
    //                 mv = me.up('facesmapview');
    //             mv.getMap().hintPoi(record);
    //         }
    //     }
    // }
    // ,
    // {
    //     xtype: 'detface',
    //     reference: 'detface',
    //     title: 'Face #',
    //     closeAction: 'hide',
    //     // Force the Window to be within its parent
    //     // constrain: true,
    //     // hidden: true,
    //     // autoShow: true,
    //     // alwaysOnTop: true,
    //     x: 0,
    //     y: 0,
    //     width: 300,
    //     heigth: 250,
    //     closable: true
    // }
    // ,
    // {
    //     xtype: 'panel',
    //     bind: {
    //         region: '{toolbarPosition === "top" ? "south" : "east"}',
    //         collapsed: '{!replaceMode}'
    //         // hidden: '{!replaceMode}'
    //         // header: '{!replaceMode}'
    //     },
    //     // hidden: true,
    //     // header: false,
    //     reference: 'replacepanel',
    //     split: true,
    //     layout: 'fit',
    //     // title: 'Replace offer',
    //     region: 'south',
    //     width: 200,
    //     minWidth: 200,
    //     collapsible: true,
    //     // collapsed: true,
    //     height: 200,
    //     minHeight: 200,
    //     items: [
    //         {
    //             xtype: 'replaces-grid',
    //             bind: '{replaceStore}',
    //             listeners: {
    //                 radiuschanged: function (radius) {
    //                     var view = this.up('facesmapview');
    //                     view.getMap().setReplaceBuffer(radius);
    //                 }
    //             }
    //         }
    //     ],
    //     listeners: {
    //         beforeexpand: function (panel) {
    //             var view = panel.up('facesmapview');
    //             return !!(view.getMap().popupOverlay.getPosition() && view.getReplaceStore());
    //         },
    //         expand: function (panel) {
    //             var view = panel.up('facesmapview');
    //             view.getViewModel().set('replaceMode', true);
    //             view.getMap().getViewModel().set('replaceMode', true);
    //             view.getMap().setReplaceFaceId(view.getMap().popup.getRecord().getId());
    //         },
    //         collapse: function (panel) {
    //             var view = panel.up('facesmapview');
    //             view.getViewModel().set('replaceMode', false);
    //             view.getMap().getViewModel().set('replaceMode', false);
    //             view.getMap().setReplaceFaceId(null);
    //         }
    //     }
    // }
  ],

  getMap: function () {
    return this.lookupReference('facesmap');
  }
});
