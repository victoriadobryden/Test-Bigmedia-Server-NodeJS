Ext.define('Bigmedia.component.GoogleMapSearchField', {
  extend: 'Ext.form.field.Text',
  alias: ['widget.googlemapsearchfield'],

  // labelCls: 'x-fa fa-search-location',
  emptyText: 'Пошук адреси',

  triggers: {
    clear: {
      weight: 1,
      cls: Ext.baseCSSPrefix + 'form-clear-trigger',
      hidden: true,
      handler: 'onClearClick',
      scope: 'this'
    },
    search: {
      weight: 2,
      cls: 'x-fa fa-search-location',
      // handler: 'onSearchClick',
      scope: 'this'
    },
    add: {
      weight: 3,
      cls: 'x-fa fa-plus-circle',
      handler: 'onPlusClick',
      hidden: true,
      scope: 'this'
    }
  },

  onPlusClick: function () {
    var me = this,
      vm = me.up('facesmapview').lookupViewModel(),
      poiStore = vm.get('pois'),
      place = me.googlePlace;
    var addrComponents = place.address_components,
      cityComponent = addrComponents ? addrComponents.find((a) => a.types.indexOf('locality') >= 0 && a.types.indexOf('political') >= 0) : null,
      city,
      streetComponent = addrComponents ? addrComponents.find((a) => a.types.indexOf('street_number') >= 0) : null,
      houseNumber, names = [];
    if (cityComponent) {
      city = cityComponent.short_name || cityComponent.long_name;
      if(city) {
        names.push(city);
      }
    }
    if (streetComponent) {
      houseNumber = streetComponent.long_name || streetComponent.short_name;
    }
    names.push(place.name);
    poiStore.add({
        name: names.join(', '),
        geometry: new ol.geom.Point(ol.proj.fromLonLat([place.geometry.location.lng(), place.geometry.location.lat()])),
        lat: place.geometry.location.lat(),
        lon: place.geometry.location.lng(),
        city: city,
        address: place.formatted_address,
        housenumber: houseNumber,
        centroid: new ol.geom.Point(ol.proj.fromLonLat([place.geometry.location.lng(), place.geometry.location.lat()]))
    });
    me.getTrigger('add').hide();
  },

  onClearClick: function() {
    var me = this;
    me.setValue('');
  },

  listeners: {
    change: function (edit, newVal) {
      var me = this;
      if (!edit.getValue()) {
        edit.getTrigger('clear').hide();
        edit.fireEvent('clearplace');
        edit.getTrigger('add').hide();
      } else {
        edit.getTrigger('clear').show();
      }
      // edit.updateLayout();
    },
    afterrender: function (edit) {
      var me = this;
      const searchBox = new google.maps.places.SearchBox(edit.getEl().dom.querySelector("input"));
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
          console.log('no places found');
          me.googlePlace = null;
          return;
        }
        // const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
          if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
          }
          me.googlePlace = place;
          var vm = me.up('facesmapview').lookupViewModel();
          var poiStore = vm.get('pois');
          if (poiStore.getDataSource().findBy((poi) => poi.get('lon') === place.geometry.location.lng() && poi.get('lat') === place.geometry.location.lat())) {
            edit.getTrigger('add').hide();
          } else {
            edit.getTrigger('add').show();
          }
          // console.log([place.geometry.location.lng(),place.geometry.location.lat()]);
          // const icon = {
          //   url: place.icon,
          //   size: new google.maps.Size(71, 71),
          //   origin: new google.maps.Point(0, 0),
          //   anchor: new google.maps.Point(17, 34),
          //   scaledSize: new google.maps.Size(25, 25),
          // };
          // Create a marker for each place.
          // markers.push(
          //   new google.maps.Marker({
          //     map,
          //     icon,
          //     title: place.name,
          //     position: place.geometry.location,
          //   })
          // );
          //
          // if (place.geometry.viewport) {
          //   // Only geocodes have viewport.
          //   bounds.union(place.geometry.viewport);
          // } else {
          //   bounds.extend(place.geometry.location);
          // }
        });
        edit.fireEventArgs('selectplace', [me.googlePlace]);
        // map.fitBounds(bounds);
      });
    }
  }
});
