Ext.define('Bigmedia.view.dialog.DlgFilterByNumberController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.dialog-dlgfilterbynumber',

  listen: {
    store: {
      '#storeManualFaces': {
        update: function (store, record, operation, modifiedFieldNames) {
          var me = this,
          vm = me.getView().getViewModel(),
          store = vm.getStore('storeManualFaces'),
          readyToImport = 0;
          if ((operation === Ext.data.Model.EDIT) && (modifiedFieldNames && modifiedFieldNames.indexOf('manualNo') >= 0) ) {
            if (modifiedFieldNames.indexOf('faceId') < 0 && record.get('faceId')) {
              record.set('faceId', null);
            }
            me.searchFace(record);
          }
          if (modifiedFieldNames.indexOf('supplierNo') >= 0) {
            store.each(function(rec){
              if (rec.get('supplierNo')) {
                readyToImport++;
              }
            });
            vm.set('readyToImport', readyToImport);
          }
        }
      }
    }
  },

  bindings: {
    onInputVariantChange: '{inputVariant}'
  },

  init: function (view) {
    var me = this,
    vm = view.getViewModel(),
    store = vm.getStore('storeManualFaces'),
    grid = view.lookup('gridfilterfaces'),
    manualNo = view.getManualNo(),
    inputVariant = view.getInputVariant(),
    data = [];
    me.callParent(view);
    if (inputVariant) {
      vm.set('inputVariant', inputVariant);
    }
    me.refreshData();
    if (manualNo) {
      manualNo.forEach((no, ix)=>{
        var rec = store.getAt(ix);
        if (!rec) {
          rec = store.add({})[0];
        }
        rec.set({
          manualNo: no[0],
          faceId: no[1]
        });
      })
    }
    var etc = view.etc;
    grid.reconfigure(etc.columns);
  },

  onInputVariantChange: function (newVal) {
    if (newVal) {
      this.searchFaces();
    }
  },

  onPreviewPOIClick: function (btn) {
    var me = this,
    vm = me.getView().getViewModel(),
    store = vm.getStore('storeManualFaces'),
    inputVariant = vm.get('inputVariant'),
    language = Bigmedia.Locales.currentLocale;
  },

  refreshData: function () {
    var me = this,
    vm = me.getView().getViewModel(),
    store = vm.getStore('storeManualFaces');
    store.beginUpdate();
    store.removeAll();
    var recs = [];
    for(var i = 0; i < 10000; i++) {
      recs.push({});
    }
    store.add(recs);
    store.endUpdate();
  },

  onClearAllClick: function () {
    var me = this;
    me.refreshData();
  },

  searchFaces: function () {
    var me = this,
      vm = me.getViewModel(),
      store = vm.getStore('storeManualFaces');
    store.each((rec)=>me.searchFace(rec));
  },

  searchFace: function (rec) {
    var me = this,
      vm = me.getViewModel(),
      inputVariant = vm.get('inputVariant'),
      fStore = Ext.getStore('Faces'),
      sStore = Ext.getStore('Sides'),
      mStore = vm.getStore('storeManualFaces');
    // mStore.each((rec)=>{
    if (!rec.get('manualNo')) {
      rec.set('faceId', null);
      return;
    }
    // var fSource = fStore.getData().getSource() || fStore.getData();
    var face, data, found = 0;
    var search = (inputVariant == 'supplierNo') ? rec.get('manualNo').toString() : +rec.get('manualNo');
    if (rec.get('faceId') && fStore.getById(rec.get('faceId'))) {
      var index = sStore.findBy((side)=>(side.get(inputVariant) == search && side.get('faceId') == rec.get('faceId')));
      if (index >= 0) {
        face = fStore.getAt(index);
      }
      if (face) {
        found++;
      }
    }
    if (!found) {
      var ix = sStore.findExact(inputVariant, search);
      while (ix >= 0) {
        var faceId = sStore.getAt(ix).get('faceId');
        face = fStore.getById(faceId);
        if (face) {
          data = {faceId: faceId};
        } else {
          data = {};
        }
        if (found === 0) {
          rec.set(data);
        } else {
          data.manualNo = rec.get('manualNo');
          mStore.insert(mStore.indexOf(rec) + 1, data);
        }
        found++;
        ix++;
        ix = sStore.findExact(inputVariant, search, ix);
      }
    }
    if (!found) {
      rec.set('faceId', null);
    }
    // });
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

  onFilterClick: function () {
    var me = this,
    view = me.getView(),
    vm = me.getViewModel(),
    store = vm.getStore('storeManualFaces'),
    inputVariant = vm.get('inputVariant'),
    faces = [];
    store.each(function(rec){
      if (rec.get('manualNo')) {
        faces.push(rec);
      }
    });
    view.fireEventArgs('createfilter', [faces, inputVariant]);
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
