Ext.define('Bigmedia.view.FacesViewController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.facesview',

  requires: [
    'Bigmedia.view.dialog.DlgEditCampaign',
    'Bigmedia.view.det.DetPublishedCampaign',
    'Bigmedia.view.dialog.DlgAutoPlan',
    'Bigmedia.view.dialog.DlgImportFromDoors',
    'Bigmedia.view.dialog.DlgOTSData'
  ],
  listen: {
    store: {
      '#ShoppingCart': {
        add: 'onShoppingCartChange',
        remove: 'onShoppingCartChange',
        clear: 'onShoppingCartChange'
      },
      '#Faces': {
        filterchange: 'onStoreFacesFilterChange'
      }
    }
  },

  bindings: {
    onCurCampChange: '{curCamp}',
    onSelStore: '{selstore}',
    onCampPoisChange: '{curCamp.campPois}'
  },

  onAnalyticsClick: function () {
    var dlg = Ext.create('Bigmedia.view.dialog.DlgAnalyticsIFrame');
    dlg.show();
  },

  exportAllPhotosToArchiveClick: function () {
    this.exportToArchive();
  },

  exportToArchive: function (month) {
    var me = this,
      grid = me.lookup('gridPhotos'),
      selected = grid.getSelection(),
      curCamp = me.getViewModel().get('curCamp'),
      now = new Date(),
      url = '/api/v1/campaigns/' + curCamp.get('id') + '/photorecs/',
      fileName = 'photos_' +
        encodeURIComponent(me.cleanFileName(curCamp.get('name'))) + '_' +
        (month ? month.replace(/\//g, '-') : 'all') + '.zip',
      monthly = month ? month + '/' : '';
    if (grid.getStore().getTotalCount() > 0) {
      window.open(url + monthly + fileName, '_blank');
    }
  },

  fillMonthlyExportMenu: function (btn) {
    var me = this,
      store = btn.up('grid').getStore();
    var months = {};
    store.each(function (rec) {
      if (rec.get('photoRecs') && rec.get('photoRecs').length > 0) {
        var dl = rec.get('deadline'),
          mi = Ext.Date.format(dl, 'Y\\-m');
        if (!months[mi]) {
          months[mi] = {
            name: Ext.Date.format(dl, 'F\\\'y'), year: dl.getFullYear(), month: dl.getMonth(),
            count: 1, days: {}
          };
          months[mi].days[dl.getDate()] = { name: Ext.Date.format(dl, 'd\\.m\\.Y'), count: 1 };
        } else {
          months[mi].count++;
          if (months[mi].days[dl.getDate()]) {
            months[mi].days[dl.getDate()].count++;
          } else {
            months[mi].days[dl.getDate()] = { name: Ext.Date.format(dl, 'd\\.m\\.Y'), count: 1 };
          }
        }
      }
    });
    var items = Object.keys(months).sort().reverse().map(function (m) {
      var month = months[m],
        days = Object.keys(month.days).sort(function (a, b) { return a > b ? 1 : a < b ? -1 : 0; }).map(function (d) {
          return { text: month.days[d].name + ' (' + month.days[d].count + ')', day: d };
        });
      return {
        text: months[m].name + ' (' + months[m].count + ')',
        menu: new Ext.menu.Menu({
          items: days.length > 1 ? new Array({ text: 'All' }).concat(days) : days,
          year: months[m].year,
          month: months[m].month,
          plain: true,
          listeners: {
            click: function (menu, item) {
              if (item) {
                me.exportToArchive(menu.year + '/' + (menu.month + 1).toString() + (item.day ? '/' + item.day : ''));
              }
            }
          }

        })
      };
    });
    var menu = new Ext.menu.Menu({
      items: items,
      plain: true
    });
    btn.setMenu(menu);
    btn.showMenu();
  },

  transliterateFileName: function (str) {
    var a = { "Ё": "YO", "Й": "I", "Ц": "TS", "У": "U", "К": "K", "Е": "E", "Н": "N", "Г": "G", "Ш": "SH", "Щ": "SCH", "З": "Z", "Х": "H", "Ъ": "'", "ё": "yo", "й": "i", "ц": "ts", "у": "u", "к": "k", "е": "e", "н": "n", "г": "g", "ш": "sh", "щ": "sch", "з": "z", "х": "h", "ъ": "'", "Ф": "F", "Ы": "I", "В": "V", "А": "a", "П": "P", "Р": "R", "О": "O", "Л": "L", "Д": "D", "Ж": "ZH", "Э": "E", "ф": "f", "ы": "i", "в": "v", "а": "a", "п": "p", "р": "r", "о": "o", "л": "l", "д": "d", "ж": "zh", "э": "e", "Я": "Ya", "Ч": "CH", "С": "S", "М": "M", "И": "I", "Т": "T", "Ь": "'", "Б": "B", "Ю": "YU", "я": "ya", "ч": "ch", "с": "s", "м": "m", "и": "i", "т": "t", "ь": "'", "б": "b", "ю": "yu", "Ї": "YI", "ї": "yi", "Є": "YE", "є": "ye", "І": "I", "і": "i" };

    function transliterateWord(word) {
      return word.split('').map(function (ch) {
        return a[ch] || ch;
      }).join("");
    }

    return str.split(' ').map(function (word) {
      return transliterateWord(word);
    }).join('_');
  },

  cleanFileName: function (fn) {
    return fn.replace(/[\*\|\\\:\"<>\?\/]/g, '');
  },

  onLinkPoiRulesChanged: function () {
    var me = this,
      mapView = me.lookupReference('mapFaces');
    me.getView().lookupViewModel().set('maximumfaces', me.lookup('dlglinkfacestopoisettings').getMaximumFaces());
    Ext.callback(mapView.getController().onFormatsRulesRefresh, mapView.getController());
  },

  onPrevVersionClick: function () {
    window.open('www.bigmedia.ua/old/#campaigns', '_blank');
  },

  onImportFromDoorsClick: function () {
    var dlg = Ext.create('Bigmedia.view.dialog.DlgImportFromDoors');
    dlg.on('importfromdoors', function (doorsfaces) {
      fStore = Ext.getStore('Faces');
      var toRemove = [], toAdd = [];
      fStore.each((f) => {
        if (f.get('source') == 'doors') {
          if (!doorsfaces[f.getId()]) {
            toRemove.push(f);
          } else {
            f.set('price', doorsfaces[f.getId()].get('price'));
          }
        }
      });
      Object.keys(doorsfaces).forEach((faceId) => {
        if (!fStore.getById(faceId)) {
          toAdd.push(doorsfaces[faceId]);
        }
      })
      fStore.remove(toRemove);
      fStore.add(toAdd);
      Bigmedia.Vars.updateFacesFinalPrice();
    }, { single: true });
    dlg.show();
  },

  onOTSFilterClick: function () {
    var dlg = Ext.create('Bigmedia.view.dialog.DlgOTSData');
    dlg.show();
  },

  onClearFiltersClick: function () {
    var me = this,
      vm = me.getViewModel();
    Ext.Msg.confirm({
      title: 'Зняти фільтри',
      message: 'Скинути всі фільтри?',
      buttons: Ext.Msg.YESNO,
      icon: Ext.Msg.QUESTION,
      fn: function (btn) {
        if (btn === 'yes') {
          var grid = me.lookup('gridFaces'),
            store = grid.getStore(),
            filters = store.getFilters();
          filters.beginUpdate();
          try {
            store.getFilters().each((filter) => {
              if (filter.isGridFilter) {
                store.removeFilter(filter);
              }
            });
            vm.set('filterPoi', false);
            vm.set('manualNoFiltered', false);
            grid.filters.clearFilters();
          } finally {
            filters.endUpdate();
          }
        }
      }
    });
  },

  onRemoveCampaignClick: function () {
    var me = this,
      vm = me.getViewModel();
    Ext.Msg.confirm({
      title: Bigmedia.Locales.campViewConfirmDeleteCampaignTitle,
      message: Bigmedia.Locales.campViewConfirmDeleteCampaignMessage,
      buttons: Ext.Msg.YESNO,
      icon: Ext.Msg.QUESTION,
      fn: function (btn) {
        if (btn === 'yes') {
          var curCamp = vm.get('curCamp');
          store = Ext.getStore('Campaigns');
          store.remove(curCamp);
          store.sync({
            success: function () {
              Bigmedia.Vars.toastSuccess('Кампанія видалена');
              vm.set('curCamp', store.first());
            },
            failure: function () {
              Bigmedia.Vars.toastFailure('Виникли помилки при видаленні кампанії.');
            }
          });
        }
      }
    });
  },

  onAutoPlanClick: function () {
    var me = this;
    var dlg = Ext.create('Bigmedia.view.dialog.DlgAutoPlan', {
      closeAction: 'destroy',
      // listeners: {
      //   finished: me.addPlannedFaces
      // }
    });
    dlg.on('finished', me.addPlannedFaces, me);
    dlg.show();
  },

  addPlannedFaces: function (faces) {
    // console.log(faces);
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      toAdd = [],
      savePrice = vm.get('savePrice'),
      useEncryption = vm.get('useEncryption'),
      group = Bigmedia.Vars.getCurrentRulesGroup(),
      pubCamp = vm.get('pubCamp'),
      salt;
    if (pubCamp && pubCamp.get('cryptoHash')) {
      salt = Bigmedia.Vars.getPubPassphrase(curCamp.get('publishedId'));
    }
    faces.forEach((record) => {
      var proposal = Ext.Object.merge(Ext.clone(record.getData()),
        {
          id: null,
          faceId: record.getId(),
          startDate: curCamp.get('filterPeriod').startDate,
          endDate: curCamp.get('filterPeriod').endDate,
          operationId: 1
        }
      );
      if (useEncryption) {
        var priceEnc = savePrice ? Bigmedia.Vars.encryptPrice(Bigmedia.Vars.getSalt(record.get('campaignId')), record.get('finalPrice')) : null;
        // console.log(priceEnc);
        proposal.supplierPriceEnc = priceEnc;
        proposal.supplierPrice = null;
      } else {
        proposal.supplierPrice = savePrice ? record.get('finalPrice') : null;
        proposal.supplierPriceEnc = null;
      }
      if (pubCamp && record.get('finalPrice') && group) {
        var clientPrice = group.getFaceMonthClientPrice({
          faceId: record.getId(),
          netCost: record.get('finalPrice')
        });
        if (pubCamp.get('cryptoHash')) {
          if (salt) {
            proposal.pubPriceEnc = Bigmedia.Vars.encryptPrice(salt, clientPrice);
          }
        } else {
          proposal.pubPrice = clientPrice;
        }
      }
      toAdd.push(proposal);
    });
    if (toAdd.length > 0) {
      curCamp.proposals().add(toAdd);
    }
  },

  onBeforeToggleFilterByNumber: function (btn, pressed) {
    var me = this,
      vm = me.getViewModel(),
      store = Ext.getStore('Faces'),
      curCamp = vm.get('curCamp'),
      campFilters = curCamp.get('filters'),
      manualFilter = campFilters ? campFilters.filter_manual_no : null;
    if (pressed) {
      if (manualFilter) {
        var filter = new Ext.util.Filter({
          id: 'filter_manual_no',
          property: 'id',
          operator: 'in',
          value: manualFilter.manual_no.map((mn) => mn[1])
        });
        filter.inputVariant = manualFilter.inputVariant;
        filter.manual_no = manualFilter.manual_no;
        Ext.getStore('Faces').addFilter(filter);
      } else {
        me.showManualNoDialog();
      }
    } else if (store.getFilters().getByKey('filter_manual_no')) {
      store.removeFilter('filter_manual_no');
    }
  },

  onSetupFilterByNumber: function () {
    var me = this,
      vm = me.getViewModel();
    if (!vm.get('manualNoFiltered')) {
      vm.set('manualNoFiltered', true);
      return;
    }
    me.showManualNoDialog();
  },

  showManualNoDialog: function () {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      campFilters = curCamp.get('filters'),
      manualFilter = campFilters ? campFilters.filter_manual_no : null,
      store = Ext.getStore('Faces');
    var dlg = new Bigmedia.view.dialog.DlgFilterByNumber({
      inputVariant: manualFilter ? manualFilter.inputVariant : 'supplierNo',
      manualNo: manualFilter ? manualFilter.manual_no : null,
      listeners: {
        createfilter: function (faces, inputVariant) {
          var filter = new Ext.util.Filter({
            id: 'filter_manual_no',
            property: 'id',
            operator: 'in',
            value: faces.map((f) => f.get('faceId'))
          });
          filter.inputVariant = inputVariant;
          filter.manual_no = faces.map((f) => [f.get('manualNo'), f.get('faceId')]);
          Ext.getStore('Faces').addFilter(filter);
        },
        close: function () {
          if (!store.getFilters().getByKey('filter_manual_no')) {
            vm.set('manualNoFiltered', false);
          }
        }
      }
    });
    dlg.show();
  },

  onExportToExcelClick: function (btn) {
    var me = this,
      tabPanel = me.lookup('maintabpanel'),
      activeTab = tabPanel.getActiveTab();
    me.exportToExcel(btn, activeTab.down('grid'), 'bma.xlsx', true, true);
  },

  bulkAddPubPrices: function (records, pubCamp) {
    var me = this,
      curCamp = me.getViewModel().get('curCamp'),
      proposals = [], salt;
    records.forEach(function (rec) {
      proposals.push('<proposal id="' + rec.id + '" price_encrypted = "' + rec.pubPriceEnc + '" price = "' + rec.pubPrice + '"></proposal>');
    });
    var formData = new FormData();
    formData.append('proposals', proposals.join(''));
    var request = new XMLHttpRequest();
    request.onload = function () {
      curCamp.proposals().load();
    }
    request.open("POST", '/api/v1/published/campaigns/' + encodeURIComponent(pubCamp.getId()) + '/bulkAddPubPrices');
    request.send(formData);
  },

  updatePubPricesByDiscountGroup: function (pubCamp) {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      proposals = [],
      group = Bigmedia.Vars.getCurrentRulesGroup(),
      salt;
    if (pubCamp.get('cryptoHash')) {
      salt = Bigmedia.Vars.getPubPassphrase(pubCamp.getId());
      if (!salt) {
        return;
      }
    }
    curCamp.proposals().each((p) => {
      var proposal = { id: p.getId() };
      if (pubCamp && p.get('netCost') && group) {
        var clientPrice = group.getFaceMonthClientPrice({
          faceId: p.get('faceId'),
          netCost: p.get('netCost')
        });
        if (pubCamp.get('cryptoHash')) {
          if (salt) {
            proposal.pubPriceEnc = Bigmedia.Vars.encryptPrice(salt, clientPrice);
            proposal.pubPrice = '';
          }
        } else {
          proposal.pubPrice = clientPrice;
          proposal.pubPriceEnc = '';
        }
      }
      if (clientPrice && (proposal.pubPriceEnc || proposal.pubPrice)) {
        proposals.push(proposal);
      }
    });
    me.bulkAddPubPrices(proposals, pubCamp);
  },

  onGetPresentationClick: function () {
    var me = this,
      curCamp = me.getViewModel().get('curCamp'),
      dlg = Ext.create('Bigmedia.view.det.DetPublishedCampaign', {
        campaignId: curCamp.getId(),
        publishedId: curCamp.get('publishedId'),
        listeners: {
          save: function (publishedCamp) {
            Ext.getApplication().getMainView().getViewModel().set('pubCamp', publishedCamp);
            me.updatePubPricesByDiscountGroup(publishedCamp);
          }
        }
      });
    dlg.show();
  },

  onCampPoisChange: function (poiStore) {
    this.lookup('mapFaces').setPoiStore(poiStore);
  },

  onUseEncryptionBeforeToggle: function (btn, pressed) {
    if (!pressed) {
      return true;
    }
    var me = this,
      curCamp = me.getViewModel().get('curCamp'),
      campaignId = (curCamp && !curCamp.phantom) ? curCamp.getId() : null;
    if (!Bigmedia.Vars.getSalt(campaignId)) {
      Bigmedia.Vars.showPriceEncryptDialog(campaignId, function () {
        btn.setPressed(true);
      });
      return false;
    }
  },

  onEditSaltClick: function () {
    var me = this,
      curCamp = me.getViewModel().get('curCamp');
    campaignId = (curCamp && !curCamp.phantom) ? curCamp.getId() : null;
    Bigmedia.Vars.showPriceEncryptDialog(campaignId);
  },

  onAddProposalsClick: function () {
    var me = this,
      vm = me.getViewModel(),
      selStore = vm.getStore('selstore'),
      curCamp = vm.get('curCamp'),
      toAdd = [],
      savePrice = vm.get('savePrice'),
      useEncryption = vm.get('useEncryption'),
      group = Bigmedia.Vars.getCurrentRulesGroup(),
      pubCamp = vm.get('pubCamp'),
      salt;
    if (pubCamp && pubCamp.get('cryptoHash')) {
      salt = Bigmedia.Vars.getPubPassphrase(curCamp.get('publishedId'));
    }
    selStore.each((record) => {
      var proposal = Ext.Object.merge(Ext.clone(record.getData()),
        {
          id: null,
          faceId: record.getId(),
          startDate: curCamp.get('filterPeriod').startDate,
          endDate: curCamp.get('filterPeriod').endDate,
          operationId: 1
        }
      );
      if (useEncryption) {
        var priceEnc = savePrice ? Bigmedia.Vars.encryptPrice(Bigmedia.Vars.getSalt(record.get('campaignId')), record.get('finalPrice')) : null;
        // console.log(priceEnc);
        proposal.supplierPriceEnc = priceEnc;
        proposal.supplierPrice = null;
      } else {
        proposal.supplierPrice = savePrice ? record.get('finalPrice') : null;
        proposal.supplierPriceEnc = null;
      }
      if (pubCamp && record.get('finalPrice') && group) {
        var clientPrice = group.getFaceMonthClientPrice({
          faceId: record.getId(),
          netCost: record.get('finalPrice')
        });
        if (pubCamp.get('cryptoHash')) {
          if (salt) {
            proposal.pubPriceEnc = Bigmedia.Vars.encryptPrice(salt, clientPrice);
          }
        } else {
          proposal.pubPrice = clientPrice;
        }
      }
      toAdd.push(proposal);
    });
    if (toAdd.length > 0) {
      curCamp.proposals().on({
        saved: {
          fn: function () {
            var grid = me.lookup('gridFaces'),
              mainTabPanel = me.lookup('maintabpanel'),
              campTab = me.lookup('tabshoppingcart');
            mainTabPanel.setActiveTab(campTab);
            grid.getSelectionModel().deselectAll();
          },
          scope: me,
          single: true
        }
      })
      curCamp.proposals().add(toAdd);
    }
  },

  onSelStore: function (selStore) {
    var me = this,
      grid = me.lookupReference('gridFaces'),
      vm = me.getViewModel();
    grid.on('selectionchange', function (selModel, selected) {
      selStore.addFilter(new Ext.util.Filter({
        id: 'filter_selected',
        filterFn: function (face) {
          return selected.find((f) => f.getId() === face.getId())
        }
      }));
    });
  },

  onStoreFacesFilterChange: function (store) {
    // console.log('store',store)
    var me = this,
      storeFilters = [],
      curCamp = me.getViewModel().get('curCamp'),
      campFilters = curCamp && curCamp.get('filters') ? Ext.clone(curCamp.get('filters')) : {};
    // console.log(campFilters);
    if (!curCamp) {
      return;
    }
    store.getFilters().each((filter) => {
      if (filter.isGridFilter) {
        var config = {
          id: filter.getId(),
          property: filter.getProperty(),
          operator: filter.getOperator(),
          value: filter.getValue(),
          isGridFilter: true
        }
        storeFilters.push(config);
      }
      if (filter.getId() === 'filter_period') {
        storeFilters.push({ id: filter.getId(), startDate: filter.startDate, endDate: filter.endDate, disabled: filter.disabled, wholePeriod: filter.wholePeriod });
      }
      if (filter.getId() === 'filter_manual_no') {
        storeFilters.push({ id: filter.getId(), inputVariant: filter.inputVariant, manual_no: filter.manual_no });
      }
    });
    function isEqualGridFilter(filter1, filter2) {
      if (filter1.property !== filter2.property) {
        return false;
      }
      if (filter1.operator !== filter2.operator) {
        return false;
      }
      if (filter1.value === filter2.value) {
        return true;
      }
      if (Ext.isArray(filter1.value) && Ext.isArray(filter2.value)) {
        return Ext.Array.equals(filter1.value, filter2.value);
      }
      return false;
    }
    function isEqualPeriodFilter(filter1, filter2) {
      return +filter1.startDate === +filter2.startDate && +filter1.endDate === +filter2.endDate && filter1.disabled == filter2.disabled && filter1.wholePeriod == filter2.wholePeriod;
    }
    function isEqualManualNoFilter(filter1, filter2) {
      if (filter1.inputVariant !== filter2.inputVariant) {
        return false
      }
      if (Ext.isArray(filter1.manual_no) && Ext.isArray(filter2.manual_no)) {
        if (filter1.manual_no.length != filter2.manual_no.length) {
          return false;
        }
        for (var i = 0; i < filter1.manual_no.length; i++) {
          if (!Ext.Array.equals(filter1.manual_no[i], filter2.manual_no[i])) {
            return false;
          }
        }
        return true;
      }
      return false;
    }
    var wasDeleted = false;
    //filter((id)=>campFilters[id].isGridFilter).
    Object.keys(campFilters).forEach((id) => {
      if (!storeFilters.find(function (sFilter) { sFilter.id === id })) {
        wasDeleted = true;
        if (id != 'filter_manual_no') {
          delete campFilters[id];
        } else {
          // save disabled filter by number
          campFilters[id].disabled = true;
        }
      }
    });
    if (storeFilters.some(function (sFilter) {
      return (sFilter.isGridFilter && !Object.values(campFilters).find((cFilter) => {
        return isEqualGridFilter(sFilter, cFilter);
      })) || (sFilter.startDate && !Object.values(campFilters).find((cFilter) => {
        return isEqualPeriodFilter(sFilter, cFilter);
      })) || (sFilter.manual_no && !Object.values(campFilters).find((cFilter) => {
        return isEqualManualNoFilter(sFilter, cFilter);
      }));
    }) || wasDeleted) {
      storeFilters.forEach((sFilter) => {
        campFilters[sFilter.id] = sFilter;
      });
      curCamp.set('filters', campFilters);
      if (!curCamp.phantom || curCamp.proposals().getDataSource().getCount() > 0) {
        curCamp.save();
      }
    }
  },

  onShowAllToggle: function (btn, state) {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp');
    me.onDateRangePeriodChanged({
      startDate: curCamp.get('filterPeriod').startDate, endDate: curCamp.get('filterPeriod').endDate,
      disabled: state, wholePeriod: curCamp.get('filterPeriod').wholePeriod
    });
    // btn.up('menu').hide();
  },
  onDateRangePeriodChanged: function (period) {
    var me = this,
      vm = me.getViewModel();
    var curCamp = vm.get('curCamp');
    //console.log(!curCamp.get('filters'));
    if (!curCamp.get('filters')) {
      curCamp.set('filters', {
        filter_period: {
          startDate: period.startDate,
          endDate: period.endDate,
          disabled: period.disabled,
          wholePeriod: period.wholePeriod
        }
      });
    } else {
      var filters = Ext.clone(curCamp.get('filters'));
      filters.filter_period = {
        startDate: period.startDate,
        endDate: period.endDate,
        disabled: period.disabled,
        wholePeriod: period.wholePeriod
      };
      curCamp.set('filters', filters);
    }
    console.log('filters->period->',filters,period);
    me.updatePeriodFilter(period);
  },

  updatePeriodFilter: function (period) {
    // console.log('updatePeriodFilter: %o', period);
    var store = Ext.getStore('Faces'),
      filters = store.getFilters();
    var periodFilter = filters.getByKey('filter_period');
    if (periodFilter && +periodFilter.startDate === +period.startDate && +periodFilter.endDate === +period.endDate && periodFilter.disabled == period.disabled && periodFilter.wholePeriod == period.wholePeriod) {
      return;
    }
    try {
      var wholePeriod = !!period.wholePeriod,
        minFreeDays = 14,
        allowTempRes = true,
        now = new Date(),
        minDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
        checkedStart = (+period.startDate < +minDate) ? minDate : period.startDate,
        checkedEnd = (+period.endDate < +minDate) ? minDate : period.endDate,
        daysToBeg = Math.round((checkedStart - minDate) / (3600 * 24 * 1000)),
        daysPeriod = Math.round((checkedEnd - checkedStart) / (3600 * 24 * 1000));
      if (daysToBeg < 0) {
        daysToBeg = 0;
      }
      var res,
        re = /(\d+)(\w)/g;
      var freeRe = new RegExp('^' + (wholePeriod ? '' : '.*?') + '(' + (allowTempRes ? '[tf]' : 'f') + (wholePeriod ? ')+$' : '{' + minFreeDays + '})'));
      var fltr = new Ext.util.Filter({
        id: 'filter_period',
        filterFn: function (rec) {
          if (period.disabled) { return true; }
          var occ = rec.get('occByDays');
          return !occ || freeRe.test(occ.substring(daysToBeg, daysToBeg + daysPeriod));
        }
      });
      fltr.startDate = period.startDate;
      fltr.endDate = period.endDate;
      fltr.disabled = period.disabled;
      fltr.wholePeriod = period.wholePeriod;
      // filters.add(fltr);
      store.addFilter(fltr);
    } catch (e) {
      console.log(e);
    } finally {
    }
  },

  updateManualNoFilter: function (manual_no, inputVariant) {
    var store = Ext.getStore('Faces'),
      sStore = Ext.getStore('Sides'),
      ids = manual_no.map((mn) => mn[1]).filter((id) => !!id);
    var fltr = new Ext.util.Filter({
      id: 'filter_manual_no',
      property: 'id',
      operator: 'in',
      value: ids,
      // filterFn: function (rec) {
      //   return manual_no.some((n)=>rec.getId() === n[1]);
      // }
    });
    fltr.manual_no = manual_no;
    fltr.inputVariant = inputVariant;
    store.addFilter(fltr);
  },
  onCurCampChange: function (newVal, oldVal) {
    console.log('onCurCampChange',newVal, oldVal)
    var me = this,
      grid = me.lookup('gridFaces'),
      store = grid.getStore(),
      filters = store.getFilters(),
      dateRange = me.lookup('daterange');
    filters.beginUpdate();
    try {
      me.columnsIniting = true;
      if (newVal && newVal.get('filterPeriod')) {
        // console.log('here');
        if (dateRange) {
          dateRange.updatePeriod({
            startDate: newVal.get('startDate'),
            endDate: newVal.get('endDate')
          });
        }
        var period = newVal.get('filterPeriod');
        me.updatePeriodFilter(period);
      }
      if (!newVal || !oldVal) {
        return;
      }
      grid.filters.clearFilters();
      var toAdd = [];
      if (newVal.get('filters') && Object.keys(newVal.get('filters')).length > 0) {
        var mnFilter = newVal.get('filters')['filter_manual_no'];
        if (mnFilter && !mnFilter.disabled) {
          me.updateManualNoFilter(mnFilter.manual_no, mnFilter.inputVariant);
        }
        Object.values(newVal.get('filters')).filter((f) => f.isGridFilter).forEach((filter) => {
          var dataIndex = filter.property;
          var column = grid.columnManager.getHeaderByDataIndex(dataIndex);
          if (column) {
            var type = 'string';
            if (filter.operator === 'in' || Array.isArray(filter.value)) {
              type = 'list'
            } else if (typeof filter.value == 'boolean') {
              type = 'boolean'
            } else if (typeof filter.value == 'number' && ['eq', 'lt', 'gt'].indexOf(filter.operator) >= 0) {
              type = 'number'
            }
            var f = {
              grid: grid,
              owner: grid.filters,
              column: column,
              type: type
            }
            var gf = Ext.Factory.gridFilter(f);
            if (type == 'number') {
              gf.filter[filter.operator].setValue(filter.value);
            } else {
              gf.filter.setValue(filter.value);
            }
            gf.active = true;
            column.addCls('x-grid-filters-filtered-column');
            toAdd.push(gf);
          }
        });
        grid.filters.addFilter(toAdd);
        grid.filters.applyFilters(store);
      }
    } catch (e) {
      console.log('error during filters initalization: %o', e);
    } finally {
      filters.endUpdate();
      me.columnsIniting = false;
    }
  },

  init: function (view) {
    var me = this,
      grid = me.lookupReference('gridFaces'),
      gridCart = me.lookupReference('gridCart'),
      gridSelected = me.lookup('gridSelected'),

      mapView = me.lookupReference('mapFaces'),
      detFace = me.lookup('detface'),
      detSchema = me.lookup('detschema'),
      monitoringGrid =  me.lookupReference('monitoringGrid'),
      //gridMonitoring = me.lookupReference('gridMonitoring'),
      // detmonitoring = me.lookup('detmonitoring'),
      vm = me.getViewModel();
    me.callParent(view);
    //console.log('monitoringGrid->',monitoringGrid);
    //console.log('periodMonitoring->',periodMonitoring);
    mapView.getMap().setGrid(grid);
    mapView.getMap().setGridMoitoring(monitoringGrid);
    mapView.getMap().setCartGrid(gridCart);
    mapView.getMap().setSelGrid(gridSelected);
    mapView.setPoiStore(Ext.getStore('Pois'));
    //mapView.setKSPolygonsStore(Ext.getStore('KSPolygons'));
    mapView.setCityPolygonStore(Ext.getStore('CityPolygon'));
    grid.setMapView(mapView);
    monitoringGrid.setMapView(mapView);
    gridCart.setMapView(mapView);
    // grid.setDetFace(detFace);
    // gridCart.setDetFace(detFace);
    Ext.defer(function () {
      mapView.getMap().setSelStore(vm.getStore('selstore'));
      mapView.setDetFace(detFace);
      detSchema.setMap(mapView.getMap());
    }, 500);
  },

  onEditCampaignClick: function () {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      campClone = curCamp.copy(null);
    var dlg = Ext.create('Bigmedia.view.dialog.DlgEditCampaign', {
      modal: true,
      closeAction: 'destroy',
      camp: campClone,
      listeners: {
        dialogcancelled: function () {
          campClone.destroy();
        },
        campaignchanged: function (camp) {
          curCamp.set({
            name: camp.get('name'),
            startDate: camp.get('startDate'),
            endDate: camp.get('endDate')
          });
          curCamp.save({ //getStore().sync
            failure: function (record, operation) {
              console.error('failed to save campaign');
              Bigmedia.Vars.toastFailure('Помилка збереження кампанії');
            },
            success: function (record, operation) {
              Bigmedia.Vars.toastSuccess('Кампанія збережена');
              // var campStore = Ext.getStore('Campaigns');
              dlg.close();
              campClone.destroy();
            }
          });
        }
      }
    });
    dlg.show();
  },

  exportToExcel: function (btn, grid, filename, exportOccupancy, exportPois) {
    Ext.MessageBox.show({
      msg: Bigmedia.Locales.exportExcelSavingData,
      progressText: Bigmedia.Locales.exportExcelProgressText,
      width: 300,
      wait: {
        interval: 200
      },
      animateTarget: btn
    });

    var me = this;

    if (window.Worker) {
      Bigmedia.GridExport.exportToExcel(grid, filename, function () {
        Ext.MessageBox.hide();
        Bigmedia.Vars.toastSuccess(Bigmedia.Locales.exportExcelDone);
        Bigmedia.Vars.toastSuccess(Bigmedia.Locales.exportExcelFileSaved);
      }, exportOccupancy, exportPois);
    } else {
      me.timer = Ext.defer(function () {
        Bigmedia.GridExport.exportToExcel(grid, filename, function () {
        }, exportOccupancy, exportPois);
        me.timer = null;
        Ext.MessageBox.hide();
        Bigmedia.Vars.toastSuccess(Bigmedia.Locales.exportExcelDone);
        Bigmedia.Vars.toastSuccess(Bigmedia.Locales.exportExcelFileSaved);
      }, 3000);
    }
  },

  onFacesGridSelectionChange: function (grid) {
    // console.log('onFacesGridSelectionChange',grid)
    var me = this,
      tabPanel = me.lookup('maintabpanel');
    if (grid.getSelection().length > 0) {

    }
  },
  onMonitoringGridSelectionChange: function (grid) {
    var me = this,
      tabPanel = me.lookup('monitoringGrid');
    console.log('onMonitoringGridSelectionChange++')
    // if (grid.getSelection().length > 0) {

    // }
  },
  onMonitoringGridShow: function (grid) {
    var me = this,
      tabPanel = me.lookup('monitoringGrid');
    console.log('onMonitoringGridShow+++')
    // if (grid.getSelection().length > 0) {

    // }
  },
  onMonitoringGridHide: function (grid) {
    var me = this,
      tabPanel = me.lookup('monitoringGrid');
    console.log('onMonitoringGridHide---')
    // if (grid.getSelection().length > 0) {

    // }
  },
  onShoppingCartChange: function (store) {
    var me = this,
      tab = me.lookup('tabshoppingcart'),
      count = store.getCount();
    if (count === 0) {
      tab.setTitle(Bigmedia.Locales.tabCartTitle);
    } else {
      tab.setTitle(Bigmedia.Locales.tabCartTitle + '<span class="tabcart-badge">' + count + '</span>');
    }
  },

  onFilterSetCollapse: function (fieldset) {
    var refItem = fieldset.items.get(0);
    if (fieldset.items.length > 1) {
      //var grp = fieldset.items.get(0),
      //    ots = fieldset.items.get(1);
      refItem.targetStore.removeFilter('filter_min_grp');
      refItem.targetStore.removeFilter('filter_max_grp');
      refItem.targetStore.removeFilter('filter_min_ots');
      refItem.targetStore.removeFilter('filter_max_ots');
    } else {
      if (refItem && refItem.targetStore) {
        refItem.targetStore.removeFilter('filter' + refItem.filterField);
      }
    }
  },

  onFilterSetExpand: function (fieldset) {
    var refItem = fieldset.items.get(0);
    if (fieldset.items.length > 1) {
      var grp = fieldset.items.get(0),
        ots = fieldset.items.get(1);
      grp.applyFilters();
      ots.applyFilters();
    } else if (refItem && refItem.targetStore) {
      refItem.fireEvent('change', refItem, refItem.getValue(), []);
    }
  }

});
