Ext.define('Bigmedia.view.dialog.DlgImportUserPOIController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dialog-dlgimportuserpoi',

    requires: [
      'Bigmedia.model.PoiManual'
    ],

    listen: {
        store: {
            '#PoisManual': {
                endupdate: function (store, record) {
                    var me = this,
                        vm = me.getView().getViewModel(),
                        store = vm.getStore('storePoiManual'),
                        readyToImport = 0;
                    store.each(function(rec){
                        if (rec.get('resultLat')) {
                            readyToImport++;
                        }
                    });
                    vm.set('readyToImport', readyToImport);
                }
            }
        }
    },

    init: function (view) {
        var vm = view.getViewModel(),
            store = vm.getStore('storePoiManual'),
            grid = view.lookup('gridpoi'),
            data = [];
        for (var i = 0; i < 1000; i++) {
            data.push({});
        }
        store.beginUpdate();
        store.add(data);
        store.endUpdate();
        var etc = view.etc['addressmix'],
            columns = etc.columns.concat(view.resultColumns);
        grid.reconfigure(columns);
    },

    onPreviewPOIClick: function (btn) {
        var me = this,
            vm = me.getView().getViewModel(),
            store = vm.getStore('storePoiManual'),
            inputVariant = vm.get('inputVariant'),
            language = Bigmedia.Locales.currentLocale;
        if (language === 'ukr') {
            language = 'uk'
        }
        // var geoServer = 'https://www.bigmedia.ua/client/geocoding/',
        var geoServer = 'https://script.bigmedia.ua/client/geocoding/',
            paramsSearch = '&format=geojson&accept-language=' + language + '&countrycodes=ua&addressdetails=1&polygon_geojson=1&polygon_threshold=0.001',
            paramsReverse = '&format=geojson&accept-language=' + language + '&countrycodes=ua&addressdetails=1&polygon_geojson=1',
            url,
            queryUrl = '/api/v1/geocoding/?language=' + language + '&address=';
        store.each(function(rec){
            url = '';
            if (inputVariant === 'addressmix' && rec.get('mixedAddress')) {
                url = queryUrl + encodeURIComponent(rec.get('mixedAddress')) + '&name=' + encodeURIComponent(rec.get('name'))
                // url = geoServer + 'search?q=' + encodeURIComponent(rec.get('mixedAddress')) + paramsSearch;
            } else if (inputVariant === 'latlon' && rec.get('lat') && rec.get('lon')) {
                var lat = rec.get('lat'),
                    lon = rec.get('lon');
                lat = lat.replace(/\,/, '.');
                lon = lon.replace(/\,/, '.');
                url = geoServer + 'reverse?lat=' + lat.toString() + '&lon=' + lon.toString() + paramsReverse;
            }
            if (url) {
              fetch(url)
                .then( response => response.json())
                .then( json => {
                  var newRec = {};
                  if (json.features) { //nominatim
                    newRec.resultGeometry = json.features[0].geometry;
                    newRec.resultStreet = json.features[0].properties.address.road;
                    newRec.resultCity = json.features[0].properties.address.city;
                    newRec.resultHousenumber = json.features[0].properties.address.house_number;
                    if (rec.get('name')) {
                      newRec.resultName = rec.get('name');
                    } else {
                      var nameArr = [];
                      if (newRec.resultCity) {
                        nameArr.push(newRec.resultCity)
                      }
                      if (newRec.resultStreet) {
                        nameArr.push(newRec.resultStreet);
                      }
                      if (newRec.resultHousenumber && newRec.resultStreet) {
                        nameArr.push(newRec.resultHousenumber);
                      }
                      if (nameArr.length > 0) {
                        newRec.resultName = nameArr.join(', ');
                      } else {
                        newRec.resultName = json.features[0].properties.display_name;
                      }
                    }
                    if (json.features[0].geometry) {
                      var centroid = turf.centroid(json.features[0].geometry);
                      newRec.resultLat = centroid.geometry.coordinates[1];
                      newRec.resultLon = centroid.geometry.coordinates[0];
                      newRec.resultLatLon = centroid.geometry.coordinates.reverse().join(', ');
                    }
                    // Bigmedia.Vars.convertTurfToOl(turf.centroid(json.features[0].geometry).geometry);
                  }
                  if (json.results) { //google
                    json.results[0].address_components.forEach(function(ac){
                      if(ac.types.some(function(t){return t === 'street_number'})) {
                        newRec.resultHousenumber = ac.long_name
                      } else if(ac.types.some(function(t){return t === 'route'})) {
                        newRec.resultStreet = ac.long_name
                      } else if(ac.types.some(function(t){return t === 'locality'})) {
                        newRec.resultCity = ac.long_name
                      }
                    });
                    if (rec.get('name')) {
                      newRec.resultName = rec.get('name');
                    } else {
                      var nameArr = [];
                      if (newRec.resultCity) {
                        nameArr.push(newRec.resultCity)
                      }
                      if (newRec.resultStreet) {
                        nameArr.push(newRec.resultStreet);
                      }
                      if (newRec.resultHousenumber && newRec.resultStreet) {
                        nameArr.push(newRec.resultHousenumber);
                      }
                      if (nameArr.length > 0) {
                        newRec.resultName = nameArr.join(', ');
                      } else {
                        newRec.resultName = json.results[0].formatted_address;
                      }
                    }
                    if (json.results[0].geometry) {
                      newRec.resultLat = json.results[0].geometry.location.lat;
                      newRec.resultLon = json.results[0].geometry.location.lng;
                      newRec.resultLatLon = newRec.resultLat + ', ' + newRec.resultLon;
                      var centroid = turf.point([newRec.resultLon, newRec.resultLat]);
                      newRec.resultGeometry = centroid;
                    }
                  }
                  rec.set(newRec);
                })
            }
        });
    },

    refreshData: function () {
        var me = this,
            vm = me.getView().getViewModel(),
            store = vm.getStore('storePoiManual');
        store.beginUpdate();
        store.removeAll();
        var recs = [];
        for(var i = 0; i < 1000; i++) {
            recs.push({});
        }
        store.add(recs);
        store.endUpdate();
    },

    onClearAllClick: function () {
        var me = this;
        me.refreshData();
    },

    reconfigureGrid: function (chb) {
        if (!chb.checked) {
            return;
        }
        var me = this,
            grid = me.lookup('gridpoi'),
            view = me.getView(),
            etc = view.etc[chb.inputValue],
            store = grid.getStore(),
            columns = etc.columns.concat(view.resultColumns);
        grid.reconfigure(columns);
    },

    createCommonStore: function () {
        var me = this,
            data = [];
        for (var i = 0; i < 1000; i++) {
            data.push({});
        }
        return new Ext.data.Store({
            model: Bigmedia.model.PoiManual,
            data: data
        });
    },

    onImportClick: function () {
        var me = this,
            view = me.getView(),
            store = view.getViewModel().getStore('storePoiManual'),
            pois = [];
        store.each(function(rec){
            if (rec.get('resultLat')) {
                pois.push(rec);
            }
        });
        view.fireEventArgs('importpoi', [pois]);
        view.close();
    },

    onShowView: function (view) {
    },

    onCloseWindowClick: function () {
        var me = this,
            view = me.getView();
        view.close();
    }
});
