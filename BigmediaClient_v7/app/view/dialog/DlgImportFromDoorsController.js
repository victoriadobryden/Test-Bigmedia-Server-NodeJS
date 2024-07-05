Ext.define('Bigmedia.view.dialog.DlgImportFromDoorsController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.dialog-dlgimportfromdoors',

  listen: {
    store: {
      '#storeDoorsFaces': {
        datachanged: function (store) {
          var me = this;
          if (me.searchingDoorsData) {
            return;
          }
        //   if (me.deferedRecalc) {
          Ext.undefer(me.deferedRecalc);
        //     me.deferedRecalc = null;
        //   }
          me.deferedRecalc = Ext.defer(me.recalcTotals, 500, me);
        },
        update: function (store, record, operation, modifiedFieldNames) {
          var me = this;
          if (me.searchingDoorsData) {
            return;
          }
          // if (me.deferedLoadFromDoors) {
            Ext.undefer(me.deferedLoadFromDoors);
          //   me.deferedLoadFromDoors = null;
          // }
          if ((operation === Ext.data.Model.EDIT) && (modifiedFieldNames && modifiedFieldNames.indexOf('doorsNo') >= 0) ) {
            // if (me.loadMask) {
            //   me.loadMask.show();
            // }
            me.recBuffer[record.getId()] = record;
          }
          me.deferedLoadFromDoors = Ext.defer(me.searchDoorsData, 500, me);
        }
      }
    }
  },

  bindings: {
    onInputVariantChange: '{inputVariant}'
  },

  loadFromServerPromise: function (dixes) {
    return fetch('/api/v1/thirdparty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({dixes: dixes})
    }).then((response) => response.json())
  },

  searchDoorsData: function () {
    var me = this,
      store = me.getViewModel().getStore('storeDoorsFaces'),
      fSource = Ext.getStore('Faces').getDataSource();
    me.deferedLoadFromDoors = null;
    var dixes = [];
    me.searchingDoorsData = true;
    var recsToSearch = Object.values(me.recBuffer);
    if (!recsToSearch.length) {
      return;
    }
    me.loadMask.show();
    try {
      // store.each((rec) => {
      recsToSearch.forEach((rec) => {
        var doorsNo = rec.get('doorsNo');
        if (!doorsNo) {
          rec.set({
            status: null,
            faceId: null,
            supplierNo: null,
            supplierName: null,
            id_city: null,
            city: null,
            address: null,
            streets: null,
            grp: null,
            ots: null,
            lat: null,
            lon: null,
            angle: null,
            id_catab: null,
            id_size: null,
            supplier_size: null,
            supplier_type: null,
            source: null
          })
          return;
        }
        // var loaded = fSource.findBy((f) => (f.get('doorsNo') == doorsNo));
        var loaded = me.loadedNums[doorsNo];
        if (loaded) {
          var data = loaded.copy(null).getData({persist: true});
          delete data.id;
          data.status = 'Завантажений раніше';
          rec.set(data);
        } else {
          rec.set('status', null)
          dixes.push(doorsNo)
        }
      });
      if (!dixes.length) {
        me.recalcTotals();
        me.loadMask.hide();
        me.recBuffer = {};
        return;
      }
      var size = me.getView().getConfig('maxDixesCount');
      var packets = [];
      for (let i = 0; i <Math.ceil(dixes.length / size); i++){
        packets[i] = dixes.slice((i * size), (i * size) + size);
      }
      Promise.all(packets.map((p) => me.loadFromServerPromise(p)))
        .then((answers) => answers.reduce(function(res, a) { return a ? res.concat(a) : res }, []))
        .then((faces) => {
          // console.log(faces);
          if (!faces || !faces.length) {
            me.recalcTotals();
            me.loadMask.hide();
            return;
          }
          me.searchingDoorsData = true;
          store.each((rec) => {
            var doorsNo = rec.get('doorsNo');
            if (!doorsNo) {
              rec.set('status', null)
              return;
            }
            if (rec.get('status') == 'Завантажений раніше') {
              return;
            }
            var f = faces.find((f) => {return f && (f.doors_no == rec.get('doorsNo'))});
            if (!f) {
              rec.set({
                status: 'Не знайдено',
                faceId: null,
                supplierNo: null,
                supplierName: null,
                id_city: null,
                city: null,
                address: null,
                streets: null,
                grp: null,
                ots: null,
                lat: null,
                lon: null,
                angle: null,
                id_catab: null,
                id_size: null,
                supplier_size: null,
                supplier_type: null,
                source: null
              });
            } else {
              rec.set({
                status: 'Знайдено в Doors',
                faceId: f.id,
                supplierNo: f.supplier_no,
                supplierName: f.supplierName,
                id_city: f.id_city,
                city: f.city,
                address: f.address,
                streets: f.streets,
                grp: f.grp,
                ots: f.ots,
                lat: f.lat,
                lon: f.lon,
                angle: f.angle,
                id_catab: f.id_catab,
                id_size: f.id_size,
                supplier_size: f.supplier_size,
                supplier_type: f.type,
                source: 'doors'
              })
            }
          })
        me.recalcTotals();
        me.searchingDoorsData = false;
        me.loadMask.hide();
        me.recBuffer = {};
      })
    } finally {
      me.searchingDoorsData = false;
    }
  },

  init: function (view) {
    var me = this,
    vm = view.getViewModel(),
    store = vm.getStore('storeDoorsFaces'),
    grid = view.lookup('gridimportfromdoors'),
    // manualNo = view.getManualNo(),
    // inputVariant = view.getInputVariant(),
    data = [];
    me.callParent(view);
    me.recBuffer = {};
    // if (inputVariant) {
    //   vm.set('inputVariant', inputVariant);
    // }
    me.searchingDoorsData = true;
    me.refreshData();
    me.loadMask = new Ext.LoadMask({
      msg    : 'Дані завантажуються, зачекайте...',
      target : grid
    });
    // if (manualNo) {
    //   manualNo.forEach((no, ix)=>{
    //     var rec = store.getAt(ix);
    //     if (!rec) {
    //       rec = store.add({})[0];
    //     }
    //     rec.set({
    //       manualNo: no[0],
    //       faceId: no[1]
    //     });
    //   })
    // }
    var etc = view.etc;
    grid.reconfigure(etc.columns);
    me.initLoaded();
    me.searchingDoorsData = false;
  },

  recalcTotals: function () {
    // console.log('recalcTotals');
    var me = this,
      vm = me.getView().getViewModel(),
      store = vm.getStore('storeDoorsFaces'),
      readyToImport = {},
      deleteCount = 0,
      fSource = Ext.getStore('Faces').getDataSource();
    store.each(function(rec){
      if (rec.get('status') == 'Знайдено в Doors') {
        readyToImport[rec.get('doorsNo')] = 1;
      }
    });
    var recsHash = {};
    store.each((rec) => {
      if (rec.get('doorsNo')) {
        recsHash[rec.get('faceId')] = 1;
      }
    })
    fSource.each((f) => {
      if (f.get('source') == 'doors' && !recsHash[f.getId()]) {
        deleteCount++;
        return true;
      }
    })
    vm.set({
      'readyToImport': Object.keys(readyToImport).length,
      'deleteCount': deleteCount
    });
  },

  onBeforeDestroy: function () {
    Ext.destroy(this.loadMask);
    delete this.loadMask;
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

  initLoaded: function () {
    var me = this,
      view = me.getView(),
      vm = me.getView().getViewModel(),
      store = vm.getStore('storeDoorsFaces'),
      fSource = Ext.getStore('Faces').getDataSource(),
      ix = 0;
    me.loadedNums = {};
    fSource.each((f) => {
      if (f.get('doordNo')) {
        me.loadedNums[f.get('doordNo')] = f;
      }
      if (f.get('source') === 'doors') {
        var rec = store.getAt(ix);
        if (rec) {
          var data = f.clone(null).getData({persist: true});
          delete data.id;
          data.faceId = f.getId();
          data.source = 'doors';
          data.status = 'Завантажений раніше';
          rec.set(data);
          ix++;
        }
      }
    })
  },

  refreshData: function () {
    var me = this,
      view = me.getView(),
      rowsCount = view.getConfig('rowsCount'),
      vm = me.getView().getViewModel(),
      store = vm.getStore('storeDoorsFaces');
    store.beginUpdate();
    store.removeAll();
    var recs = [];
    for(var i = 0; i < rowsCount; i++) {
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

  onImportClick: function () {
    var me = this,
    view = me.getView(),
    vm = me.getViewModel(),
    store = vm.getStore('storeDoorsFaces'),
    faces = {};
    store.each(function(rec){
      if (rec.get('faceId') && Ext.isNumber(rec.get('faceId'))) {
        faces[rec.get('faceId')] = rec.copy(rec.get('faceId'));
      }
    });
    view.fireEventArgs('importfromdoors', [faces]);
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
